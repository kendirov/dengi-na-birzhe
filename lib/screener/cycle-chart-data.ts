import type { ScreenerMode } from "@/lib/types/screener";

export type CyclePhaseId =
  | "rangeBase"
  | "impulse"
  | "trend"
  | "acceleration"
  | "correction"
  | "wideRange"
  | "breakout"
  | "consolidation";

export interface CyclePhase {
  id: CyclePhaseId;
  title: string;
  subtitle: string;
  logic: string;
  happening: string;
  signs: string[];
  actions: string[];
  meaning: string;
  approach: string;
  screenerWatch: string;
  screenerModeLabel: string;
  primaryMode: ScreenerMode;
  instrumentPickHint: string;
  tone: "cyan" | "green" | "amber" | "red" | "muted" | "violet";
  zoneColor: string;
  xStart: number;
  xEnd: number;
  volumeHint?: string;
}

export interface RawCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  phaseId: CyclePhaseId;
  ghost?: boolean;
}

export interface SceneCandle {
  cx: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  phaseId: CyclePhaseId;
  ghost?: boolean;
}

/** Abstract price levels (higher = more expensive) */
export const PRICE_LEVELS = {
  sidewaysBase: 100,
  sidewaysHigh: 101.5,
  sidewaysLow: 98.5,
  impulseStart: 100,
  impulseEnd: 128,
  trendEnd: 152,
  accelerationPeak: 172,
  correctionLow: 148,
  rangeHigh: 158,
  rangeLow: 148,
  breakoutLevel: 158,
  consolidationTop: 176,
  consolidationBottom: 170,
} as const;

export const CHART = {
  width: 1400,
  height: 520,
  paddingTop: 30,
  paddingBottom: 40,
  paddingLeft: 36,
  paddingRight: 56,
  priceTop: 30,
  priceHeight: 360,
  priceBottom: 390,
  volumeTop: 400,
  volumeHeight: 110,
  volumeBottom: 510,
  volBaseY: 505,
  volMaxH: 95,
  candleWidth: 6,
  candleGap: 14,
} as const;

