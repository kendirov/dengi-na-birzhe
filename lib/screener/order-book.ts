import type { MarketInstrument } from "@/lib/data/types";
import { isFundLikeInstrument } from "@/lib/screener/etf";
import { clamp, percentileRank } from "@/lib/screener/percentile";

export { isFundLikeInstrument };

const FALLBACK_MIN_TRADES = 300;
const FALLBACK_MIN_TURNOVER_RUB = 3_000_000;

export interface OrderBookUniverseContext {
  tradesRanks: number[];
  turnoverRanks: number[];
  spreadPointsRanks: number[];
  lotValueRanks: number[];
  tickValueRanks: number[];
  spreadPctRanks: number[];
}

export type OrderBookScoreInput = Pick<
  MarketInstrument,
  | "ticker"
  | "name"
  | "price"
  | "lotSize"
  | "lotValue"
  | "tickSize"
  | "tickValueRub"
  | "spreadRub"
  | "spreadPct"
  | "spreadTicks"
  | "turnoverRub"
  | "trades"
  | "bid"
  | "ask"
  | "entryCostMarketTicks"
  | "commissionMarketTicks"
>;

function medianOrZero(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

function hasBidAsk(inst: OrderBookScoreInput): boolean {
  return inst.bid !== null && inst.ask !== null && inst.bid > 0 && inst.ask > 0;
}

function spreadPointsOf(inst: OrderBookScoreInput): number | null {
  return inst.spreadTicks;
}

export function buildOrderBookUniverseContext(
  instruments: OrderBookScoreInput[],
): OrderBookUniverseContext {
  const tickValues = instruments
    .map((i) => i.tickValueRub)
    .filter((v): v is number => v !== null);
  const spreadPointsValues = instruments
    .map((i) => spreadPointsOf(i))
    .filter((v): v is number => v !== null);
  const spreadPctValues = instruments
    .map((i) => i.spreadPct)
    .filter((v): v is number => v !== null);

  return {
    tradesRanks: instruments.map((i) => i.trades),
    turnoverRanks: instruments.map((i) => i.turnoverRub),
    spreadPointsRanks: instruments.map(
      (i) => spreadPointsOf(i) ?? medianOrZero(spreadPointsValues),
    ),
    lotValueRanks: instruments.map((i) => i.lotValue),
    tickValueRanks: instruments.map(
      (i) => i.tickValueRub ?? medianOrZero(tickValues),
    ),
    spreadPctRanks: instruments.map(
      (i) => i.spreadPct ?? medianOrZero(spreadPctValues),
    ),
  };
}

function tradesPercentile(inst: OrderBookScoreInput, ctx: OrderBookUniverseContext): number {
  return percentileRank(inst.trades, ctx.tradesRanks);
}

function turnoverPercentile(
  inst: OrderBookScoreInput,
  ctx: OrderBookUniverseContext,
): number {
  return percentileRank(inst.turnoverRub, ctx.turnoverRanks);
}

function spreadPctPercentile(
  inst: OrderBookScoreInput,
  ctx: OrderBookUniverseContext,
): number {
  if (inst.spreadPct === null) return 50;
  return percentileRank(inst.spreadPct, ctx.spreadPctRanks);
}

function tradesPass(inst: OrderBookScoreInput, ctx: OrderBookUniverseContext): boolean {
  if (inst.trades <= 0) return false;
  if (ctx.tradesRanks.length >= 20) {
    return tradesPercentile(inst, ctx) >= 30;
  }
  return inst.trades >= FALLBACK_MIN_TRADES;
}

function turnoverPass(
  inst: OrderBookScoreInput,
  ctx: OrderBookUniverseContext,
): boolean {
  if (inst.turnoverRub <= 0) return false;
  if (ctx.turnoverRanks.length >= 20) {
    return turnoverPercentile(inst, ctx) >= 25;
  }
  return inst.turnoverRub >= FALLBACK_MIN_TURNOVER_RUB;
}

/**
 * Ultra-tight liquid names (e.g. SBER, GAZP) belong in technical modes, not order book top.
 * Not a ticker blacklist — spread in points and/or spreadPct + liquidity profile.
 */
export function isBlueChipUltraTightInstrument(
  inst: OrderBookScoreInput,
  ctx: OrderBookUniverseContext,
): boolean {
  const points = spreadPointsOf(inst);
  const tradesPct = tradesPercentile(inst, ctx);
  const turnoverPct = turnoverPercentile(inst, ctx);
  const spreadPctRank = spreadPctPercentile(inst, ctx);

  const superLiquid = tradesPct >= 70 && turnoverPct >= 65;
  if (!superLiquid) return false;

  if (points !== null && points <= 1.5) return true;

  // ISS bid/ask can look wider in points while spreadPct stays ultra-low (stale best bid).
  if (inst.spreadPct !== null && spreadPctRank <= 22) return true;

  return false;
}

function isLikelyDeadBook(
  inst: OrderBookScoreInput,
  ctx: OrderBookUniverseContext,
): boolean {
  const points = spreadPointsOf(inst);
  if (points === null) return true;

  const tradesPct = tradesPercentile(inst, ctx);
  const turnoverPct = turnoverPercentile(inst, ctx);

  if (points > 35) return true;
  if (points > 20 && (tradesPct < 40 || turnoverPct < 35)) return true;
  if (points > 15 && tradesPct < 25 && turnoverPct < 25) return true;

  return false;
}

export function isOrderBookCandidate(
  inst: OrderBookScoreInput,
  ctx: OrderBookUniverseContext,
): boolean {
  const points = spreadPointsOf(inst);

  if (isFundLikeInstrument(inst)) return false;
  if (points === null || points < 2) return false;
  if (inst.trades <= 0 || inst.turnoverRub <= 0) return false;
  if (inst.tickValueRub === null || inst.tickSize === null) return false;
  if (!hasBidAsk(inst)) return false;
  if (inst.spreadRub === null) return false;
  if (isBlueChipUltraTightInstrument(inst, ctx)) return false;
  if (!tradesPass(inst, ctx)) return false;
  if (!turnoverPass(inst, ctx)) return false;
  if (isLikelyDeadBook(inst, ctx)) return false;

  return true;
}

export function spreadPointsQuality(
  points: number | null,
  tradesPct: number,
  turnoverPct: number,
): number {
  if (points === null) return 0;
  if (points < 2) return clamp(10 + points * 5);

  let score: number;
  if (points <= 3) score = clamp(55 + (points - 2) * 12);
  else if (points <= 8) score = clamp(78 + (points - 3) * 4);
  else if (points <= 15) score = clamp(98 - (points - 8) * 3);
  else if (points <= 20) score = clamp(77 - (points - 15) * 4);
  else score = clamp(57 - (points - 20) * 2);

  if (points > 20 && (tradesPct < 45 || turnoverPct < 40)) {
    score -= clamp((points - 20) * 3 + 15);
  }

  return clamp(score);
}

function tickValueQuality(
  inst: OrderBookScoreInput,
  ctx: OrderBookUniverseContext,
): number {
  if (inst.tickValueRub === null) return 0;
  const pct = percentileRank(inst.tickValueRub, ctx.tickValueRanks);
  let score = clamp(100 - Math.abs(pct - 45) * 1.3);
  if (inst.tickValueRub > 800) score -= 20;
  else if (inst.tickValueRub > 500) score -= 12;
  if (pct > 90) score -= 15;
  return clamp(score);
}

function commissionQuality(inst: OrderBookScoreInput): number {
  const comm = inst.commissionMarketTicks;
  const spread = spreadPointsOf(inst);
  if (comm === null) return 45;
  if (spread !== null && comm >= spread * 0.75) {
    return clamp(28 - (comm - spread) * 2);
  }
  if (comm <= 4) return 90;
  if (comm <= 8) return 74;
  if (comm <= 15) return 58;
  return clamp(38 - (comm - 15));
}

export function calculateOrderBookScore(
  inst: OrderBookScoreInput,
  ctx: OrderBookUniverseContext,
): number {
  const points = spreadPointsOf(inst);
  const tradesPct = tradesPercentile(inst, ctx);
  const turnoverPct = turnoverPercentile(inst, ctx);

  const pointsQuality = spreadPointsQuality(points, tradesPct, turnoverPct);
  const tradesQuality = tradesPct;
  const turnoverQuality = turnoverPct;
  const tickQuality = tickValueQuality(inst, ctx);
  const commQuality = commissionQuality(inst);

  const fundPenalty = isFundLikeInstrument(inst) ? 60 : 0;
  const ultraTightPenalty = isBlueChipUltraTightInstrument(inst, ctx) ? 55 : 0;
  const deadBookPenalty = isLikelyDeadBook(inst, ctx) ? 50 : 0;
  const noBidAskPenalty = !hasBidAsk(inst) || inst.spreadRub === null ? 40 : 0;

  return clamp(
    tradesQuality * 0.4 +
      pointsQuality * 0.3 +
      turnoverQuality * 0.2 +
      tickQuality * 0.05 +
      commQuality * 0.05 -
      fundPenalty -
      deadBookPenalty -
      ultraTightPenalty -
      noBidAskPenalty,
  );
}
