import {
  calculateActualTradeRiskRub,
  calculateIncreasedVolumeLots,
  calculateMaxPositionLots,
  calculateReducedVolumeLots,
  calculateSlippageRubPerLot,
  calculateStopDistancePoints,
  calculateStopLossRubPerLot,
  calculateTargetRub,
  calculateTotalRiskPerLotRub,
  finiteOr,
  INCREASED_VOLUME_NOTE,
  MM_FORMULAS,
  normalizePlannedTrades,
  pointsFromRub,
  POSITION_TOO_SMALL_MESSAGE,
  resolveBaseRiskPerTradeRub,
} from "./formulas";
import type {
  CalculationStep,
  MoneyManagementDebug,
  MoneyManagementInput,
  MoneyManagementResult,
  MoneyManagementWarning,
  RiskBreakdownPart,
  RiskMode,
} from "./types";

function buildBreakdown(
  input: MoneyManagementInput,
  stopDistancePoints: number,
  stopLossRubPerLot: number,
  slippageRubPerLot: number,
): { breakdown: RiskBreakdownPart[]; riskPerLotPoints: number } {
  const entryPoints = pointsFromRub(input.entryCommissionRub, input.pointValueRub);
  const exitPoints = pointsFromRub(input.exitCommissionRub, input.pointValueRub);

  const breakdown: RiskBreakdownPart[] = [
    {
      key: "stop",
      label: "Стоп-лосс",
      points: stopDistancePoints,
      rub: stopLossRubPerLot,
      tone: "red",
    },
    {
      key: "slippage",
      label: "Проскальзывание",
      points: Math.max(0, input.slippagePoints),
      rub: slippageRubPerLot,
      tone: "amber",
    },
    {
      key: "entryCommission",
      label: "Комиссия входа",
      points: entryPoints,
      rub: input.entryCommissionRub,
      tone: "cyan",
    },
    {
      key: "exitCommission",
      label: "Комиссия выхода",
      points: exitPoints,
      rub: input.exitCommissionRub,
      tone: "cyan",
    },
  ];

  const riskPerLotPoints = breakdown.reduce((sum, p) => sum + p.points, 0);
  return { breakdown, riskPerLotPoints };
}

function buildWarnings(
  input: MoneyManagementInput,
  stopDistancePoints: number,
  totalRiskPerLotRub: number,
  maxPositionLots: number,
): MoneyManagementWarning[] {
  const warnings: MoneyManagementWarning[] = [];

  if (input.entryPrice === input.stopPrice) {
    warnings.push({
      code: "zero_stop_distance",
      message: "Стоп совпадает с входом — расстояние 0 пунктов, риск не определён.",
    });
  }

  if (totalRiskPerLotRub <= 0) {
    warnings.push({
      code: "zero_risk_per_lot",
      message: "Риск на 1 лот равен нулю — проверьте стоп, шаг и комиссии.",
    });
  }

  if (maxPositionLots < 1) {
    warnings.push({
      code: "position_too_small",
      message: POSITION_TOO_SMALL_MESSAGE,
    });
  }

  if (stopDistancePoints <= 0 && input.entryPrice !== input.stopPrice) {
    warnings.push({
      code: "zero_stop_distance",
      message: "Расстояние до стопа 0 пунктов — проверьте цены и шаг цены.",
    });
  }

  return warnings;
}

function buildDebug(
  input: MoneyManagementInput,
  plannedTradesEffective: number,
  riskMode: RiskMode,
  steps: CalculationStep[],
): MoneyManagementDebug {
  return {
    input,
    plannedTradesEffective,
    riskMode,
    formulas: { ...MM_FORMULAS },
    steps,
  };
}

