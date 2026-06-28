/** Default commission rates (no broker-specific data in MVP). */
export const DEFAULT_LIMIT_COMMISSION_RATE = 0.0002;
export const DEFAULT_MARKET_COMMISSION_RATE = 0.0004;

/** @deprecated use DEFAULT_MARKET_COMMISSION_RATE */
export const DEFAULT_COMMISSION_RATE = DEFAULT_MARKET_COMMISSION_RATE;

export interface CommissionCosts {
  commissionLimitRate: number;
  commissionMarketRate: number;
  commissionLimitRub: number;
  commissionMarketRub: number;
  commissionLimitTicks: number | null;
  commissionMarketTicks: number | null;
  spreadCostRub: number | null;
  entryCostLimitRub: number | null;
  entryCostMarketRub: number | null;
  entryCostLimitTicks: number | null;
  entryCostMarketTicks: number | null;
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
  const limitRate = params.limitRate ?? DEFAULT_LIMIT_COMMISSION_RATE;
  const marketRate = params.marketRate ?? DEFAULT_MARKET_COMMISSION_RATE;

  const commissionLimitRub = params.lotValue * limitRate;
  const commissionMarketRub = params.lotValue * marketRate;

  const commissionLimitTicks =
    params.tickValueRub !== null && params.tickValueRub > 0
      ? commissionLimitRub / params.tickValueRub
      : null;
  const commissionMarketTicks =
    params.tickValueRub !== null && params.tickValueRub > 0
      ? commissionMarketRub / params.tickValueRub
      : null;

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
    spreadCostRub,
    entryCostLimitRub,
    entryCostMarketRub,
    entryCostLimitTicks,
    entryCostMarketTicks,
  };
}
