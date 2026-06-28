import type { MarketInstrument } from "@/lib/data/types";
import { DEFAULT_MARKET_COMMISSION_RATE } from "@/lib/screener/commission";
import { isFundLikeInstrument } from "@/lib/screener/etf";
import { clamp, percentileRank } from "@/lib/screener/percentile";

export { isFundLikeInstrument };

/** Minimum absolute thresholds when universe is too small for percentiles. */
const FALLBACK_MIN_TRADES = 300;
const FALLBACK_MIN_TURNOVER_RUB = 3_000_000;
const MAX_LOT_VALUE_RUB = 2_500_000;
const MAX_LOT_VALUE_PERCENTILE = 88;

export interface SpreadUniverseContext {
  tradesRanks: number[];
  turnoverRanks: number[];
  lotValueRanks: number[];
  spreadRubRanks: number[];
  tickValueRanks: number[];
  entryCostTicksRanks: number[];
}

export type SpreadScoreInput = Pick<
  MarketInstrument,
  | "ticker"
  | "name"
  | "price"
  | "lotSize"
  | "lotValue"
  | "tickSize"
  | "tickValueRub"
  | "spreadRub"
  | "spreadTicks"
  | "turnoverRub"
  | "trades"
  | "bid"
  | "ask"
  | "entryCostMarketTicks"
  | "commissionMarketTicks"
>;

export function buildSpreadUniverseContext(
  instruments: SpreadScoreInput[],
): SpreadUniverseContext {
  const tickValues = instruments
    .map((i) => i.tickValueRub)
    .filter((v): v is number => v !== null);
  const spreadRubValues = instruments
    .map((i) => i.spreadRub)
    .filter((v): v is number => v !== null);
  const entryCostValues = instruments
    .map((i) => marketEntryPoints(i))
    .filter((v): v is number => v !== null);

  return {
    tradesRanks: instruments.map((i) => i.trades),
    turnoverRanks: instruments.map((i) => i.turnoverRub),
    lotValueRanks: instruments.map((i) => i.lotValue),
    spreadRubRanks: instruments.map(
      (i) => i.spreadRub ?? medianOrZero(spreadRubValues),
    ),
    tickValueRanks: instruments.map(
      (i) => i.tickValueRub ?? medianOrZero(tickValues),
    ),
    entryCostTicksRanks: instruments.map(
      (i) => marketEntryPoints(i) ?? medianOrZero(entryCostValues),
    ),
  };
}

