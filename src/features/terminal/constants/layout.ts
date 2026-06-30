/** Shared layout numbers — keep in sync with `styles/tokens.css` and `referenceLayout.ts`. */



export {

  REFERENCE_WIDTH,

  REFERENCE_HEIGHT,

  REFERENCE_IMAGE_PATH,

  CSCALP_DESIGN_WIDTH,

  CSCALP_DESIGN_HEIGHT,

  TOPBAR_H,

  INSTRUMENT_H,

  MAIN_H,

  CHART_HEADER_H,

  CHART_H,

  CHART_DOCK_H,

  BOTTOM_TABS_H,

  REFERENCE_LAYOUT,

} from "./referenceLayout";



/** Padding reserved when terminal sits inside site shell (?landing=1). */

export const CSCALP_VIEWPORT_PAD_X = 24;

export const CSCALP_VIEWPORT_PAD_Y = 160;



/** Fullscreen /stakan-lenta — terminal only, no site chrome. */

export const CSCALP_FULLSCREEN_PAD_X = 0;

export const CSCALP_FULLSCREEN_PAD_Y = 0;



export type TrainerChromeMode = "fullscreen" | "landing";



export const TAPE_MAX_PRINTS = 48;

export const TAPE_TTL_MS = 5200;

export const TAPE_FADE_MS = 1400;

/** New print enters at the right edge of the tape lane (%). */
export const TAPE_ENTRY_X = 92;

export const TAPE_LANE_START = TAPE_ENTRY_X;

export const TAPE_LANE_JITTER = 4;

/** Left drift speed (% per second approx). */
export const TAPE_DRIFT_PER_SEC = 4.2;

export const TAPE_DRIFT_FACTOR = 0.15;

/** Bubble diameter bounds (px) — sync tokens.css */
export const TAPE_BUBBLE_MIN = 12;

export const TAPE_BUBBLE_MAX = 22;

export const CSCALP_ROW_H = 13;



/** Deterministic mock sandbox — not for live trading paths. */

export const MOCK_DETERMINISTIC_SEED = 42;