export const CYCLE_PHASES: CyclePhase[] = [
  {
    id: "rangeBase",
    title: "Боковик",
    subtitle: "Мало объёма, узкий диапазон",
    logic: "Возврат",
    happening:
      "Цена стоит в узком коридоре. Движения короткие, объём низкий — рынок копит энергию без направления.",
    signs: ["Низкий объём", "Узкий диапазон", "Мелкие свечи"],
    actions: [
      "Работать от границ или ждать выход",
      "Не гнаться за микродвижениями",
    ],
    meaning: "Цена стоит в узком диапазоне.",
    approach: "Работа от границ или ожидание выхода.",
    screenerWatch: "диапазон, сделки, цена лота",
    screenerModeLabel: "Для новичка / Техничные",
    primaryMode: "beginner",
    instrumentPickHint:
      "Не ждать большого движения без объёма.",
    tone: "muted",
    zoneColor: "rgba(100, 116, 139, 0.12)",
    xStart: 0,
    xEnd: 0,
    volumeHint: "низкий объём",
  },
  {
    id: "impulse",
    title: "Импульс",
    subtitle: "Короткое сильное движение + объём ×5–10",
    logic: "Потенциал продолжения",
    happening:
      "Рынок резко ускорился: несколько сильных свечей подряд и всплеск сделок. Короткий, но мощный выход из боковика.",
    signs: [
      "Объём ×5–10 от боковика",
      "Крупные зелёные свечи",
      "Большое расстояние за мало свечей",
    ],
    actions: [
      "Не догонять на первом тике",
      "Ждать откат или удержание уровня",
      "Смотреть ленту и оборот",
    ],
    meaning: "Резкое направленное движение на выросших объёмах.",
    approach: "Не догонять вслепую. Смотреть откат или удержание.",
    screenerWatch: "оборот, сделки, диапазон дня",
    screenerModeLabel: "Активные",
    primaryMode: "in-play",
    instrumentPickHint: "Проверить оборот, сделки, диапазон.",
    tone: "cyan",
    zoneColor: "rgba(34, 211, 238, 0.12)",
    xStart: 0,
    xEnd: 0,
    volumeHint: "объём ×5–10",
  },
  {
    id: "trend",
    title: "Тренд",
    subtitle: "Структура держится",
    logic: "Работа по направлению",
    happening:
      "После импульса цена идёт ступеньками: рост → малый откат → рост. Не вертикаль, а волновое продолжение.",
    signs: [
      "Обновление high/low",
      "Мелкие откаты не ломают направление",
      "Объём выше боковика, ниже пика импульса",
    ],
    actions: [
      "Искать входы через откаты",
      "Держать стоп за последним swing",
      "Следить за удержанием уровней",
    ],
    meaning: "Цена продолжает движение после импульса.",
    approach: "Искать входы по направлению через откаты.",
    screenerWatch: "диапазон, high/low, ликвидность",
    screenerModeLabel: "Техничные",
    primaryMode: "technical",
    instrumentPickHint: "Смотреть откаты и удержание структуры.",
    tone: "green",
    zoneColor: "rgba(52, 211, 153, 0.1)",
    xStart: 0,
    xEnd: 0,
    volumeHint: "повышенный объём",
  },
  {
    id: "acceleration",
    title: "Ускорение",
    subtitle: "Дорого догонять",
    logic: "Ждать остановку",
    happening:
      "Сильный вынос наверх: свечи широкие, наклон крутой. Вход дорожает, риск резкого отката растёт.",
    signs: ["Широкие свечи подряд", "Крутой наклон", "Объём снова высокий"],
    actions: [
      "Не догонять без плана",
      "Ждать остановку или откат",
      "Проверить спред и стоимость входа",
    ],
    meaning: "Движение становится слишком быстрым.",
    approach: "Не догонять. Ждать остановку или откат.",
    screenerWatch: "спред, стоимость входа, диапазон",
    screenerModeLabel: "Опасные",
    primaryMode: "dangerous",
    instrumentPickHint: "Не догонять, риск плохой цены.",
    tone: "amber",
    zoneColor: "rgba(251, 191, 36, 0.14)",
    xStart: 0,
    xEnd: 0,
    volumeHint: "объём ×5–10",
  },
  {
    id: "correction",
    title: "Коррекция",
    subtitle: "Откат против движения ~30%",
    logic: "Проверка структуры",
    happening:
      "Цена откатывает против основного движения — примерно треть пройденного пути. Важно: откат или слом.",
    signs: [
      "Красные/смешанные свечи",
      "Объём ниже выноса",
      "Глубина ~30% от движения",
    ],
    actions: [
      "Смотреть уровни и реакцию",
      "Не ловить нож без подтверждения",
    ],
    meaning: "Откат против движения, часто около 30%.",
    approach: "Понять: это откат или слом движения.",
    screenerWatch: "глубина отката, уровни",
    screenerModeLabel: "Техничные",
    primaryMode: "technical",
    instrumentPickHint: "Понять: откат или слом.",
    tone: "cyan",
    zoneColor: "rgba(34, 211, 238, 0.08)",
    xStart: 0,
    xEnd: 0,
  },
  {
    id: "wideRange",
    title: "Диапазон",
    subtitle: "Границы после коррекции",
    logic: "Возврат или ожидание выхода",
    happening:
      "После коррекции цена ходит между верхней и нижней границей. Уровни становятся ключевыми.",
    signs: ["Чёткие верх/низ", "Возвраты от границ", "Объём средний/повышенный"],
    actions: [
      "Работать от границ",
      "Ждать выход с объёмом",
      "Не торговать середину",
    ],
    meaning: "Цена ходит между max и min коррекции.",
    approach: "Работа от границ или ожидание выхода.",
    screenerWatch: "high/low, сделки у границ",
    screenerModeLabel: "Техничные",
    primaryMode: "technical",
    instrumentPickHint: "Работа от границ или ожидание выхода.",
    tone: "muted",
    zoneColor: "rgba(100, 116, 139, 0.12)",
    xStart: 0,
    xEnd: 0,
    volumeHint: "повышенный объём",
  },
  {
    id: "breakout",
    title: "Вынос",
    subtitle: "Возврат или невозврат",
    logic: "Ключевой выбор сценария",
    happening:
      "Цена вышла за границу диапазона. Главный вопрос: это возврат внутрь или точка невозврата?",
    signs: [
      "Всплеск сделок",
      "Объём выше обычного",
      "Удержание уровня или возврат внутрь",
      "Реакция ленты",
    ],
    actions: [
      "Не входить на первый тик",
      "Смотреть удержание уровня",
      "Сравнить объём и реакцию",
      "Выбрать режим «Активные» или «Опасные»",
    ],
    meaning: "Проверка уровня: возврат или невозврат.",
    approach:
      "Если вернулась — возвратная логика. Если удержалась — точка невозврата.",
    screenerWatch: "сделки, оборот, удержание уровня",
    screenerModeLabel: "Активные / Опасные",
    primaryMode: "in-play",
    instrumentPickHint: "Главный вопрос: возврат или невозврат.",
    tone: "red",
    zoneColor: "rgba(248, 113, 113, 0.12)",
    xStart: 0,
    xEnd: 0,
    volumeHint: "повышенный объём",
  },
  {
    id: "consolidation",
    title: "Консолидация",
    subtitle: "Сжатие перед новым выходом",
    logic: "Ждать выход",
    happening:
      "После движения амплитуда и объём сжимаются — рынок копит энергию перед новым выходом.",
    signs: ["Сужение диапазона", "Падающий объём", "Мелкие тела свечей"],
    actions: [
      "Не торговать шум",
      "Ждать выход с подтверждением",
    ],
    meaning: "Сжатие после движения.",
    approach: "Не торговать шум. Ждать выход.",
    screenerWatch: "сужение диапазона, падение сделок",
    screenerModeLabel: "Наблюдать",
    primaryMode: "technical",
    instrumentPickHint: "Ждать выход, не торговать шум.",
    tone: "violet",
    zoneColor: "rgba(167, 139, 250, 0.1)",
    xStart: 0,
    xEnd: 0,
    volumeHint: "объём снижается",
  },
];