function medianOrZero(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

function tradesPass(inst: SpreadScoreInput, ctx: SpreadUniverseContext): boolean {
  if (inst.trades <= 0) return false;
  if (ctx.tradesRanks.length >= 20) {
    return percentileRank(inst.trades, ctx.tradesRanks) >= 35;
  }
  return inst.trades >= FALLBACK_MIN_TRADES;
}

function turnoverPass(
  inst: SpreadScoreInput,
  ctx: SpreadUniverseContext,
): boolean {
  if (inst.turnoverRub <= 0) return false;
  if (ctx.turnoverRanks.length >= 20) {
    return percentileRank(inst.turnoverRub, ctx.turnoverRanks) >= 30;
  }
  return inst.turnoverRub >= FALLBACK_MIN_TURNOVER_RUB;
}

function passesLiquidityGate(
  inst: SpreadScoreInput,
  ctx: SpreadUniverseContext,
): boolean {
  return tradesPass(inst, ctx) && turnoverPass(inst, ctx);
}

function lotValuePass(inst: SpreadScoreInput, ctx: SpreadUniverseContext): boolean {
  if (inst.lotValue <= 0) return false;
  if (inst.lotValue > MAX_LOT_VALUE_RUB) return false;
  if (ctx.lotValueRanks.length >= 20) {
    return percentileRank(inst.lotValue, ctx.lotValueRanks) <= MAX_LOT_VALUE_PERCENTILE;
  }
  return true;
}

function marketEntryPoints(inst: SpreadScoreInput): number | null {
  if (inst.entryCostMarketTicks !== null) return inst.entryCostMarketTicks;
  const points = inst.spreadTicks;
  if (points === null || inst.tickValueRub === null || inst.tickValueRub <= 0) {
    return null;
  }
  const commissionPoints =
    (inst.lotValue * DEFAULT_MARKET_COMMISSION_RATE) / inst.tickValueRub;
  return points + commissionPoints;
}

/** Likely stale/empty book: huge spread with thin tape. */
function isLikelyDeadSpread(
  inst: SpreadScoreInput,
  ctx: SpreadUniverseContext,
): boolean {
  const points = inst.spreadTicks;
  if (points === null) return true;

  const tradesPct = percentileRank(inst.trades, ctx.tradesRanks);
  const turnoverPct = percentileRank(inst.turnoverRub, ctx.turnoverRanks);

  if (points > 35) return true;
  if (points > 20 && (tradesPct < 40 || turnoverPct < 35)) return true;
  if (points > 15 && tradesPct < 25 && turnoverPct < 25) return true;

  return false;
}

/**
 * Spread-tradable candidate: wide enough spread + live tape + sane step/lot.
 * No manual whitelist — purely feature-based.
 */
export function isSpreadTradableCandidate(
  inst: SpreadScoreInput,
  ctx: SpreadUniverseContext,
): boolean {
  if (isFundLikeInstrument(inst)) return false;
  if (inst.price <= 0) return false;
  if (inst.spreadRub === null || inst.spreadTicks === null) return false;
  if (inst.tickValueRub === null || inst.tickSize === null) return false;
  if (inst.spreadTicks < 2) return false;
  if (!tradesPass(inst, ctx)) return false;
  if (!turnoverPass(inst, ctx)) return false;
  if (!lotValuePass(inst, ctx)) return false;
  if (isLikelyDeadSpread(inst, ctx)) return false;
  return true;
}

export function spreadPointsQuality(points: number | null): number {
  if (points === null) return 0;
  if (points < 2) return 15;
  if (points <= 3) return clamp(50 + (points - 2) * 10);
  if (points <= 8) return clamp(72 + (points - 3) * 4.5);
  if (points <= 15) return clamp(94 - (points - 8) * 4);
  if (points <= 20) return clamp(62 - (points - 15) * 5);
  return clamp(37 - (points - 20) * 2);
}

function spreadRubQuality(
  inst: SpreadScoreInput,
  ctx: SpreadUniverseContext,
): number {
  if (inst.spreadRub === null) return 0;
  return percentileRank(inst.spreadRub, ctx.spreadRubRanks);
}

function tickValueQuality(
  inst: SpreadScoreInput,
  ctx: SpreadUniverseContext,
): number {
  if (inst.tickValueRub === null) return 0;
  const pct = percentileRank(inst.tickValueRub, ctx.tickValueRanks);
  let score = clamp(100 - Math.abs(pct - 48) * 1.4);
  if (inst.tickValueRub > 800) score -= 18;
  if (inst.tickValueRub > 500) score -= 10;
  if (pct > 88) score -= 12;
  return clamp(score);
}

function entryCostQuality(entryPoints: number | null): number {
  if (entryPoints === null) return 35;
  if (entryPoints <= 4) return 55;
  if (entryPoints <= 8) return clamp(72 + (entryPoints - 4) * 4);
  if (entryPoints <= 14) return clamp(88 + (entryPoints - 8) * 1);
  if (entryPoints <= 22) return clamp(94 - (entryPoints - 14) * 5);
  return clamp(54 - (entryPoints - 22) * 4);
}

export function calculateSpreadTradingScore(
  inst: SpreadScoreInput,
  ctx: SpreadUniverseContext,
): number {
  const spreadPoints = inst.spreadTicks;
  const tradesPct = percentileRank(inst.trades, ctx.tradesRanks);
  const turnoverPct = percentileRank(inst.turnoverRub, ctx.turnoverRanks);

  const pointsQuality = spreadPointsQuality(spreadPoints);
  const rubQuality = spreadRubQuality(inst, ctx);
  const tradesQuality = tradesPct;
  const turnoverQuality = turnoverPct;
  const tickQuality = tickValueQuality(inst, ctx);
  const entryQuality = entryCostQuality(marketEntryPoints(inst));

  const fundPenalty = isFundLikeInstrument(inst) ? 55 : 0;
  const liquidityGate = passesLiquidityGate(inst, ctx);
  const thinLiquidityPenalty = liquidityGate
    ? 0
    : tradesPct < 30 || turnoverPct < 25
      ? 32
      : 14;
  const extremeSpreadPenalty =
    spreadPoints !== null && spreadPoints > 20
      ? clamp((spreadPoints - 20) * 2.5)
      : 0;
  const noBidAskPenalty = inst.spreadRub === null ? 50 : 0;
  const deadBookPenalty =
    liquidityGate && !isLikelyDeadSpread(inst, ctx) ? 0 : isLikelyDeadSpread(inst, ctx) ? 45 : 0;

  return clamp(
    pointsQuality * 0.28 +
      rubQuality * 0.12 +
      tradesQuality * 0.25 +
      turnoverQuality * 0.18 +
      tickQuality * 0.1 +
      entryQuality * 0.07 -
      fundPenalty -
      thinLiquidityPenalty -
      extremeSpreadPenalty -
      noBidAskPenalty -
      deadBookPenalty,
  );
}
