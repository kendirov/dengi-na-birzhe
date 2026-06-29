import type { MarketInstrumentRaw } from "@/lib/data/types";
import { DEFAULT_MARKET_COMMISSION_RATE } from "@/lib/screener/commission";
import { calculateEntryCost } from "@/lib/screener/calculator";
import { isFundLikeInstrument } from "@/lib/screener/etf";
import { calculateOrderBookScore } from "@/lib/screener/order-book";
import { clamp, percentileRank } from "@/lib/screener/percentile";

interface ScoreContext {
  turnoverRanks: number[];
  tradesRanks: number[];
  spreadPctRanks: number[];
  spreadRubRanks: number[];
  spreadTicksRanks: number[];
  lotValueRanks: number[];
  dayRangeRanks: number[];
  tickValueRanks: number[];
  entryCostRanks: number[];
  hasSpreadData: boolean[];
}

function lotValueOf(inst: MarketInstrumentRaw): number {
  return inst.price * inst.lotSize;
}

function spreadPctOf(inst: MarketInstrumentRaw): number | null {
  if (inst.spreadRub === null || inst.price <= 0) return null;
  return (inst.spreadRub / inst.price) * 100;
}

function spreadTicksOf(inst: MarketInstrumentRaw): number | null {
  if (inst.spreadRub === null || inst.tickSize === null || inst.tickSize <= 0) {
    return null;
  }
  return inst.spreadRub / inst.tickSize;
}

function tickValueRubOf(inst: MarketInstrumentRaw): number | null {
  if (inst.tickSize === null) return null;
  return inst.tickSize * inst.lotSize;
}

function dayRangeOf(inst: MarketInstrumentRaw): number {
  return inst.dayRangePct ?? 0;
}

function hasHistoricalBaseline(inst: MarketInstrumentRaw): boolean {
  return inst.avgTurnover20d !== null && inst.avgTurnover20d > 0;
}

function buildContext(instruments: MarketInstrumentRaw[]): ScoreContext {
  const spreadPctValues = instruments
    .map((i) => spreadPctOf(i))
    .filter((v): v is number => v !== null);
  const spreadRubValues = instruments
    .map((i) => i.spreadRub)
    .filter((v): v is number => v !== null);
  const spreadTicksValues = instruments
    .map((i) => spreadTicksOf(i))
    .filter((v): v is number => v !== null);
  const tickValueValues = instruments
    .map((i) => tickValueRubOf(i))
    .filter((v): v is number => v !== null);

  const turnoverRanks = instruments.map((i) => i.turnoverRub);
  const tradesRanks = instruments.map((i) => i.trades);
  const spreadPctRanks = instruments.map(
    (i) => spreadPctOf(i) ?? medianOrZero(spreadPctValues),
  );
  const spreadRubRanks = instruments.map(
    (i) => i.spreadRub ?? medianOrZero(spreadRubValues),
  );
  const spreadTicksRanks = instruments.map(
    (i) => spreadTicksOf(i) ?? medianOrZero(spreadTicksValues),
  );
  const lotValueRanks = instruments.map((i) => lotValueOf(i));
  const dayRangeRanks = instruments.map((i) => dayRangeOf(i));
  const tickValueRanks = instruments.map(
    (i) => tickValueRubOf(i) ?? medianOrZero(tickValueValues),
  );
  const hasSpreadData = instruments.map(
    (i) => i.spreadRub !== null && spreadPctOf(i) !== null,
  );
  const entryCostRanks = instruments.map((i) => {
    const spread = i.spreadRub ?? 0;
    const { entryCostRub } = calculateEntryCost(
      spread,
      i.lotSize,
      lotValueOf(i),
      DEFAULT_MARKET_COMMISSION_RATE,
    );
    return entryCostRub;
  });

  return {
    turnoverRanks,
    tradesRanks,
    spreadPctRanks,
    spreadRubRanks,
    spreadTicksRanks,
    lotValueRanks,
    dayRangeRanks,
    tickValueRanks,
    entryCostRanks,
    hasSpreadData,
  };
}

function toOrderBookScoreInput(
  inst: MarketInstrumentRaw,
  lotValue: number,
  tickVal: number | null,
  spreadTicksVal: number | null,
) {
  const spreadPct =
    inst.spreadRub !== null && inst.price > 0
      ? (inst.spreadRub / inst.price) * 100
      : null;
  return {
    ticker: inst.ticker,
    name: inst.name,
    price: inst.price,
    lotSize: inst.lotSize,
    lotValue,
    tickSize: inst.tickSize,
    tickValueRub: tickVal,
    spreadRub: inst.spreadRub,
    spreadPct,
    spreadTicks: spreadTicksVal,
    turnoverRub: inst.turnoverRub,
    trades: inst.trades,
    bid: inst.bid,
    ask: inst.ask,
    entryCostMarketTicks: null,
    commissionMarketTicks: null,
  };
}

function orderBookContextFromScoreContext(ctx: ScoreContext) {
  return {
    tradesRanks: ctx.tradesRanks,
    turnoverRanks: ctx.turnoverRanks,
    spreadPointsRanks: ctx.spreadTicksRanks,
    lotValueRanks: ctx.lotValueRanks,
    tickValueRanks: ctx.tickValueRanks,
    spreadPctRanks: ctx.spreadPctRanks,
  };
}