/** Главная точка входа — полный расчёт манименеджмента. */
export function calculateMoneyManagement(
  raw: MoneyManagementInput,
): MoneyManagementResult {
  const input: MoneyManagementInput = {
    ...raw,
    deposit: finiteOr(raw.deposit, 0),
    dailyDrawdownRub: finiteOr(raw.dailyDrawdownRub, 0),
    targetPercent: finiteOr(raw.targetPercent, 0),
    entryPrice: finiteOr(raw.entryPrice, 0),
    stopPrice: finiteOr(raw.stopPrice, 0),
    tickSize: finiteOr(raw.tickSize, 0.01),
    pointValueRub: finiteOr(raw.pointValueRub, 0),
    slippagePoints: finiteOr(raw.slippagePoints, 0),
    entryCommissionRub: finiteOr(raw.entryCommissionRub, 0),
    exitCommissionRub: finiteOr(raw.exitCommissionRub, 0),
  };
  const plannedTradesEffective = normalizePlannedTrades(input.plannedTrades);
  const riskMode: RiskMode = input.riskMode ?? "drawdown";

  const targetRub = calculateTargetRub(input.deposit, input.targetPercent);
  const baseRiskPerTradeRub = resolveBaseRiskPerTradeRub({
    ...input,
    plannedTrades: plannedTradesEffective,
  });

  const stopDistancePoints = calculateStopDistancePoints(
    input.entryPrice,
    input.stopPrice,
    input.tickSize,
  );
  const stopLossRubPerLot = calculateStopLossRubPerLot(
    stopDistancePoints,
    input.pointValueRub,
  );
  const slippageRubPerLot = calculateSlippageRubPerLot(
    input.slippagePoints,
    input.pointValueRub,
  );
  const totalRiskPerLotRub = calculateTotalRiskPerLotRub({
    stopLossRubPerLot,
    slippageRubPerLot,
    entryCommissionRub: input.entryCommissionRub,
    exitCommissionRub: input.exitCommissionRub,
  });

  const maxPositionLots = calculateMaxPositionLots(
    baseRiskPerTradeRub,
    totalRiskPerLotRub,
  );
  const actualTradeRiskRub = calculateActualTradeRiskRub(
    maxPositionLots,
    totalRiskPerLotRub,
  );

  const reducedVolumeLots = calculateReducedVolumeLots(maxPositionLots);
  const baseVolumeLots = maxPositionLots;
  const increasedVolumeLots = calculateIncreasedVolumeLots(maxPositionLots);

  const { breakdown, riskPerLotPoints } = buildBreakdown(
    input,
    stopDistancePoints,
    stopLossRubPerLot,
    slippageRubPerLot,
  );

  const warnings = buildWarnings(
    input,
    stopDistancePoints,
    totalRiskPerLotRub,
    maxPositionLots,
  );

  const steps: CalculationStep[] = [
    {
      key: "targetRub",
      label: "Цель на день, ₽",
      formula: MM_FORMULAS.targetRub,
      operands: { deposit: input.deposit, targetPercent: input.targetPercent },
      result: targetRub,
    },
    {
      key: "baseRiskPerTradeRub",
      label: "Базовый риск на сделку, ₽",
      formula:
        riskMode === "fixed"
          ? MM_FORMULAS.baseRiskFixed
          : riskMode === "custom"
            ? MM_FORMULAS.baseRiskCustom
            : MM_FORMULAS.baseRiskDrawdown,
      operands:
        riskMode === "drawdown"
          ? {
              dailyDrawdownRub: input.dailyDrawdownRub,
              plannedTrades: plannedTradesEffective,
            }
          : riskMode === "fixed"
            ? { fixedRiskRub: input.fixedRiskRub ?? 0 }
            : { customRiskRub: input.customRiskRub ?? 0 },
      result: baseRiskPerTradeRub,
    },
    {
      key: "stopDistancePoints",
      label: "Расстояние до стопа, п.",
      formula: MM_FORMULAS.stopDistancePoints,
      operands: {
        entryPrice: input.entryPrice,
        stopPrice: input.stopPrice,
        tickSize: input.tickSize,
      },
      result: stopDistancePoints,
    },
    {
      key: "stopLossRubPerLot",
      label: "Стоп на 1 лот, ₽",
      formula: MM_FORMULAS.stopLossRubPerLot,
      operands: { stopDistancePoints, pointValueRub: input.pointValueRub },
      result: stopLossRubPerLot,
    },
    {
      key: "slippageRubPerLot",
      label: "Проскальзывание на 1 лот, ₽",
      formula: MM_FORMULAS.slippageRubPerLot,
      operands: {
        slippagePoints: input.slippagePoints,
        pointValueRub: input.pointValueRub,
      },
      result: slippageRubPerLot,
    },
    {
      key: "totalRiskPerLotRub",
      label: "Полный риск на 1 лот, ₽",
      formula: MM_FORMULAS.totalRiskPerLotRub,
      operands: {
        stopLossRubPerLot,
        slippageRubPerLot,
        entryCommissionRub: input.entryCommissionRub,
        exitCommissionRub: input.exitCommissionRub,
      },
      result: totalRiskPerLotRub,
    },
    {
      key: "maxPositionLots",
      label: "Макс. объём, лот.",
      formula: MM_FORMULAS.maxPositionLots,
      operands: { baseRiskPerTradeRub, totalRiskPerLotRub },
      result: maxPositionLots,
    },
    {
      key: "actualTradeRiskRub",
      label: "Фактический риск сделки, ₽",
      formula: MM_FORMULAS.actualTradeRiskRub,
      operands: { maxPositionLots, totalRiskPerLotRub },
      result: actualTradeRiskRub,
    },
    {
      key: "reducedVolumeLots",
      label: "Пониженный объём, лот.",
      formula: MM_FORMULAS.reducedVolumeLots,
      operands: { maxPositionLots },
      result: reducedVolumeLots,
    },
    {
      key: "increasedVolumeLots",
      label: "Повышенный объём, лот.",
      formula: MM_FORMULAS.increasedVolumeLots,
      operands: { maxPositionLots, baseVolumeLots },
      result: increasedVolumeLots,
    },
  ];

  const debug = buildDebug(input, plannedTradesEffective, riskMode, steps);

  return {
    targetRub,
    baseRiskPerTradeRub,
    stopDistancePoints,
    stopLossRubPerLot,
    slippageRubPerLot,
    totalRiskPerLotRub,
    maxPositionLots,
    actualTradeRiskRub,
    reducedVolumeLots,
    baseVolumeLots,
    increasedVolumeLots,
    increasedVolumeNote: INCREASED_VOLUME_NOTE,
    riskPerLotPoints,
    breakdown,
    warnings,
    debug,
    plannedTradesEffective,
  };
}
