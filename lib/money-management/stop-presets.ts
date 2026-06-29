import type { LearningScenario } from "./scenarios";

export type StopScenario = LearningScenario;

export interface InstrumentStopPresets {
  aggressive: number;
  normal: number;
  cautious: number;
}

/** Пресеты стопа в пунктах инструмента (шагах цены). */
export const INSTRUMENT_STOP_PRESETS: Record<string, InstrumentStopPresets> = {
  SBER: { aggressive: 10, normal: 20, cautious: 30 },
  SBERP: { aggressive: 10, normal: 20, cautious: 30 },
  VTBR: { aggressive: 3, normal: 5, cautious: 8 },
  MOEX: { aggressive: 10, normal: 20, cautious: 30 },
  AFKS: { aggressive: 20, normal: 40, cautious: 60 },
  GAZP: { aggressive: 10, normal: 20, cautious: 30 },
  LKOH: { aggressive: 2, normal: 4, cautious: 6 },
  ROSN: { aggressive: 2, normal: 4, cautious: 6 },
  NVTK: { aggressive: 2, normal: 4, cautious: 6 },
  TATN: { aggressive: 2, normal: 4, cautious: 6 },
  SMLT: { aggressive: 1, normal: 2, cautious: 4 },
  MTLR: { aggressive: 1, normal: 2, cautious: 4 },
  WUSH: { aggressive: 1, normal: 2, cautious: 4 },
};

const FALLBACK_PRESETS: InstrumentStopPresets = {
  aggressive: 10,
  normal: 20,
  cautious: 30,
};

export function getInstrumentStopPreset(
  instrumentId: string,
  scenario: StopScenario,
): number {
  const presets = INSTRUMENT_STOP_PRESETS[instrumentId] ?? FALLBACK_PRESETS;
  return presets[scenario];
}

export function buildStopPointsMap(
  instrumentIds: string[],
  scenario: StopScenario,
  overrides: Record<string, number> = {},
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const id of instrumentIds) {
    map[id] =
      overrides[id] ?? getInstrumentStopPreset(id, scenario);
  }
  return map;
}
