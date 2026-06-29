export type SandboxScenarioId = "calm" | "working" | "empty" | "density";

export type GlossaryTermId =
  | "bid"
  | "ask"
  | "spread"
  | "limitOrder"
  | "marketOrder"
  | "maker"
  | "taker"
  | "tape"
  | "density"
  | "iceberg"
  | "slippage"
  | "errorCost";

export interface BookLevel {
  price: number;
  bidQty: number;
  askQty: number;
  /** Учебная плотность на bid */
  isDensity?: boolean;
  /** Айсберг: видимая часть меньше полной */
  icebergHidden?: number;
}

export interface TapePrint {
  id: string;
  time: string;
  price: number;
  qty: number;
  side: "buy" | "sell";
  aggressive?: boolean;
  note?: string;
}

export interface UserOrder {
  id: string;
  price: number;
  qty: number;
  side: "bid" | "ask";
  isUser: true;
}

export interface ScenarioConfig {
  id: SandboxScenarioId;
  label: string;
  description: string;
  tickSize: number;
  lotSize: number;
  levels: BookLevel[];
  initialTape: TapePrint[];
  tapeIntervalMs: number;
  autoTapeEnabled: boolean;
}

function fmtTime(d = new Date()): string {
  return d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildCalmLevels(): BookLevel[] {
  return [
    { price: 312.46, bidQty: 0, askQty: 800 },
    { price: 312.45, bidQty: 0, askQty: 1200 },
    { price: 312.44, bidQty: 0, askQty: 900 },
    { price: 312.43, bidQty: 1500, askQty: 0 },
    { price: 312.42, bidQty: 2200, askQty: 0 },
    { price: 312.41, bidQty: 1100, askQty: 0 },
  ];
}

function buildWorkingLevels(): BookLevel[] {
  return [
    { price: 312.48, bidQty: 0, askQty: 400 },
    { price: 312.47, bidQty: 0, askQty: 600 },
    { price: 312.46, bidQty: 0, askQty: 900 },
    { price: 312.45, bidQty: 0, askQty: 1400 },
    { price: 312.44, bidQty: 800, askQty: 0 },
    { price: 312.43, bidQty: 1200, askQty: 0 },
    { price: 312.42, bidQty: 1800, askQty: 0 },
    { price: 312.41, bidQty: 600, askQty: 0 },
  ];
}

function buildEmptyLevels(): BookLevel[] {
  return [
    { price: 312.52, bidQty: 0, askQty: 120 },
    { price: 312.50, bidQty: 0, askQty: 80 },
    { price: 312.48, bidQty: 0, askQty: 60 },
    { price: 312.46, bidQty: 0, askQty: 40 },
    { price: 312.44, bidQty: 50, askQty: 0 },
    { price: 312.42, bidQty: 70, askQty: 0 },
    { price: 312.40, bidQty: 40, askQty: 0 },
  ];
}

function buildDensityLevels(): BookLevel[] {
  return [
    { price: 312.46, bidQty: 0, askQty: 700 },
    { price: 312.45, bidQty: 0, askQty: 1100 },
    { price: 312.44, bidQty: 600, askQty: 0 },
    { price: 312.43, bidQty: 900, askQty: 0 },
    {
      price: 312.40,
      bidQty: 5000,
      askQty: 0,
      isDensity: true,
      icebergHidden: 45000,
    },
    { price: 312.39, bidQty: 400, askQty: 0 },
  ];
}

export const SCENARIO_CONFIGS: Record<SandboxScenarioId, ScenarioConfig> = {
  calm: {
    id: "calm",
    label: "Спокойный стакан",
    description: "Узкий spread, глубина есть, лента медленная.",
    tickSize: 0.01,
    lotSize: 10,
    levels: buildCalmLevels(),
    tapeIntervalMs: 4500,
    autoTapeEnabled: true,
    initialTape: [
      { id: "c1", time: fmtTime(), price: 312.43, qty: 10, side: "buy" },
      { id: "c2", time: fmtTime(), price: 312.42, qty: 5, side: "sell" },
    ],
  },
  working: {
    id: "working",
    label: "Рабочий spread",
    description: "Spread несколько пунктов, сделки идут.",
    tickSize: 0.01,
    lotSize: 10,
    levels: buildWorkingLevels(),
    tapeIntervalMs: 2200,
    autoTapeEnabled: true,
    initialTape: [
      { id: "w1", time: fmtTime(), price: 312.45, qty: 30, side: "buy", aggressive: true },
      { id: "w2", time: fmtTime(), price: 312.44, qty: 15, side: "sell" },
      { id: "w3", time: fmtTime(), price: 312.45, qty: 20, side: "buy", aggressive: true },
    ],
  },
  empty: {
    id: "empty",
    label: "Пустой стакан",
    description: "Широкий spread, мало объёма, лента редкая.",
    tickSize: 0.01,
    lotSize: 10,
    levels: buildEmptyLevels(),
    tapeIntervalMs: 6000,
    autoTapeEnabled: true,
    initialTape: [
      { id: "e1", time: fmtTime(), price: 312.46, qty: 5, side: "buy", aggressive: true },
    ],
  },
  density: {
    id: "density",
    label: "Плотность",
    description: "Крупный уровень на bid, цена может отскочить.",
    tickSize: 0.01,
    lotSize: 10,
    levels: buildDensityLevels(),
    tapeIntervalMs: 3000,
    autoTapeEnabled: false,
    initialTape: [
      { id: "d1", time: fmtTime(), price: 312.41, qty: 40, side: "sell" },
      { id: "d2", time: fmtTime(), price: 312.40, qty: 120, side: "sell", aggressive: true },
    ],
  },
};

export const GLOSSARY_TERMS: {
  id: GlossaryTermId;
  label: string;
  description: string;
  highlight: string;
}[] = [
  {
    id: "bid",
    label: "Bid",
    description: "Лучшая заявка на покупку. По этой цене рынок готов купить у вас.",
    highlight: "bid",
  },
  {
    id: "ask",
    label: "Ask",
    description: "Лучшая заявка на продажу. По этой цене рынок готов продать вам.",
    highlight: "ask",
  },
  {
    id: "spread",
    label: "Spread",
    description: "Разница между лучшим ask и bid. Базовая стоимость быстрого входа.",
    highlight: "spread",
  },
  {
    id: "limitOrder",
    label: "Лимитная заявка",
    description: "Заявка по заданной цене. Становится в очередь и ждёт исполнения.",
    highlight: "limit-actions",
  },
  {
    id: "marketOrder",
    label: "Рыночная заявка",
    description: "Исполнение по лучшей доступной цене прямо сейчас.",
    highlight: "market-actions",
  },
  {
    id: "maker",
    label: "Maker",
    description: "Добавляет ликвидность в стакан. Обычно лимитка ниже ask / выше bid.",
    highlight: "maker-note",
  },
  {
    id: "taker",
    label: "Taker",
    description: "Забирает ликвидность — бьёт по лучшему ask или bid.",
    highlight: "taker-note",
  },
  {
    id: "tape",
    label: "Лента",
    description: "Поток сделок: время, цена, объём. Показывает, кто агрессивнее.",
    highlight: "tape",
  },
  {
    id: "density",
    label: "Плотность",
    description: "Крупный объём на одном уровне. Может удерживать цену или быть ловушкой.",
    highlight: "density",
  },
  {
    id: "iceberg",
    label: "Айсберг",
    description: "Видимая часть заявки меньше полной. После удара объём может «восстановиться».",
    highlight: "iceberg",
  },
  {
    id: "slippage",
    label: "Проскальзывание",
    description: "Исполнение хуже ожидаемой цены, если стакан тонкий.",
    highlight: "slippage",
  },
  {
    id: "errorCost",
    label: "Цена ошибки",
    description: "Сколько стоит один шаг / spread / комиссия на ваш лот.",
    highlight: "error-cost",
  },
];

export function getBestBid(levels: BookLevel[]): BookLevel | null {
  return (
    [...levels]
      .filter((l) => l.bidQty > 0)
      .sort((a, b) => b.price - a.price)[0] ?? null
  );
}

export function getBestAsk(levels: BookLevel[]): BookLevel | null {
  return (
    [...levels]
      .filter((l) => l.askQty > 0)
      .sort((a, b) => a.price - b.price)[0] ?? null
  );
}

export function spreadTicks(
  bestBid: BookLevel | null,
  bestAsk: BookLevel | null,
  tick: number,
): number | null {
  if (!bestBid || !bestAsk || tick <= 0) return null;
  return Math.round((bestAsk.price - bestBid.price) / tick);
}

export function createAutoTapePrint(
  scenario: ScenarioConfig,
  bestBid: BookLevel | null,
  bestAsk: BookLevel | null,
): TapePrint {
  const buy = Math.random() > 0.45;
  const price = buy
    ? (bestAsk?.price ?? 312.45)
    : (bestBid?.price ?? 312.42);
  const qty = scenario.id === "empty" ? 5 + Math.floor(Math.random() * 10) : 10 + Math.floor(Math.random() * 40);
  return {
    id: `auto-${Date.now()}`,
    time: fmtTime(),
    price,
    qty,
    side: buy ? "buy" : "sell",
    aggressive: buy,
  };
}

export { fmtTime };
