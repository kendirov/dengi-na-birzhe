import { formatRub as formatRubBase } from "@/lib/utils/format";
import type { CalculationStep } from "./types";

export function formatRub(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return formatRubBase(value);
}

export function formatPoints(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  const n = digits > 0 ? value.toFixed(digits) : String(Math.round(value));
  return `${n.replace(".", ",")} п.`;
}

export function formatLots(lots: number): string {
  if (!Number.isFinite(lots) || lots < 0) return "—";
  return `${lots} лот.`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const str = Number.isInteger(value)
    ? String(value)
    : value.toFixed(1).replace(".", ",");
  return `${str} %`;
}

/** @deprecated use formatPoints */
export function formatMmPoints(value: number, digits = 1): string {
  return formatPoints(value, digits);
}

/** @deprecated use formatLots */
export function formatMmLotsDisplay(lots: number): string {
  if (!Number.isFinite(lots) || lots <= 0) return "0 лот.";
  return formatLots(lots);
}

/** @deprecated use formatLots */
export function formatMmLots(lots: number): string {
  return formatLots(lots);
}

export function formatTickSize(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1) return value.toFixed(0).replace(".", ",");
  if (value >= 0.01) return value.toFixed(2).replace(".", ",");
  return value.toFixed(3).replace(".", ",");
}

export function formatCalculationStep(step: CalculationStep): string {
  const operandStr = Object.entries(step.operands)
    .map(([k, v]) => `${k}=${Number.isInteger(v) ? v : v.toFixed(4)}`)
    .join(", ");
  const resultStr =
    step.key.includes("Lots") || step.key === "maxPositionLots"
      ? formatLots(step.result)
      : step.key.includes("Points")
        ? formatPoints(step.result, 2)
        : formatRub(step.result);
  return `${step.label}: ${step.formula} → ${operandStr} = ${resultStr}`;
}
