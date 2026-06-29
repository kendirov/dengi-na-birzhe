import {
  calculateBeaconVolumeLots,
  calculateDoubleVolumeLots,
  calculateFullVolumeLots,
  calculateHalfVolumeLots,
  calculateQuarterVolumeLots,
  calculateTargetRub,
  normalizePlannedTrades,
  POSITION_TOO_SMALL_MESSAGE,
  resolveBaseRiskPerTradeRub,
} from "./formulas";
import { getInstrumentPreset } from "./defaults";
import { FEATURED_INSTRUMENT_IDS } from "./featured-instruments";
import { resolveStopPoints, type StopMode } from "./stop-mode";
import {
  calculateVolumeRow,
  resolveCommissionPoints,
  type VolumeRowResult,
} from "./table-calculate";
import type { DailyPlanUiInput, DailyPlanUiResult, OrderSide } from "./types";

export interface VolumeLevels {
  marker: number;
  quarter: number;
  half: number;
  full: number;
  double: number;
  highRisk: boolean;
  warning: string | null;
}

export interface VolumeCalcInput {
  riskPerTradeRub: number;
  stopPoints: number;
  slipPoints: number;
  entryOrderType: OrderSide;
  exitOrderType: OrderSide;
  pointValueRub: number;
  lotValue: number;
  lotSize: number;
}

export interface VolumeCalcResult extends VolumeLevels {
  fullRiskPoints: number;
  riskPerLotRub: number;
  entryCommissionPoints: number;
  exitCommissionPoints: number;
}

/** План дня: цель, просадка, риск на сделку. */
export function computeDailyPlan(input: DailyPlanUiInput): DailyPlanUiResult {
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

/** 5 объёмов для привода по формулам ТЗ. */
export function computeVolumeLevels(params: VolumeCalcInput): VolumeCalcResult {
  const safeStop = Math.max(0, params.stopPoints);
  const safeSlip = Math.max(0, params.slipPoints);
  const safeRisk = Math.max(0, params.riskPerTradeRub);

  const entryCommissionPoints = resolveCommissionPoints(
    params.lotValue,
    params.lotSize,
    params.pointValueRub,
    params.entryOrderType,
  );
  const exitCommissionPoints = resolveCommissionPoints(
    params.lotValue,
    params.lotSize,
    params.pointValueRub,
    params.exitOrderType,
  );

  const fullRiskPoints =
    safeStop + safeSlip + entryCommissionPoints + exitCommissionPoints;
  const riskPerLotRub = fullRiskPoints * params.pointValueRub;
  const full = calculateFullVolumeLots(safeRisk, riskPerLotRub);
  const highRisk = full < 1;

  return {
    fullRiskPoints,
    riskPerLotRub,
    entryCommissionPoints,
    exitCommissionPoints,
    marker: calculateBeaconVolumeLots(),
    quarter: calculateQuarterVolumeLots(full),
    half: calculateHalfVolumeLots(full),
    full,
    double: calculateDoubleVolumeLots(full),
    highRisk,
    warning: highRisk ? POSITION_TOO_SMALL_MESSAGE : null,
  };
}

export function computeVolumeRowFromPreset(params: {
  instrumentId: string;
  stopMode: StopMode;
  customStopPoints: number;
  slipPoints: number;
  entryOrderType: OrderSide;
  exitOrderType: OrderSide;
  riskPerTradeRub: number;
}): VolumeRowResult {
  const preset = getInstrumentPreset(params.instrumentId);
  if (!preset) {
    throw new Error(`Unknown instrument: ${params.instrumentId}`);
  }

  return calculateVolumeRow({
    preset,
    stopPoints: resolveStopPoints(
      params.instrumentId,
      params.stopMode,
      params.customStopPoints,
    ),
    slipPoints: params.slipPoints,
    entryOrderType: params.entryOrderType,
    exitOrderType: params.exitOrderType,
    riskPerTradeRub: params.riskPerTradeRub,
  });
}

/** Матрица риска для featured-инструментов. */
export function computeFeaturedMatrix(params: {
  stopMode: StopMode;
  customStopPoints: number;
  slipPoints: number;
  entryOrderType: OrderSide;
  exitOrderType: OrderSide;
  riskPerTradeRub: number;
}): VolumeRowResult[] {
  return FEATURED_INSTRUMENT_IDS.map((id) =>
    computeVolumeRowFromPreset({ instrumentId: id, ...params }),
  );
}

export function effectiveTrades(plannedTrades: number): number {
  return normalizePlannedTrades(plannedTrades);
}

export function tradesHint(plannedTrades: number): string | null {
  const t = effectiveTrades(plannedTrades);
  if (t >= 8) {
    return "Больше сделок → меньше риск на одну сделку.";
  }
  if (t <= 2) {
    return "Мало сделок → риск на сделку выше.";
  }
  return null;
}
