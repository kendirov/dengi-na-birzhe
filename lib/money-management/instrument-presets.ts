import type { DemoInstrument } from "./types";

export type InstrumentCategory = "stock" | "future";

export interface InstrumentPreset extends DemoInstrument {
  id: string;
  category: InstrumentCategory;
  /** @deprecated use spreadRub — kept for orderbook trainer compat */
  typicalSpreadRub?: number;
}

function preset(
  p: Omit<InstrumentPreset, "pointValueRub" | "lotValue"> & {
    pointValueRub?: number;
    lotValue?: number;
  },
): InstrumentPreset {
  const pointValueRub = p.pointValueRub ?? p.tickSize * p.lotSize;
  const lotValue = p.lotValue ?? p.price * p.lotSize;
  const typicalSpreadRub = p.typicalSpreadRub ?? p.spreadRub;
  return { ...p, pointValueRub, lotValue, typicalSpreadRub };
}

export const STOCK_PRESETS: InstrumentPreset[] = [
  preset({
    id: "SBER",
    category: "stock",
    ticker: "SBER",
    name: "Сбербанк",
    price: 312.45,
    lotSize: 10,
    tickSize: 0.01,
    spreadRub: 0.03,
  }),
  preset({
    id: "SBERP",
    category: "stock",
    ticker: "SBERP",
    name: "Сбербанк-п",
    price: 278.5,
    lotSize: 10,
    tickSize: 0.01,
    spreadRub: 0.04,
  }),
  preset({
    id: "VTBR",
    category: "stock",
    ticker: "VTBR",
    name: "ВТБ",
    price: 98.42,
    lotSize: 10000,
    tickSize: 0.01,
    spreadRub: 0.02,
  }),
  preset({
    id: "MOEX",
    category: "stock",
    ticker: "MOEX",
    name: "Мосбиржа",
    price: 218.6,
    lotSize: 10,
    tickSize: 0.01,
    spreadRub: 0.03,
  }),
  preset({
    id: "AFKS",
    category: "stock",
    ticker: "AFKS",
    name: "Система",
    price: 14.82,
    lotSize: 100,
    tickSize: 0.001,
    spreadRub: 0.002,
  }),
  preset({
    id: "GAZP",
    category: "stock",
    ticker: "GAZP",
    name: "Газпром",
    price: 128.67,
    lotSize: 10,
    tickSize: 0.01,
    spreadRub: 0.02,
  }),
  preset({
    id: "LKOH",
    category: "stock",
    ticker: "LKOH",
    name: "Лукойл",
    price: 7128.0,
    lotSize: 1,
    tickSize: 1.0,
    spreadRub: 2.0,
  }),
  preset({
    id: "ROSN",
    category: "stock",
    ticker: "ROSN",
    name: "Роснефть",
    price: 542.3,
    lotSize: 1,
    tickSize: 0.05,
    spreadRub: 0.15,
  }),
  preset({
    id: "NVTK",
    category: "stock",
    ticker: "NVTK",
    name: "Новатэк",
    price: 1189.4,
    lotSize: 1,
    tickSize: 0.2,
    spreadRub: 0.6,
  }),
  preset({
    id: "TATN",
    category: "stock",
    ticker: "TATN",
    name: "Татнефть",
    price: 612.8,
    lotSize: 1,
    tickSize: 0.1,
    spreadRub: 0.2,
  }),
  preset({
    id: "SMLT",
    category: "stock",
    ticker: "SMLT",
    name: "Самолёт",
    price: 3120.0,
    lotSize: 1,
    tickSize: 1.0,
    spreadRub: 3.0,
  }),
  preset({
    id: "MTLR",
    category: "stock",
    ticker: "MTLR",
    name: "Мечел",
    price: 78.45,
    lotSize: 10,
    tickSize: 0.01,
    spreadRub: 0.02,
  }),
  preset({
    id: "WUSH",
    category: "stock",
    ticker: "WUSH",
    name: "Whoosh",
    price: 1842.5,
    lotSize: 1,
    tickSize: 0.5,
    spreadRub: 3.0,
  }),
];

export const FUTURE_PRESETS: InstrumentPreset[] = [
  preset({
    id: "RI",
    category: "future",
    ticker: "RI",
    name: "RTS / Ri",
    price: 112000,
    lotSize: 1,
    tickSize: 10,
    pointValueRub: 20,
    lotValue: 112000,
    spreadRub: 10,
  }),
  preset({
    id: "Si",
    category: "future",
    ticker: "Si",
    name: "Si (USD/RUB)",
    price: 92450,
    lotSize: 1,
    tickSize: 1,
    pointValueRub: 1,
    lotValue: 92450,
    spreadRub: 1,
  }),
  preset({
    id: "Br",
    category: "future",
    ticker: "Br",
    name: "Brent",
    price: 82.5,
    lotSize: 1,
    tickSize: 0.01,
    pointValueRub: 0.72,
    lotValue: 82.5,
    spreadRub: 0.02,
  }),
  preset({
    id: "SR",
    category: "future",
    ticker: "SR",
    name: "Sber fut",
    price: 31200,
    lotSize: 1,
    tickSize: 1,
    pointValueRub: 1,
    lotValue: 31200,
    spreadRub: 1,
  }),
  preset({
    id: "GZ",
    category: "future",
    ticker: "GZ",
    name: "Gazp fut",
    price: 12850,
    lotSize: 1,
    tickSize: 1,
    pointValueRub: 1,
    lotValue: 12850,
    spreadRub: 1,
  }),
];

export const INSTRUMENT_PRESETS: InstrumentPreset[] = [
  ...STOCK_PRESETS,
  ...FUTURE_PRESETS,
];

export function getInstrumentPreset(id: string): InstrumentPreset {
  return INSTRUMENT_PRESETS.find((p) => p.id === id) ?? STOCK_PRESETS[0];
}

export const DEFAULT_INSTRUMENT_ID = "SBER";

export const DEFAULT_STOP_POINTS = 40;
export const DEFAULT_SLIPPAGE_POINTS = 2;
