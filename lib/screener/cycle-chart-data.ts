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

export const CYCLE_PHASES: CyclePhase[] = [
  {
    id: "rangeBase",
    title: "Боковик",
    subtitle: "Мало объёма, узкий диапазон",
    logic: "Возврат",
    happening:
      "Цена стоит в узком коридоре. Движения короткие, возвраты частые — рынок копит энергию без направления.",
    signs: ["Низкий объём", "Узкий диапазон", "Частые возвраты к середине"],
    actions: [
      "Работать от границ или ждать выход",
      "Не гнаться за микродвижениями",
      "Смотреть сделки у краёв диапазона",
    ],
    meaning: "Цена стоит в узком диапазоне.",
    approach: "Работа от границ или ожидание выхода.",
    screenerWatch: "диапазон, сделки, цена лота, узкий спред",
    screenerModeLabel: "Для новичка / Техничные",
    primaryMode: "beginner",
    instrumentPickHint: "Не ждать большого движения без объёма.",
    tone: "muted",
    zoneColor: "rgba(100, 116, 139, 0.1)",
    xStart: 0,
    xEnd: 150,
  },
  {
    id: "impulse",
    title: "Импульс",
    subtitle: "Резкое движение и объём ×5–10",
    logic: "Потенциал продолжения",
    happening:
      "Рынок резко ускорился: несколько сильных свечей подряд и всплеск сделок. Это старт движения, не финал.",
    signs: [
      "Объём ×5–10 от боковика",
      "Широкие зелёные свечи",
      "Расширение диапазона",
    ],
    actions: [
      "Не догонять на первом тике",
      "Ждать откат или удержание уровня",
      "Смотреть ленту и оборот",
    ],
    meaning: "Резкое направленное движение на выросших объёмах.",
    approach:
      "Не догонять вслепую. Смотреть откат или удержание уровня.",
    screenerWatch: "оборот, сделки, диапазон дня",
    screenerModeLabel: "В игре",
    primaryMode: "in-play",
    instrumentPickHint: "Смотреть инструменты «Активные».",
    tone: "cyan",
    zoneColor: "rgba(34, 211, 238, 0.1)",
    xStart: 150,
    xEnd: 300,
  },
  {
    id: "trend",
    title: "Тренд",
    subtitle: "Цена держит структуру",
    logic: "Работа по направлению",
    happening:
      "После импульса цена идёт ступеньками: обновляет экстремумы, откаты мелкие и не ломают направление.",
    signs: [
      "Обновление high/low",
      "Откаты не ломают структуру",
      "Оборот выше среднего",
    ],
    actions: [
      "Искать входы по направлению через откаты",
      "Держать стоп за последним swing",
      "Следить за удержанием уровней",
    ],
    meaning: "Цена продолжает движение после импульса.",
    approach: "Искать входы по направлению через откаты.",
    screenerWatch: "диапазон, ликвидность, high/low",
    screenerModeLabel: "Техничные / В игре",
    primaryMode: "technical",
    instrumentPickHint: "Искать откаты и удержание структуры.",
    tone: "green",
    zoneColor: "rgba(52, 211, 153, 0.09)",
    xStart: 300,
    xEnd: 450,
  },
  {
    id: "acceleration",
    title: "Ускорение",
    subtitle: "Дорого догонять",
    logic: "Ждать остановку",
    happening:
      "Наклон становится слишком крутым: свечи широкие, вход дорожает, риск выноса и резкого отката растёт.",
    signs: [
      "Широкие свечи подряд",
      "Крутой наклон",
      "Объём на пике",
    ],
    actions: [
      "Не догонять без плана",
      "Ждать остановку или откат",
      "Проверить спред и стоимость входа",
    ],
    meaning: "Движение становится слишком быстрым.",
    approach:
      "Не догонять. Ждать остановку, откат или понятный уровень.",
    screenerWatch: "спред, стоимость входа, диапазон",
    screenerModeLabel: "Опасные",
    primaryMode: "dangerous",
    instrumentPickHint: "Не догонять, риск плохой цены.",
    tone: "amber",
    zoneColor: "rgba(251, 191, 36, 0.12)",
    xStart: 450,
    xEnd: 570,
  },
  {
    id: "correction",
    title: "Коррекция",
    subtitle: "Откат против движения ~30%",
    logic: "Проверка структуры",
    happening:
      "Цена откатывает против основного движения — часто около трети пройденного пути. Важно понять: откат или слом.",
    signs: [
      "Красные/смешанные свечи",
      "Объём ниже импульса",
      "Глубина ~30% от движения",
    ],
    actions: [
      "Смотреть уровни и реакцию",
      "Не ловить нож без подтверждения",
      "Сравнить с предыдущей структурой",
    ],
    meaning: "Откат против движения, часто около 30%.",
    approach: "Понять: это откат или слом движения.",
    screenerWatch: "глубина отката, уровни, диапазон",
    screenerModeLabel: "Техничные",
    primaryMode: "technical",
    instrumentPickHint: "Понять: откат или слом.",
    tone: "cyan",
    zoneColor: "rgba(34, 211, 238, 0.07)",
    xStart: 570,
    xEnd: 690,
  },
  {
    id: "wideRange",
    title: "Диапазон",
    subtitle: "Границы после коррекции",
    logic: "Возврат или ожидание выхода",
    happening:
      "После коррекции цена ходит между верхней и нижней границей. Внутри много возвратов — уровни становятся ключевыми.",
    signs: [
      "Чёткие верх/низ",
      "Возвраты от границ",
      "Объём выше боковика",
    ],
    actions: [
      "Работать от границ",
      "Ждать выход с объёмом",
      "Не торговать середину диапазона",
    ],
    meaning: "Цена ходит между максимумом и минимумом коррекции.",
    approach: "Работа от границ или ожидание выхода.",
    screenerWatch: "high/low, сделки у границ, спред",
    screenerModeLabel: "Техничные",
    primaryMode: "technical",
    instrumentPickHint: "Работа от границ или ожидание выхода.",
    tone: "muted",
    zoneColor: "rgba(100, 116, 139, 0.11)",
    xStart: 690,
    xEnd: 810,
  },
  {
    id: "breakout",
    title: "Вынос",
    subtitle: "Возврат или невозврат",
    logic: "Ключевой выбор сценария",
    happening:
      "Цена выходит за границу диапазона. Дальше важно понять: это прокол с возвратом или точка невозврата.",
    signs: [
      "Всплеск сделок",
      "Объём выше обычного",
      "Удержание за уровнем или возврат внутрь",
    ],
    actions: [
      "Не входить на первый тик",
      "Смотреть удержание уровня",
      "Сравнить объём и реакцию ленты",
    ],
    meaning: "Проверка уровня: возврат или невозврат.",
    approach:
      "Если вернулась — возвратная логика. Если удержалась — точка невозврата.",
    screenerWatch: "сделки, оборот, удержание уровня",
    screenerModeLabel: "В игре / Опасные",
    primaryMode: "in-play",
    instrumentPickHint: "Главный вопрос: возврат или невозврат.",
    tone: "red",
    zoneColor: "rgba(248, 113, 113, 0.1)",
    xStart: 810,
    xEnd: 990,
  },
  {
    id: "consolidation",
    title: "Консолидация",
    subtitle: "Сжатие объёма и волатильности",
    logic: "Ждать выход",
    happening:
      "После движения амплитуда и объём сжимаются — рынок копит энергию перед новым выходом.",
    signs: [
      "Сужение диапазона",
      "Падающий объём",
      "Мелкие тела свечей",
    ],
    actions: [
      "Не торговать шум",
      "Ждать выход с подтверждением",
      "Следить за первым импульсом",
    ],
    meaning: "Сжатие после движения.",
    approach: "Не торговать шум. Ждать выход и подтверждение.",
    screenerWatch: "сужение диапазона, падение сделок",
    screenerModeLabel: "Наблюдать",
    primaryMode: "technical",
    instrumentPickHint: "Ждать выход, не торговать шум.",
    tone: "violet",
    zoneColor: "rgba(167, 139, 250, 0.08)",
    xStart: 990,
    xEnd: 1200,
  },
];

