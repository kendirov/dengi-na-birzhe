import type { MoneyManagementInput, RiskMode } from "./types";

export const MM_FORMULAS = {
  targetRub: "deposit × targetPercent / 100",
  baseRiskDrawdown: "dailyDrawdownRub / plannedTrades",
  baseRiskFixed: "fixedRiskRub",
  baseRiskCustom: "customRiskRub",
  stopDistancePoints: "|entryPrice − stopPrice| / tickSize",
  stopLossRubPerLot: "stopDistancePoints × pointValueRub",
  slippageRubPerLot: "slippagePoints × pointValueRub",
  totalRiskPerLotRub:
    "stopLossRubPerLot + slippageRubPerLot + entryCommissionRub + exitCommissionRub",
  maxPositionLots: "floor(baseRiskPerTradeRub / totalRiskPerLotRub)",
  actualTradeRiskRub: "maxPositionLots × totalRiskPerLotRub",
  reducedVolumeLots: "floor(maxPositionLots / 2)",
  baseVolumeLots: "maxPositionLots",
  increasedVolumeLots: "maxPositionLots × 2",
} as const;

export function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function normalizePlannedTrades(plannedTrades: number): number {
  if (!Number.isFinite(plannedTrades) || plannedTrades <= 0) return 1;
  return Math.max(1, Math.floor(plannedTrades));
}

export function calculateTargetRub(deposit: number, targetPercent: number): number {
  return (Math.max(0, deposit) * Math.max(0, targetPercent)) / 100;
}

export function resolveBaseRiskPerTradeRub(
  input: Pick<
    MoneyManagementInput,
    | "dailyDrawdownRub"
    | "plannedTrades"
    | "riskMode"
    | "fixedRiskRub"
    | "customRiskRub"
  >,
): number {
  const mode: RiskMode = input.riskMode ?? "drawdown";
  const trades = normalizePlannedTrades(input.plannedTrades);

  switch (mode) {
    case "fixed":
      return Math.max(0, input.fixedRiskRub ?? 0);
    case "custom":
      return Math.max(0, input.customRiskRub ?? 0);
    case "drawdown":
    default:
      return Math.max(0, input.dailyDrawdownRub) / trades;
  }
}

export function calculateStopDistancePoints(
  entryPrice: number,
  stopPrice: number,
  tickSize: number,
): number {
  if (tickSize <= 0 || !Number.isFinite(tickSize)) return 0;
  return Math.abs(entryPrice - stopPrice) / tickSize;
}

export function calculateStopLossRubPerLot(
  stopDistancePoints: number,
  pointValueRub: number,
): number {
  return Math.max(0, stopDistancePoints) * Math.max(0, pointValueRub);
}

export function calculateSlippageRubPerLot(
  slippagePoints: number,
  pointValueRub: number,
): number {
  return Math.max(0, slippagePoints) * Math.max(0, pointValueRub);
}

export function calculateTotalRiskPerLotRub(parts: {
  stopLossRubPerLot: number;
  slippageRubPerLot: number;
  entryCommissionRub: number;
  exitCommissionRub: number;
}): number {
  return (
    Math.max(0, parts.stopLossRubPerLot) +
    Math.max(0, parts.slippageRubPerLot) +
    Math.max(0, parts.entryCommissionRub) +
    Math.max(0, parts.exitCommissionRub)
  );
}

export function calculateMaxPositionLots(
  baseRiskPerTradeRub: number,
  totalRiskPerLotRub: number,
): number {
  if (totalRiskPerLotRub <= 0) return 0;
  return Math.floor(baseRiskPerTradeRub / totalRiskPerLotRub);
}

export function calculateActualTradeRiskRub(
  maxPositionLots: number,
  totalRiskPerLotRub: number,
): number {
  return Math.max(0, maxPositionLots) * totalRiskPerLotRub;
}

export function calculateReducedVolumeLots(maxPositionLots: number): number {
  if (maxPositionLots <= 0) return 0;
  return Math.floor(maxPositionLots / 2);
}

export function calculateIncreasedVolumeLots(maxPositionLots: number): number {
  if (maxPositionLots <= 0) return 0;
  return maxPositionLots * 2;
}

/** Маячок — всегда 1 лот для привода. */
export function calculateBeaconVolumeLots(): number {
  return 1;
}

/** 1/4 рабочего объёма, минимум 1 лот. */
export function calculateQuarterVolumeLots(fullVolumeLots: number): number {
  if (fullVolumeLots <= 0) return 0;
  return Math.max(1, Math.floor(fullVolumeLots * 0.25));
}

/** 1/2 рабочего объёма, минимум 1 лот. */
export function calculateHalfVolumeLots(fullVolumeLots: number): number {
  if (fullVolumeLots <= 0) return 0;
  return Math.max(1, Math.floor(fullVolumeLots * 0.5));
}

/** Полный рабочий объём = floor(риск на сделку / риск на 1 лот). */
export function calculateFullVolumeLots(
  riskPerTradeRub: number,
  riskPerLotRub: number,
): number {
  if (riskPerLotRub <= 0) return 0;
  return Math.floor(Math.max(0, riskPerTradeRub) / riskPerLotRub);
}

/** x2 от полного объёма. */
export function calculateDoubleVolumeLots(fullVolumeLots: number): number {
  if (fullVolumeLots <= 0) return 0;
  return fullVolumeLots * 2;
}

export function pointsFromRub(rub: number, pointValueRub: number): number {
  if (pointValueRub <= 0) return 0;
  return rub / pointValueRub;
}

export const INCREASED_VOLUME_NOTE =
  "Повышенный объём — только для лучших ситуаций с подтверждением сетапа и ликвидности.";

export const POSITION_TOO_SMALL_MESSAGE =
  "При таком стопе и риске позиция слишком большая по риску. Нужно уменьшить стоп, снизить проскальзывание или увеличить допустимый риск.";
