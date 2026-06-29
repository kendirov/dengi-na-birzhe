import { computeCommissionCosts } from "@/lib/screener/commission";
import {
  calculateBeaconVolumeLots,
  calculateDoubleVolumeLots,
  calculateFullVolumeLots,
  calculateHalfVolumeLots,
  calculateQuarterVolumeLots,
} from "./formulas";
import type { InstrumentPreset } from "./instrument-presets";
import type { OrderSide } from "./types";

export interface VolumeRowResult {
  id: string;
  name: string;
  ticker: string;
  tickSize: number;
  pointValueRub: number;
  entryCommissionPoints: number;
  exitCommissionPoints: number;
  stopPoints: number;
  slipPoints: number;
  fullRiskPoints: number;
  riskPerLotRub: number;
  /** @deprecated use halfVolume */
  reducedVolume: number;
  /** Полный рабочий объём */
  baseVolume: number;
  /** @deprecated use doubleVolume */
  increasedVolume: number;
  beaconVolume: number;
  quarterVolume: number;
  halfVolume: number;
  doubleVolume: number;
  highRisk: boolean;
}

export function resolveCommissionPoints(
  lotValue: number,
  lotSize: number,
  pointValueRub: number,
  orderType: OrderSide,
): number {
  const costs = computeCommissionCosts({
    lotValue,
    lotSize,
    spreadRub: null,
    spreadTicks: null,
    tickValueRub: pointValueRub,
  });
  const points =
    orderType === "limit"
      ? costs.commissionLimitPoints
      : costs.commissionMarketPoints;
  return points ?? 0;
}

export function calculateVolumeRow(params: {
  preset: InstrumentPreset;
  stopPoints: number;
  slipPoints: number;
  entryOrderType: OrderSide;
  exitOrderType: OrderSide;
  riskPerTradeRub: number;
}): VolumeRowResult {
  const {
    preset,
    stopPoints,
    slipPoints,
    entryOrderType,
    exitOrderType,
    riskPerTradeRub,
  } = params;

  const safeStop = Math.max(0, stopPoints);
  const safeSlip = Math.max(0, slipPoints);
  const safeRisk = Math.max(0, riskPerTradeRub);

  const entryCommissionPoints = resolveCommissionPoints(
    preset.lotValue,
    preset.lotSize,
    preset.pointValueRub,
    entryOrderType,
  );
  const exitCommissionPoints = resolveCommissionPoints(
    preset.lotValue,
    preset.lotSize,
    preset.pointValueRub,
    exitOrderType,
  );

  const fullRiskPoints =
    safeStop + safeSlip + entryCommissionPoints + exitCommissionPoints;
  const riskPerLotRub = fullRiskPoints * preset.pointValueRub;
  const baseVolume = calculateFullVolumeLots(safeRisk, riskPerLotRub);
  const beaconVolume = calculateBeaconVolumeLots();
  const quarterVolume = calculateQuarterVolumeLots(baseVolume);
  const halfVolume = calculateHalfVolumeLots(baseVolume);
  const doubleVolume = calculateDoubleVolumeLots(baseVolume);
  const reducedVolume = halfVolume;
  const increasedVolume = doubleVolume;

  return {
    id: preset.id,
    name: preset.name,
    ticker: preset.ticker,
    tickSize: preset.tickSize,
    pointValueRub: preset.pointValueRub,
    entryCommissionPoints,
    exitCommissionPoints,
    stopPoints: safeStop,
    slipPoints: safeSlip,
    fullRiskPoints,
    riskPerLotRub,
    reducedVolume,
    baseVolume,
    increasedVolume,
    beaconVolume,
    quarterVolume,
    halfVolume,
    doubleVolume,
    highRisk: baseVolume < 1,
  };
}

export function calculateVolumeTable(params: {
  presets: InstrumentPreset[];
  stopPointsById: Record<string, number>;
  slipPoints: number;
  entryOrderType: OrderSide;
  exitOrderType: OrderSide;
  riskPerTradeRub: number;
}): VolumeRowResult[] {
  const stops = params.stopPointsById ?? {};
  return params.presets.map((preset) =>
    calculateVolumeRow({
      preset,
      stopPoints: stops[preset.id] ?? 20,
      slipPoints: params.slipPoints,
      entryOrderType: params.entryOrderType,
      exitOrderType: params.exitOrderType,
      riskPerTradeRub: params.riskPerTradeRub,
    }),
  );
}

/** Верификационный пример SBER из ТЗ (для debug). */
export function buildSberVerificationReport(): {
  inputs: Record<string, number | string>;
  steps: string[];
  expectedBaseVolume: number;
} {
  const sber = calculateVolumeRow({
    preset: {
      id: "SBER",
      category: "stock",
      ticker: "SBER",
      name: "Сбербанк",
      price: 303.66,
      lotSize: 1,
      tickSize: 0.01,
      pointValueRub: 0.01,
      lotValue: 303.66,
      spreadRub: 0.03,
    },
    stopPoints: 40,
    slipPoints: 2,
    entryOrderType: "limit",
    exitOrderType: "market",
    riskPerTradeRub: 10,
  });

  return {
    inputs: {
      deposit: 500,
      drawdown: 50,
      trades: 5,
      riskPerTrade: 10,
      ticker: "SBER",
      pointValueRub: 0.01,
      stop: 40,
      slip: 2,
      entryCommission: sber.entryCommissionPoints,
      exitCommission: sber.exitCommissionPoints,
    },
    steps: [
      `fullRiskPoints = ${sber.stopPoints} + ${sber.slipPoints} + ${sber.entryCommissionPoints} + ${sber.exitCommissionPoints} = ${sber.fullRiskPoints} п.`,
      `riskPerLotRub = ${sber.fullRiskPoints} × 0,01 = ${sber.riskPerLotRub.toFixed(2).replace(".", ",")} ₽`,
      `baseVolume = floor(10 / ${sber.riskPerLotRub.toFixed(2)}) = ${sber.baseVolume} лот.`,
    ],
    expectedBaseVolume: 16,
  };
}
