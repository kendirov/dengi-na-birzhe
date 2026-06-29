import type { DailyPlanUiInput } from "./types";
import {
  DEFAULT_INSTRUMENT_ID,
  getInstrumentPreset,
} from "./instrument-presets";

export {
  DEFAULT_INSTRUMENT_ID,
  DEFAULT_STOP_POINTS,
  DEFAULT_SLIPPAGE_POINTS,
  getInstrumentPreset,
  INSTRUMENT_PRESETS,
  STOCK_PRESETS,
  FUTURE_PRESETS,
} from "./instrument-presets";
export type { InstrumentPreset, InstrumentCategory } from "./instrument-presets";

export const DEFAULT_DAILY_PLAN: DailyPlanUiInput = {
  depositRub: 500,
  drawdownRub: 50,
  dailyGoalPct: 10,
  plannedTrades: 5,
};

export const DEMO_INSTRUMENT = getInstrumentPreset(DEFAULT_INSTRUMENT_ID);