function c(
  cx: number,
  open: number,
  close: number,
  high: number,
  low: number,
  volume: number,
  phaseId: CyclePhaseId,
  ghost?: boolean,
): SceneCandle {
  return { cx, open, close, high, low, volume, phaseId, ghost };
}

/** Synthetic OHLC candles — lower y = higher price */
export const SCENE_CANDLES: SceneCandle[] = [
  // rangeBase — 9 small sideways candles
  c(18, 190, 188, 187, 191, 0.16, "rangeBase"),
  c(32, 188, 189, 187, 190, 0.18, "rangeBase"),
  c(46, 189, 187, 186, 190, 0.15, "rangeBase"),
  c(60, 187, 188, 186, 189, 0.17, "rangeBase"),
  c(74, 188, 186, 185, 189, 0.19, "rangeBase"),
  c(88, 186, 187, 185, 188, 0.16, "rangeBase"),
  c(102, 187, 189, 186, 190, 0.18, "rangeBase"),
  c(116, 189, 187, 186, 190, 0.17, "rangeBase"),
  c(130, 187, 186, 185, 188, 0.16, "rangeBase"),
  c(144, 186, 187, 185, 189, 0.18, "rangeBase"),

  // impulse — 5 strong green candles
  c(168, 186, 168, 164, 188, 0.72, "impulse"),
  c(192, 168, 142, 138, 172, 0.88, "impulse"),
  c(216, 142, 112, 106, 146, 0.95, "impulse"),
  c(240, 112, 86, 80, 116, 0.92, "impulse"),
  c(264, 86, 72, 68, 90, 0.85, "impulse"),
  c(288, 72, 70, 66, 76, 0.78, "impulse"),

  // trend — 7 stair-step candles
  c(312, 70, 74, 68, 76, 0.48, "trend"),
  c(332, 74, 68, 64, 76, 0.52, "trend"),
  c(352, 68, 72, 66, 74, 0.46, "trend"),
  c(372, 72, 64, 60, 74, 0.54, "trend"),
  c(392, 64, 68, 62, 70, 0.5, "trend"),
  c(412, 68, 58, 54, 70, 0.52, "trend"),
  c(432, 58, 54, 50, 62, 0.48, "trend"),
  c(448, 54, 52, 48, 58, 0.46, "trend"),

  // acceleration — 4 wide steep candles
  c(468, 52, 42, 38, 54, 0.82, "acceleration"),
  c(492, 42, 32, 28, 44, 0.9, "acceleration"),
  c(518, 32, 24, 20, 34, 0.95, "acceleration"),
  c(548, 24, 22, 18, 28, 0.88, "acceleration"),

  // correction — 5 red/mixed down candles (~30%)
  c(578, 22, 38, 20, 42, 0.32, "correction"),
  c(602, 38, 58, 36, 62, 0.28, "correction"),
  c(626, 58, 78, 56, 82, 0.3, "correction"),
  c(650, 78, 94, 76, 98, 0.26, "correction"),
  c(674, 94, 102, 92, 106, 0.24, "correction"),

  // wideRange — 9 range-bound candles
  c(698, 102, 94, 90, 104, 0.44, "wideRange"),
  c(714, 94, 82, 78, 96, 0.48, "wideRange"),
  c(730, 82, 92, 80, 94, 0.46, "wideRange"),
  c(746, 92, 78, 76, 94, 0.5, "wideRange"),
  c(762, 78, 90, 76, 92, 0.45, "wideRange"),
  c(778, 90, 80, 78, 92, 0.47, "wideRange"),
  c(794, 80, 88, 78, 90, 0.44, "wideRange"),
  c(806, 88, 84, 82, 90, 0.46, "wideRange"),

  // breakout — non-return path (main)
  c(824, 84, 74, 72, 86, 0.68, "breakout"),
  c(844, 74, 58, 54, 76, 0.82, "breakout"),
  c(864, 58, 48, 44, 60, 0.78, "breakout"),
  c(884, 48, 38, 34, 50, 0.85, "breakout"),
  c(908, 38, 32, 28, 40, 0.8, "breakout"),
  c(932, 32, 28, 24, 34, 0.76, "breakout"),
  c(958, 28, 34, 26, 36, 0.72, "breakout"),
  c(982, 34, 32, 30, 36, 0.7, "breakout"),

  // breakout — ghost fake return path
  c(844, 58, 72, 54, 76, 0.55, "breakout", true),
  c(864, 72, 84, 70, 86, 0.42, "breakout", true),
  c(884, 84, 78, 76, 86, 0.38, "breakout", true),

  // consolidation — 7 narrowing candles
  c(1002, 34, 38, 32, 40, 0.22, "consolidation"),
  c(1028, 38, 42, 36, 44, 0.2, "consolidation"),
  c(1054, 42, 40, 38, 44, 0.18, "consolidation"),
  c(1080, 40, 43, 39, 45, 0.17, "consolidation"),
  c(1106, 43, 41, 40, 45, 0.16, "consolidation"),
  c(1132, 41, 42, 40, 44, 0.15, "consolidation"),
  c(1158, 42, 41, 40, 43, 0.14, "consolidation"),
  c(1184, 41, 42, 40, 43, 0.13, "consolidation"),
];

export const CHART = {
  width: 1200,
  height: 360,
  priceTop: 36,
  priceBottom: 248,
  volumeTop: 262,
  volumeBottom: 400,
  volBaseY: 332,
  volMaxH: 68,
  candleWidth: 7,
} as const;

export const LEVELS = {
  rangeHigh: 78,
  rangeLow: 106,
  sidewaysHigh: 187,
  sidewaysLow: 191,
  peakHigh: 22,
  correctionLow: 106,
  breakoutLevel: 78,
} as const;

export function getPhase(id: CyclePhaseId): CyclePhase {
  return CYCLE_PHASES.find((p) => p.id === id) ?? CYCLE_PHASES[0]!;
}

export function phaseAtX(x: number): CyclePhaseId {
  const phase = CYCLE_PHASES.find((p) => x >= p.xStart && x < p.xEnd);
  return phase?.id ?? "consolidation";
}

/** @deprecated legacy polyline — kept for reference */
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