function raw(
  open: number,
  close: number,
  high: number,
  low: number,
  volume: number,
  phaseId: CyclePhaseId,
  ghost?: boolean,
): RawCandle {
  return { open, close, high, low, volume, phaseId, ghost };
}

export function createSidewaysPhase(count = 12): RawCandle[] {
  const base = PRICE_LEVELS.sidewaysBase;
  const candles: RawCandle[] = [];
  let price: number = base;
  for (let i = 0; i < count; i++) {
    const drift = (i % 3 === 0 ? 0.4 : i % 3 === 1 ? -0.35 : 0.15) * (i % 2 === 0 ? 1 : -1);
    const open = price;
    const close = Math.max(
      PRICE_LEVELS.sidewaysLow,
      Math.min(PRICE_LEVELS.sidewaysHigh, price + drift),
    );
    const high = Math.min(PRICE_LEVELS.sidewaysHigh + 0.3, Math.max(open, close) + 0.25);
    const low = Math.max(PRICE_LEVELS.sidewaysLow - 0.3, Math.min(open, close) - 0.25);
    const vol = 0.14 + (i % 4) * 0.02;
    candles.push(raw(open, close, high, low, vol, "rangeBase"));
    price = close;
  }
  return candles;
}

export function createImpulsePhase(count = 4): RawCandle[] {
  const start = PRICE_LEVELS.impulseStart;
  const end = PRICE_LEVELS.impulseEnd;
  const step = (end - start) / count;
  const candles: RawCandle[] = [];
  let price: number = start;
  for (let i = 0; i < count; i++) {
    const open = price;
    const close = start + step * (i + 1);
    const high = close + step * 0.35;
    const low = open - step * 0.08;
    const vol = 0.78 + i * 0.06;
    candles.push(raw(open, close, high, low, Math.min(vol, 1), "impulse"));
    price = close;
  }
  return candles;
}

export function createTrendPhase(count = 10): RawCandle[] {
  const start = PRICE_LEVELS.impulseEnd;
  const end = PRICE_LEVELS.trendEnd;
  const candles: RawCandle[] = [];
  let price: number = start;
  for (let i = 0; i < count; i++) {
    const progress = (i + 1) / count;
    const target = start + (end - start) * progress;
    const isPullback = i % 3 === 2;
    const open = price;
    const close = isPullback
      ? price - (end - start) * 0.018
      : target + (i % 2 === 0 ? 0.8 : 0.4);
    const high = Math.max(open, close) + (isPullback ? 0.3 : 0.9);
    const low = Math.min(open, close) - (isPullback ? 1.1 : 0.5);
    const vol = 0.42 + (i % 3) * 0.04;
    candles.push(raw(open, close, high, low, vol, "trend"));
    price = close;
  }
  return candles;
}

export function createAccelerationPhase(count = 4): RawCandle[] {
  const start = PRICE_LEVELS.trendEnd;
  const end = PRICE_LEVELS.accelerationPeak;
  const step = (end - start) / count;
  const candles: RawCandle[] = [];
  let price: number = start;
  for (let i = 0; i < count; i++) {
    const open = price;
    const close = start + step * (i + 1);
    const high = close + step * 0.45;
    const low = open - step * 0.05;
    const vol = 0.82 + i * 0.05;
    candles.push(raw(open, close, high, low, Math.min(vol, 1), "acceleration"));
    price = close;
  }
  return candles;
}