function tightSpreadQuality(
  inst: MarketInstrumentRaw,
  spreadPctRank: number,
): number {
  const points = spreadTicksOf(inst);
  const spreadPct = spreadPctOf(inst);
  const hasSpread = inst.spreadRub !== null && spreadPct !== null;

  let score: number;
  if (points !== null) {
    if (points <= 1) score = 98;
    else if (points <= 2) score = 92;
    else if (points <= 4) score = 78;
    else if (points <= 6) score = 62;
    else if (points <= 10) score = 45;
    else score = clamp(35 - (points - 10) * 2);
  } else if (spreadPct !== null) {
    score = clamp(100 - spreadPctRank);
  } else {
    score = 38;
  }

  if (!hasSpread) score = clamp(score * 0.72);
  return clamp(score);
}

function medianOrZero(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export interface ComputedScores {
  liquidityScore: number;
  spreadScore: number;
  technicalScore: number;
  spreadTradingScore: number;
  beginnerScore: number;
  inPlayScore: number;
  dangerousScore: number;
  zigzagScore: number;
  hasHistoricalBaseline: boolean;
}

export function computeScores(
  inst: MarketInstrumentRaw,
  ctx: ScoreContext,
): ComputedScores {
  const turnoverPct = percentileRank(inst.turnoverRub, ctx.turnoverRanks);
  const tradesPct = percentileRank(inst.trades, ctx.tradesRanks);
  const spreadPctVal = spreadPctOf(inst);
  const spreadPctRank =
    spreadPctVal !== null
      ? percentileRank(spreadPctVal, ctx.spreadPctRanks)
      : 50;
  const spreadTicksVal = spreadTicksOf(inst);
  const spreadTicksRank =
    spreadTicksVal !== null
      ? percentileRank(spreadTicksVal, ctx.spreadTicksRanks)
      : 50;
  const lotValuePct = percentileRank(lotValueOf(inst), ctx.lotValueRanks);
  const dayRangePctRank = percentileRank(dayRangeOf(inst), ctx.dayRangeRanks);
  const tickVal = tickValueRubOf(inst);
  const tickValuePct =
    tickVal !== null
      ? percentileRank(tickVal, ctx.tickValueRanks)
      : 50;
  const entryCostPct = percentileRank(
    calculateEntryCost(
      inst.spreadRub ?? 0,
      inst.lotSize,
      lotValueOf(inst),
      DEFAULT_MARKET_COMMISSION_RATE,
    ).entryCostRub,
    ctx.entryCostRanks,
  );

  const lotValueNorm = 100 - Math.abs(lotValuePct - 45) * 1.2;

  const liquidityScore = clamp(
    turnoverPct * 0.45 + tradesPct * 0.4 + lotValueNorm * 0.15,
  );

  const spreadScore = clamp(
    (100 - spreadPctRank) * 0.5 +
      (100 - spreadTicksRank) * 0.3 +
      tickValuePct * 0.2,
  );

  const zigzagScore = clamp(
    dayRangePctRank * 0.5 + turnoverPct * 0.25 + tradesPct * 0.25,
  );

  const tradesQuality = tradesPct;
  const turnoverQuality = turnoverPct;
  const rangeQuality = dayRangePctRank;
  const tightSpread = tightSpreadQuality(inst, spreadPctRank);

  const fundPenalty = isFundLikeInstrument(inst) ? 55 : 0;
  const noPricePenalty = inst.price <= 0 ? 45 : 0;
  const noSpreadPenalty =
    inst.spreadRub === null || spreadPctVal === null ? 10 : 0;

  const technicalScore = clamp(
    tradesQuality * 0.35 +
      turnoverQuality * 0.25 +
      rangeQuality * 0.25 +
      tightSpread * 0.15 -
      fundPenalty -
      noPricePenalty -
      noSpreadPenalty,
  );

  const spreadTradingScore = calculateOrderBookScore(
    toOrderBookScoreInput(inst, lotValueOf(inst), tickVal, spreadTicksVal),
    orderBookContextFromScoreContext(ctx),
  );

  const spreadPenalty = spreadPctRank > 75 ? (spreadPctRank - 75) * 1.5 : 0;
  const beginnerEtfPenalty = isFundLikeInstrument(inst) ? 22 : 0;
  const beginnerScore = clamp(
    (100 - lotValuePct) * 0.3 +
      tradesPct * 0.25 +
      (100 - spreadPctRank) * 0.25 +
      liquidityScore * 0.2 -
      spreadPenalty -
      beginnerEtfPenalty,
  );

  const hasBaseline = hasHistoricalBaseline(inst);

  let inPlayScore: number;
  if (hasBaseline) {
    const turnoverRatio = inst.turnoverRub / inst.avgTurnover20d!;
    const tradesRatio =
      inst.avgTrades20d !== null && inst.avgTrades20d > 0
        ? inst.trades / inst.avgTrades20d
        : 1;
    inPlayScore = clamp(
      Math.min(turnoverRatio, 2) * 35 +
        Math.min(tradesRatio, 2) * 30 +
        dayRangePctRank * 0.2 +
        inst.volatilityScore * 0.15 +
        (spreadPctRank > 15 && spreadPctRank < 85 ? 10 : 0),
    );
  } else {
    inPlayScore = clamp(
      turnoverPct * 0.35 +
        tradesPct * 0.35 +
        dayRangePctRank * 0.2 +
        inst.volatilityScore * 0.1,
    );
  }

  const dangerousScore = clamp(
    spreadPctRank * 0.25 +
      entryCostPct * 0.25 +
      lotValuePct * 0.2 +
      (100 - tradesPct) * 0.2 +
      dayRangePctRank * 0.1,
  );

  return {
    liquidityScore,
    spreadScore,
    technicalScore,
    spreadTradingScore,
    beginnerScore,
    inPlayScore,
    dangerousScore,
    zigzagScore,
    hasHistoricalBaseline: hasBaseline,
  };
}

export function buildScoreContext(instruments: MarketInstrumentRaw[]): ScoreContext {
  return buildContext(instruments);
}
