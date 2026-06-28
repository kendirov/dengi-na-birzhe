import {
  DEFAULT_LIMIT_COMMISSION_RATE,
  DEFAULT_MARKET_COMMISSION_RATE,
} from "@/lib/screener/commission";

export type OrderType = "limit" | "market";

export interface TradeCalcInput {
  tickValueRub: number | null;
  lotValue: number;
  spreadRub: number | null;
  lotSize: number;
  lots: number;
  stepsMove: number;
  orderType: OrderType;
  commissionLimitRate?: number;
  commissionMarketRate?: number;
}

export interface TradeCalcResult {
  grossPnl: number;
  commissionRub: number;
  spreadCostRub: number;
  totalEntryCostRub: number;
  netPnl: number;
  breakevenSteps: number | null;
  isEstimate: boolean;
  hasTickValue: boolean;
  hasSpread: boolean;
}

export function calculateTrade(input: TradeCalcInput): TradeCalcResult {
  const {
    tickValueRub,
    lotValue,
    spreadRub,
    lotSize,
    lots,
    stepsMove,
    orderType,
    commissionLimitRate = DEFAULT_LIMIT_COMMISSION_RATE,
    commissionMarketRate = DEFAULT_MARKET_COMMISSION_RATE,
  } = input;

  const hasTickValue = tickValueRub !== null && tickValueRub > 0;
  const hasSpread = spreadRub !== null && spreadRub > 0;

  const grossPnl = hasTickValue ? tickValueRub * stepsMove * lots : 0;

  const commissionPerLot =
    orderType === "limit"
      ? lotValue * commissionLimitRate
      : lotValue * commissionMarketRate;
  const commissionRub = commissionPerLot * lots;

  const spreadCostRub =
    orderType === "market" && hasSpread ? spreadRub * lotSize * lots : 0;

  const totalEntryCostRub = commissionRub + spreadCostRub;
  const netPnl = grossPnl - totalEntryCostRub;

  const breakevenSteps =
    hasTickValue && tickValueRub * lots > 0
      ? totalEntryCostRub / (tickValueRub * lots)
      : null;

  return {
    grossPnl,
    commissionRub,
    spreadCostRub,
    totalEntryCostRub,
    netPnl,
    breakevenSteps,
    isEstimate: true,
    hasTickValue,
    hasSpread,
  };
}

export function calculateEntryCost(
  spreadRub: number,
  lotSize: number,
  lotValue: number,
  commissionRate: number = DEFAULT_MARKET_COMMISSION_RATE,
): { spreadCostRub: number; commissionRub: number; entryCostRub: number } {
  const spreadCostRub = spreadRub * lotSize;
  const commissionRub = lotValue * commissionRate;
  return {
    spreadCostRub,
    commissionRub,
    entryCostRub: spreadCostRub + commissionRub,
  };
}
