/**

 * Pixel layout constants from CiScalp.png (984×1200).

 * Regenerate artifacts/reference-analysis.json: npm run analyze:reference

 * Keep in sync with src/features/terminal/styles/tokens.css

 */



export const REFERENCE_IMAGE_PATH = "/reference/cscalp-reference.png";



export const REFERENCE_WIDTH = 984;

export const REFERENCE_HEIGHT = 1200;



/** Vertical zones (y / height px) — CiScalp.png stack */

export const TOPBAR_Y = 0;

export const TOPBAR_H = 28;



export const INSTRUMENT_Y = 28;

export const INSTRUMENT_H = 27;



export const MAIN_Y = 55;

export const MAIN_H = 817;



export const CHART_HEADER_Y = 872;

export const CHART_HEADER_H = 34;

export const BOTTOM_TABS_Y = 1176;

export const BOTTOM_TABS_H = 24;

export const CHART_Y = 906;

/** Fills canvas to 1200 with fixed rows above (819 main + 29 header + 24 tabs). */

export const CHART_H =

  REFERENCE_HEIGHT - TOPBAR_H - INSTRUMENT_H - MAIN_H - CHART_HEADER_H - BOTTOM_TABS_H;



/** Chart dock = header strip + candle area */

export const CHART_DOCK_H = CHART_HEADER_H + CHART_H;



/** Aliases for scale / viewport math */

export const CSCALP_DESIGN_WIDTH = REFERENCE_WIDTH;

export const CSCALP_DESIGN_HEIGHT = REFERENCE_HEIGHT;



export const REFERENCE_LAYOUT = {

  width: REFERENCE_WIDTH,

  height: REFERENCE_HEIGHT,

  topbar: { y: TOPBAR_Y, h: TOPBAR_H },

  instrument: { y: INSTRUMENT_Y, h: INSTRUMENT_H },

  main: { y: MAIN_Y, h: MAIN_H },

  chartHeader: { y: CHART_HEADER_Y, h: CHART_HEADER_H },

  chart: { y: CHART_Y, h: CHART_H },

  bottomTabs: { y: BOTTOM_TABS_Y, h: BOTTOM_TABS_H },

} as const;



/** Pixel / scenario modes always show the chart dock. */

export function isChartDockForcedOpen(mode: string): boolean {

  return mode === "terminal" || mode === "scenario";

}


