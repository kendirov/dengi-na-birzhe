/**
 * LiveInvestGroup commission tariff (verified vs
 * production2.liveinvestgroup.ru/api/v1/stock/characteristics, Jun 2026).
 *
 * GAZP @ 100.17×10: 0.45 (0.06) ₽, 5 (1) п. — exact match at these rates.
 * SBER @ 303.66×1: LI shows 0.14 (0.02), 15 (2) — LI uses ~0.0461% effective
 * market on that snapshot; our 0.045% gives 0.14 (0.02), 14 (2) (±1 п. from price/rate timing).
 */
export const LIVEIG_MARKET_COMMISSION_RATE = 0.00045;
export const LIVEIG_LIMIT_COMMISSION_RATE = 0.00006;

/** @deprecated use LIVEIG_MARKET_COMMISSION_RATE */
export const DEFAULT_MARKET_COMMISSION_RATE = LIVEIG_MARKET_COMMISSION_RATE;
/** @deprecated use LIVEIG_LIMIT_COMMISSION_RATE */
export const DEFAULT_LIMIT_COMMISSION_RATE = LIVEIG_LIMIT_COMMISSION_RATE;

/** @deprecated use LIVEIG_MARKET_COMMISSION_RATE */
export const DEFAULT_COMMISSION_RATE = LIVEIG_MARKET_COMMISSION_RATE;

export const MARKET_COMMISSION_RATE = LIVEIG_MARKET_COMMISSION_RATE;
export const LIMIT_COMMISSION_RATE = LIVEIG_LIMIT_COMMISSION_RATE;

export type CommissionSource = "liveinvest" | "formula";

export interface CommissionCosts {
  commissionLimitRate: number;
  commissionMarketRate: number;
  commissionLimitRub: number;
  commissionMarketRub: number;
  /** Raw points: commissionRubExact / pointValueRub — used in scoring. */
  commissionLimitTicks: number | null;
  commissionMarketTicks: number | null;
  /** Ceil display points — market (limit) in UI. */
  commissionLimitPoints: number | null;
  commissionMarketPoints: number | null;
  commissionSource: CommissionSource;
  spreadCostRub: number | null;
  entryCostLimitRub: number | null;
  entryCostMarketRub: number | null;
  entryCostLimitTicks: number | null;
  entryCostMarketTicks: number | null;
}

/** pointValueRub = tickSize × lotSize — cost of one min price step per lot. */
export function computeCommissionPointsRaw(
  commissionRubExact: number,
  pointValueRub: number | null,
): number | null {
  if (pointValueRub === null || pointValueRub <= 0) return null;
  return commissionRubExact / pointValueRub;
}

/** Ceil up; min 1 point when commission > 0 and raw < 1. */
export function computeCommissionPointsDisplay(
  commissionRubExact: number,
  raw: number | null,
): number | null {
  if (raw === null) return null;
  if (commissionRubExact <= 0) return null;
  if (raw < 1) return 1;
  return Math.ceil(raw);
}

export function computeCommissionCosts(params: {
  lotValue: number;
  lotSize: number;
  spreadRub: number | null;
  spreadTicks: number | null;
  tickValueRub: number | null;
  limitRate?: number;
  marketRate?: number;
}): CommissionCosts {
  const limitRate = params.limitRate ?? LIVEIG_LIMIT_COMMISSION_RATE;
  const marketRate = params.marketRate ?? LIVEIG_MARKET_COMMISSION_RATE;

  const commissionLimitRub = params.lotValue * limitRate;
  const commissionMarketRub = params.lotValue * marketRate;

  const pointValueRub = params.tickValueRub;
  const commissionLimitTicks = computeCommissionPointsRaw(
    commissionLimitRub,
    pointValueRub,
  );
  const commissionMarketTicks = computeCommissionPointsRaw(
    commissionMarketRub,
    pointValueRub,
  );
  const commissionLimitPoints = computeCommissionPointsDisplay(
    commissionLimitRub,
    commissionLimitTicks,
  );
  const commissionMarketPoints = computeCommissionPointsDisplay(
    commissionMarketRub,
    commissionMarketTicks,
  );

  const spreadCostRub =
    params.spreadRub !== null ? params.spreadRub * params.lotSize : null;

  const entryCostLimitRub = commissionLimitRub;

  const entryCostMarketRub =
    spreadCostRub !== null ? spreadCostRub + commissionMarketRub : null;

  const entryCostLimitTicks = commissionLimitTicks;

  const entryCostMarketTicks =
    params.spreadTicks !== null && commissionMarketTicks !== null
      ? params.spreadTicks + commissionMarketTicks
      : null;

  return {
    commissionLimitRate: limitRate,
    commissionMarketRate: marketRate,
    commissionLimitRub,
    commissionMarketRub,
    commissionLimitTicks,
    commissionMarketTicks,
    commissionLimitPoints,
    commissionMarketPoints,
    commissionSource: "formula",
    spreadCostRub,
    entryCostLimitRub,
    entryCostMarketRub,
    entryCostLimitTicks,
    entryCostMarketTicks,
  };
}

export type LiveInvestCommissionInput = {
  commissionMarketRub: number | null;
  commissionLimitRub: number | null;
  commissionMarketPoints: number | null;
  commissionLimitPoints: number | null;
};

/** Override formula costs with LiveInvest values when available. */
export function mergeLiveInvestCommission(
  formula: CommissionCosts,
  tickValueRub: number | null,
  spreadRub: number | null,
  spreadTicks: number | null,
  lotSize: number,
  li: LiveInvestCommissionInput | undefined,
): CommissionCosts {
  if (!li) return formula;

  const hasRub =
    li.commissionMarketRub !== null || li.commissionLimitRub !== null;
  const hasPoints =
    li.commissionMarketPoints !== null || li.commissionLimitPoints !== null;
  if (!hasRub && !hasPoints) return formula;

  const commissionMarketRub =
    li.commissionMarketRub ?? formula.commissionMarketRub;
  const commissionLimitRub =
    li.commissionLimitRub ?? formula.commissionLimitRub;

  const commissionMarketTicks = computeCommissionPointsRaw(
    commissionMarketRub,
    tickValueRub,
  );
  const commissionLimitTicks = computeCommissionPointsRaw(
    commissionLimitRub,
    tickValueRub,
  );

  const commissionMarketPoints =
    li.commissionMarketPoints !== null
      ? li.commissionMarketPoints
      : computeCommissionPointsDisplay(
          commissionMarketRub,
          commissionMarketTicks,
        );

  const commissionLimitPoints =
    li.commissionLimitPoints !== null
      ? li.commissionLimitPoints
      : computeCommissionPointsDisplay(
          commissionLimitRub,
          commissionLimitTicks,
        );

  const spreadCostRub =
    spreadRub !== null ? spreadRub * lotSize : formula.spreadCostRub;

  const entryCostLimitRub = commissionLimitRub;
  const entryCostMarketRub =
    spreadCostRub !== null ? spreadCostRub + commissionMarketRub : null;

  const entryCostLimitTicks = commissionLimitTicks;
  const entryCostMarketTicks =
    spreadTicks !== null && commissionMarketTicks !== null
      ? spreadTicks + commissionMarketTicks
      : null;

  return {
    ...formula,
    commissionMarketRub,
    commissionLimitRub,
    commissionMarketTicks,
    commissionLimitTicks,
    commissionMarketPoints,
    commissionLimitPoints,
    commissionSource: "liveinvest",
    spreadCostRub,
    entryCostLimitRub,
    entryCostMarketRub,
    entryCostLimitTicks,
    entryCostMarketTicks,
  };
}
