/** Инструменты для компактного блока «Примеры». */
export const FEATURED_INSTRUMENT_IDS = [
  "SBER",
  "GAZP",
  "VTBR",
  "LKOH",
  "ROSN",
  "SMLT",
  "MTLR",
  "WUSH",
] as const;

export type FeaturedInstrumentId = (typeof FEATURED_INSTRUMENT_IDS)[number];

export function rubFromPct(depositRub: number, pct: number): number {
  return (Math.max(0, depositRub) * Math.max(0, pct)) / 100;
}

export function pctFromRub(depositRub: number, rub: number): number {
  if (depositRub <= 0) return 0;
  return (Math.max(0, rub) / depositRub) * 100;
}