export function createCorrectionPhase(count = 6): RawCandle[] {
  const peak = PRICE_LEVELS.accelerationPeak;
  const low = PRICE_LEVELS.correctionLow;
  const step = (peak - low) / count;
  const candles: RawCandle[] = [];
  let price: number = peak;
  for (let i = 0; i < count; i++) {
    const open = price;
    const close = peak - step * (i + 1);
    const high = open + step * 0.12;
    const lowWick = close - step * 0.15;
    const vol = 0.32 - i * 0.02;
    candles.push(raw(open, close, high, lowWick, Math.max(vol, 0.2), "correction"));
    price = close;
  }
  return candles;
}

export function createWideRangePhase(count = 12): RawCandle[] {
  const hi = PRICE_LEVELS.rangeHigh;
  const lo = PRICE_LEVELS.rangeLow;
  const mid = (hi + lo) / 2;
  const candles: RawCandle[] = [];
  let price: number = mid + 2;
  for (let i = 0; i < count; i++) {
    const open = price;
    const towardTop = i % 4 < 2;
    const close = towardTop
      ? Math.min(hi - 0.5, price + 1.8)
      : Math.max(lo + 0.5, price - 2.2);
    const high = Math.min(hi + 0.4, Math.max(open, close) + 1);
    const low = Math.max(lo - 0.4, Math.min(open, close) - 1);
    const vol = 0.44 + (i % 3) * 0.03;
    candles.push(raw(open, close, high, low, vol, "wideRange"));
    price = close;
  }
  return candles;
}

export function createBreakoutPhase(count = 8): RawCandle[] {
  const level = PRICE_LEVELS.breakoutLevel;
  const candles: RawCandle[] = [];
  let price: number = level - 1;

  for (let i = 0; i < count; i++) {
    const open = price;
    let close: number;
    let high: number;
    let low: number;
    if (i === 0) {
      close = level + 2.5;
      high = close + 1.5;
      low = level - 1;
    } else if (i < 4) {
      close = price + 3.5 - i * 0.3;
      high = close + 1.2;
      low = open - 0.8;
    } else {
      close = price + 1.2;
      high = close + 0.8;
      low = open - 0.5;
    }
    const vol = i === 0 ? 0.88 : i < 3 ? 0.82 : 0.68;
    candles.push(raw(open, close, high, low, vol, "breakout"));
    price = close;
  }

  return candles;
}

/** Ghost path overlaid on breakout — fake return scenario */
export function createBreakoutGhosts(): RawCandle[] {
  const level = PRICE_LEVELS.breakoutLevel;
  return [
    raw(level - 0.5, level + 3, level + 4.5, level - 1, 0.58, "breakout", true),
    raw(level + 3, level + 0.5, level + 3.5, level - 0.5, 0.42, "breakout", true),
    raw(level + 0.5, level - 2, level + 1, level - 3, 0.35, "breakout", true),
  ];
}

export function createConsolidationPhase(count = 8): RawCandle[] {
  const top = PRICE_LEVELS.consolidationTop;
  const bottom = PRICE_LEVELS.consolidationBottom;
  const candles: RawCandle[] = [];
  let price: number = (top + bottom) / 2;
  for (let i = 0; i < count; i++) {
    const squeeze = i / count;
    const rangeHalf = (top - bottom) / 2 * (1 - squeeze * 0.65);
    const center = (top + bottom) / 2;
    const open = price;
    const close = center + (i % 2 === 0 ? rangeHalf * 0.4 : -rangeHalf * 0.35);
    const high = center + rangeHalf;
    const low = center - rangeHalf;
    const vol = 0.22 - i * 0.012;
    candles.push(raw(open, close, high, low, Math.max(vol, 0.08), "consolidation"));
    price = close;
  }
  return candles;
}

export function buildRawCandles(): RawCandle[] {
  return [
    ...createSidewaysPhase(12),
    ...createImpulsePhase(4),
    ...createTrendPhase(10),
    ...createAccelerationPhase(4),
    ...createCorrectionPhase(6),
    ...createWideRangePhase(12),
    ...createBreakoutPhase(8),
    ...createConsolidationPhase(8),
  ];
}

