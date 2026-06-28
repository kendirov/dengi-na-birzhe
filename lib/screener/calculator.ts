export interface TradeCalcInput {
  rubPerPointPerLot: number;
  lotValue: number;
  tickValueRub: number;
  lots: number;
  pointsMove: number;
  commissionRate: number;
}

export interface TradeCalcResult {
  grossPnl: number;
  commissionRub: number;
  breakevenPoints: number;
  tickCostTotal: number;
  netPnl: number;
  isEstimate: boolean;
}

export function calculateTrade(input: TradeCalcInput): TradeCalcResult {
  const { rubPerPointPerLot, lotValue, tickValueRub, lots, pointsMove, commissionRate } =
    input;

  const grossPnl = rubPerPointPerLot * pointsMove * lots;
  const commissionRub = lotValue * lots * commissionRate;
  const denominator = rubPerPointPerLot * lots;
  const breakevenPoints =
    denominator > 0 ? commissionRub / denominator : 0;
  const tickCostTotal = tickValueRub * lots;
  const netPnl = grossPnl - commissionRub;

  return {
    grossPnl,
    commissionRub,
    breakevenPoints,
    tickCostTotal,
    netPnl,
    isEstimate: true,
  };
}

export function calculateEntryCost(
  spreadRub: number,
  lotSize: number,
  lotValue: number,
  commissionRate: number,
): { spreadCostRub: number; commissionRub: number; entryCostRub: number } {
  const spreadCostRub = spreadRub * lotSize;
  const commissionRub = lotValue * commissionRate;
  return {
    spreadCostRub,
    commissionRub,
    entryCostRub: spreadCostRub + commissionRub,
  };
}
