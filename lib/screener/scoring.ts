import type { MarketInstrumentRaw } from "@/lib/data/types";
import { DEFAULT_MARKET_COMMISSION_RATE } from "@/lib/screener/commission";
import { calculateEntryCost } from "@/lib/screener/calculator";
import { isFundLikeInstrument } from "@/lib/screener/etf";
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

function spreadTicksQualityScore(ticks: number | null): number {
  if (ticks === null) return 20;
  if (ticks < 1) return 15;
  if (ticks < 2) return 35;
  if (ticks <= 8) return clamp(72 + (ticks - 2) * 3.5);
  if (ticks <= 15) return clamp(88 - (ticks - 8) * 4);
  if (ticks <= 30) return clamp(58 - (ticks - 15) * 2);
  return clamp(28 - (ticks - 30) * 0.5);
}

function lotValueQualityScore(lotValuePct: number): number {
  return clamp(100 - Math.abs(lotValuePct - 45) * 1.2);
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
  const spreadRubRank =
    inst.spreadRub !== null
      ? percentileRank(inst.spreadRub, ctx.spreadRubRanks)
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

  const technicalScore = clamp(
    (100 - spreadPctRank) * 0.25 +
      liquidityScore * 0.3 +
      dayRangePctRank * 0.25 +
      zigzagScore * 0.2,
  );

  const spreadRubScore = spreadRubRank;
  const spreadTicksScore = spreadTicksQualityScore(spreadTicksVal);
  const tradesScore = tradesPct;
  const turnoverScore = turnoverPct;
  const tickValueQuality = clamp(100 - Math.abs(tickValuePct - 45) * 1.5);
  const lotValueQuality = lotValueQualityScore(lotValuePct);

  const fundPenalty = isFundLikeInstrument(inst) ? 40 : 0;
  const thinLiquidityPenalty =
    tradesPct < 30 || turnoverPct < 25 ? 28 : tradesPct < 45 ? 14 : 0;
  const extremeLotPenalty =
    lotValuePct > 82 ? 18 : lotValuePct > 72 ? 10 : 0;
  const hugeSpreadPenalty =
    spreadTicksVal !== null && spreadTicksVal > 20
      ? clamp((spreadTicksVal - 20) * 1.5)
      : 0;

  const spreadTradingScore = clamp(
    spreadTicksScore * 0.3 +
      spreadRubScore * 0.15 +
      tradesScore * 0.25 +
      turnoverScore * 0.15 +
      tickValueQuality * 0.1 +
      lotValueQuality * 0.05 -
      fundPenalty -
      thinLiquidityPenalty -
      extremeLotPenalty -
      hugeSpreadPenalty,
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
