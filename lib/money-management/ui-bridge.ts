import {
  LIVEIG_LIMIT_COMMISSION_RATE,
  LIVEIG_MARKET_COMMISSION_RATE,
} from "@/lib/screener/commission";
import type {
  DailyPlanUiInput,
  DailyPlanUiResult,
  DemoInstrument,
  MoneyManagementInput,
  OrderSide,
} from "./types";
import { calculateTargetRub, resolveBaseRiskPerTradeRub } from "./formulas";

export function resolveCommissionsPerLot(
  lotValue: number,
  entryOrderType: OrderSide,
  exitOrderType: OrderSide = "market",
): { entryCommissionRub: number; exitCommissionRub: number } {
  return {
    entryCommissionRub:
      lotValue *
      (entryOrderType === "limit"
        ? LIVEIG_LIMIT_COMMISSION_RATE
        : LIVEIG_MARKET_COMMISSION_RATE),
    exitCommissionRub:
      lotValue *
      (exitOrderType === "limit"
        ? LIVEIG_LIMIT_COMMISSION_RATE
        : LIVEIG_MARKET_COMMISSION_RATE),
  };
}

export function stopPriceFromPoints(
  entryPrice: number,
  stopPoints: number,
  tickSize: number,
): number {
  const distance = Math.max(0, stopPoints) * tickSize;
  return Math.max(tickSize, Number((entryPrice - distance).toFixed(6)));
}

export function buildMoneyManagementInput(params: {
  plan: DailyPlanUiInput;
  instrument: DemoInstrument;
  entryPrice: number;
  stopPrice: number;
  slippagePoints: number;
  entryOrderType?: OrderSide;
  exitOrderType?: OrderSide;
  entryCommissionRub?: number;
  exitCommissionRub?: number;
}): MoneyManagementInput {
  const {
    plan,
    instrument,
    entryPrice,
    stopPrice,
    slippagePoints,
    entryOrderType = "limit",
    exitOrderType = "market",
  } = params;

  const fromTariff = resolveCommissionsPerLot(
    instrument.lotValue,
    entryOrderType,
    exitOrderType,
  );
  const entryCommissionRub =
    params.entryCommissionRub ?? fromTariff.entryCommissionRub;
  const exitCommissionRub =
    params.exitCommissionRub ?? fromTariff.exitCommissionRub;

  return {
    deposit: plan.depositRub,
    dailyDrawdownRub: Math.max(0, plan.drawdownRub),
    targetPercent: plan.dailyGoalPct,
    plannedTrades: plan.plannedTrades,
    entryPrice,
    stopPrice,
    tickSize: instrument.tickSize,
    pointValueRub: instrument.pointValueRub,
    slippagePoints,
    entryCommissionRub,
    exitCommissionRub,
    riskMode: "drawdown",
    lotValueRub: instrument.lotValue,
  };
}

export function calculateDailyPlanUi(input: DailyPlanUiInput): DailyPlanUiResult {
  const depositRub = Math.max(0, input.depositRub);
  const dailyDrawdownRub = Math.max(0, input.drawdownRub);
  const targetRub = calculateTargetRub(depositRub, input.dailyGoalPct);
  const baseRiskPerTradeRub = resolveBaseRiskPerTradeRub({
    dailyDrawdownRub,
    plannedTrades: input.plannedTrades,
    riskMode: "drawdown",
  });

  return {
    targetRub,
    dailyDrawdownRub,
    baseRiskPerTradeRub,
  };
}
