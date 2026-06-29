import type { LearningScenario } from "./scenarios";
import { getInstrumentStopPreset } from "./stop-presets";

export type StopMode = LearningScenario | "custom";

export const STOP_MODE_OPTIONS: {
  id: StopMode;
  label: string;
}[] = [
  { id: "aggressive", label: "Агрессивно" },
  { id: "normal", label: "Нормально" },
  { id: "cautious", label: "Осторожно" },
  { id: "custom", label: "Свой стоп" },
];

export function resolveStopPoints(
  instrumentId: string,
  mode: StopMode,
  customStopPoints: number,
): number {
  if (mode === "custom") {
    return Math.max(1, customStopPoints);
  }
  return getInstrumentStopPreset(instrumentId, mode);
}