function priceCandle(c: RawCandle, cx: number, priceToY: (p: number) => number): SceneCandle {
  return {
    cx,
    open: priceToY(c.open),
    close: priceToY(c.close),
    high: priceToY(c.high),
    low: priceToY(c.low),
    volume: c.volume,
    phaseId: c.phaseId,
    ghost: c.ghost,
  };
}

export interface ChartScale {
  minPrice: number;
  maxPrice: number;
  priceToY: (price: number) => number;
  yLevels: {
    sidewaysHigh: number;
    sidewaysLow: number;
    trendHigh: number;
    peakHigh: number;
    correctionLow: number;
    rangeHigh: number;
    rangeLow: number;
    breakoutLevel: number;
  };
}

export function buildChartScale(rawCandles: RawCandle[]): ChartScale {
  const minPrice = Math.min(...rawCandles.map((c) => c.low)) - 2;
  const maxPrice = Math.max(...rawCandles.map((c) => c.high)) + 2;
  const span = maxPrice - minPrice;

  const priceToY = (price: number) =>
    CHART.priceTop + ((maxPrice - price) / span) * CHART.priceHeight;

  const yLevels = {
    sidewaysHigh: priceToY(PRICE_LEVELS.sidewaysHigh),
    sidewaysLow: priceToY(PRICE_LEVELS.sidewaysLow),
    trendHigh: priceToY(PRICE_LEVELS.trendEnd),
    peakHigh: priceToY(PRICE_LEVELS.accelerationPeak),
    correctionLow: priceToY(PRICE_LEVELS.correctionLow),
    rangeHigh: priceToY(PRICE_LEVELS.rangeHigh),
    rangeLow: priceToY(PRICE_LEVELS.rangeLow),
    breakoutLevel: priceToY(PRICE_LEVELS.breakoutLevel),
  };

  return { minPrice, maxPrice, priceToY, yLevels };
}

export function layoutCandles(
  rawCandles: RawCandle[],
  scale: ChartScale,
  ghosts: RawCandle[] = createBreakoutGhosts(),
): SceneCandle[] {
  const { priceToY } = scale;
  const step = CHART.candleWidth + CHART.candleGap;
  let x = CHART.paddingLeft + CHART.candleWidth / 2;

  const scene: SceneCandle[] = [];
  const breakoutXs: number[] = [];

  for (const c of rawCandles) {
    scene.push(priceCandle(c, x, priceToY));
    if (c.phaseId === "breakout") breakoutXs.push(x);
    x += step;
  }

  ghosts.forEach((g, i) => {
    const ghostX = breakoutXs[Math.min(i + 1, breakoutXs.length - 1)] ?? breakoutXs[0] ?? x;
    scene.push(priceCandle(g, ghostX + i * 2, priceToY));
  });

  return scene;
}

function assignPhaseZones(candles: SceneCandle[]): CyclePhase[] {
  const phases = CYCLE_PHASES.map((p) => ({ ...p }));
  for (const phase of phases) {
    const phaseCandles = candles.filter(
      (c) => c.phaseId === phase.id && !c.ghost,
    );
    if (phaseCandles.length === 0) continue;
    const xs = phaseCandles.map((c) => c.cx);
    const pad = CHART.candleGap / 2;
    phase.xStart = Math.min(...xs) - pad - CHART.candleWidth;
    phase.xEnd = Math.max(...xs) + pad + CHART.candleWidth;
  }
  return phases;
}

const RAW = buildRawCandles();
export const CHART_SCALE = buildChartScale(RAW);
export const SCENE_CANDLES = layoutCandles(RAW, CHART_SCALE);
export const CYCLE_PHASES_LIVE = assignPhaseZones(SCENE_CANDLES);

export function getPhase(id: CyclePhaseId): CyclePhase {
  return CYCLE_PHASES_LIVE.find((p) => p.id === id) ?? CYCLE_PHASES_LIVE[0]!;
}

export function phaseAtX(x: number): CyclePhaseId {
  const phase = CYCLE_PHASES_LIVE.find((p) => x >= p.xStart && x < p.xEnd);
  return phase?.id ?? "consolidation";
}

/** Resolved Y levels for SVG annotations */
export const LEVELS_Y = CHART_SCALE.yLevels;

/** @deprecated legacy */
export const PRICE_PATH: readonly { x: number; y: number }[] = [];
export const FAKE_BREAKOUT_PATH = "";
export const REAL_BREAKOUT_PATH = "";
export interface VolumeBar {
  x: number;
  w: number;
  h: number;
  phaseId: CyclePhaseId;
}
export const VOLUME_BARS: VolumeBar[] = [];
