import type { LessonDefinition, LessonStep, ScenarioScript, TrainerMode } from "../types";

export const TRAINER_MODES: { id: TrainerMode; label: string; short: string }[] = [
  { id: "terminal", label: "Терминал", short: "T" },
  { id: "explain", label: "Объяснение", short: "E" },
  { id: "practice", label: "Практика", short: "P" },
  { id: "scenario", label: "Сценарий", short: "S" },
  { id: "presenter", label: "Преподаватель", short: "L" },
];

export const LESSON_IDS = ["anatomy", "first-trade"] as const;
export type LessonId = (typeof LESSON_IDS)[number];

export const DEFAULT_LESSON_ID: LessonId = "anatomy";

const anatomySteps: LessonStep[] = [
  {
    id: "top-menu",
    title: "Верхнее меню",
    shortText: "Подключения, настройки, окна, аналитика — навигация по терминалу.",
    targetSelector: "topbar",
    calloutPosition: "bottom",
    highlightType: "outline",
    speakerNotes:
      "Покажите, что меню не торгует само по себе — это карта рабочих зон CScalp.",
  },
  {
    id: "instrument",
    title: "Инструмент GAZP",
    shortText: "Тикер, позиция, last и рабочий объём — всегда в поле зрения.",
    targetSelector: "instrument-header",
    calloutPosition: "bottom",
    highlightType: "glow",
    speakerNotes: "Подчеркните: один инструмент — один фокус скальпера.",
  },
  {
    id: "clusters",
    title: "Кластеры",
    shortText: "Объём по цене и времени. POC с рамкой — где был бой.",
    targetSelector: "clusters",
    calloutPosition: "right",
    highlightType: "dimRest",
    speakerNotes: "Сначала кластер, потом вывод — не наоборот.",
  },
  {
    id: "tape",
    title: "Лента сделок",
    shortText: "Факт агрессии: зелёный — покупка по ask, красный — продажа по bid.",
    targetSelector: "tape",
    calloutPosition: "left",
    highlightType: "dimRest",
    speakerNotes: "Размер пузыря ≈ объём. Крупный принт — событие.",
  },
  {
    id: "orderbook",
    title: "Биржевой стакан",
    shortText: "DOM: заявки ask сверху, bid снизу. Отсюда читается спред и плотности.",
    targetSelector: "orderbook",
    calloutPosition: "left",
    highlightType: "outline",
    speakerNotes: "Стакан — главный прибор. Всё остальное — контекст.",
  },
  {
    id: "ask-zone",
    title: "Ask зона",
    shortText: "Продавцы. Красные строки — лимиты на продажу, плотности сопротивления.",
    targetSelector: "ask-zone",
    calloutPosition: "left",
    highlightType: "glow",
    speakerNotes: "Покупка по рынку бьёт в ask. Продажа лимитом — в ask.",
  },
  {
    id: "bid-zone",
    title: "Bid зона",
    shortText: "Покупатели. Зелёные строки — поддержка и лимиты на покупку.",
    targetSelector: "bid-zone",
    calloutPosition: "left",
    highlightType: "glow",
    speakerNotes: "Продажа по рынку бьёт в bid. Покупка лимитом — в bid.",
  },
  {
    id: "spread",
    title: "Spread",
    shortText: "Best ask и best bid — граница спреда. Здесь чаще всего принимают решение.",
    targetSelector: "spread",
    calloutPosition: "left",
    highlightType: "arrow",
    speakerNotes: "Нулевой спред GAZP: соседние строки 101,75 / 101,73.",
  },
  {
    id: "working-volume",
    title: "Рабочий объём",
    shortText: "Клавиши 1–5: 50–800 лотов. F/D/L — режимы заявок и позиции.",
    targetSelector: "volume-rail",
    calloutPosition: "left",
    highlightType: "outline",
    speakerNotes: "Объём задаётся до клика — не после.",
  },
  {
    id: "limit-buy",
    title: "Лимитная покупка",
    shortText: "ЛКМ в bid-зоне ниже best ask — лимит на покупку. Ждём исполнения.",
    targetSelector: "limit-buy",
    calloutPosition: "left",
    highlightType: "arrow",
    actionHint: "ЛКМ по строке bid ниже best ask",
    speakerNotes: "Не путать с рыночной покупкой по ask.",
  },
  {
    id: "limit-sell",
    title: "Лимитная продажа",
    shortText: "ПКМ в ask-зоне выше best bid — лимит на продажу.",
    targetSelector: "limit-sell",
    calloutPosition: "left",
    highlightType: "arrow",
    actionHint: "ПКМ по строке ask выше best bid",
    speakerNotes: "Лимит ставим туда, где готовы продать.",
  },
  {
    id: "market-buy",
    title: "Рыночная покупка",
    shortText: "ЛКМ по best ask — немедленная покупка на рабочий объём.",
    targetSelector: "market-buy",
    calloutPosition: "left",
    highlightType: "arrow",
    actionHint: "ЛКМ по best ask или клавиша T",
    speakerNotes: "Агрессия вверх — снимаем ликвидность продавца.",
  },
  {
    id: "market-sell",
    title: "Рыночная продажа",
    shortText: "ПКМ по best bid — немедленная продажа на рабочий объём.",
    targetSelector: "market-sell",
    calloutPosition: "left",
    highlightType: "arrow",
    actionHint: "ПКМ по best bid или клавиша Y",
    speakerNotes: "Агрессия вниз — бьём в покупателя.",
  },
  {
    id: "hotkeys",
    title: "Горячие клавиши",
    shortText: "1–5 объём · T/Y рынок · F снять лимиты · D закрыть · Shift центр стакана.",
    targetSelector: "hotkeys",
    calloutPosition: "left",
    highlightType: "outline",
    speakerNotes: "Скальпер не ищет мышь — muscle memory.",
  },
  {
    id: "pre-entry",
    title: "Что смотреть перед входом",
    shortText: "Чеклист: спред · плотность · лента · кластер у цены · свой объём.",
    targetSelector: "pre-entry",
    calloutPosition: "bottom",
    highlightType: "glow",
    speakerNotes: "Закрыть урок: без чеклиста вход = лотерея.",
  },
];

const firstTradeSteps: LessonStep[] = [
  {
    id: "pick-volume",
    title: "Выбери объём 50",
    shortText: "Нажми 50 или клавишу 1 — минимальный рабочий объём для учебной сделки.",
    targetSelector: "volume-rail",
    calloutPosition: "left",
    highlightType: "outline",
    actionHint: "Клик 50 или клавиша 1",
    expectedAction: "setVolume50",
    nextOnAction: true,
    speakerNotes: "Малый объём снижает стресс на первом входе.",
  },
  {
    id: "limit-bid",
    title: "Лимитная покупка в bid",
    shortText: "ЛКМ по bid ниже best ask — выставь лимит. Заявка появится в строке.",
    targetSelector: "limit-buy",
    calloutPosition: "left",
    highlightType: "arrow",
    actionHint: "ЛКМ в bid-зоне",
    expectedAction: "limitBuyBid",
    nextOnAction: true,
    speakerNotes: "Покажите метку B на строке стакана.",
  },
  {
    id: "cancel-f",
    title: "Сними заявку F",
    shortText: "Клавиша F снимает все лимитные заявки — отмена без мыши.",
    targetSelector: "hotkeys",
    calloutPosition: "left",
    highlightType: "outline",
    actionHint: "Нажми F",
    expectedAction: "cancelLimitsF",
    nextOnAction: true,
    speakerNotes: "F = flat limits, не закрытие позиции.",
  },
  {
    id: "market-t",
    title: "Купи по рынку T",
    shortText: "Клавиша T — рыночная покупка по best ask на выбранный объём.",
    targetSelector: "market-buy",
    calloutPosition: "left",
    highlightType: "arrow",
    actionHint: "Нажми T",
    expectedAction: "marketBuyT",
    nextOnAction: true,
    speakerNotes: "После T — позиция long в шапке.",
  },
  {
    id: "close-d",
    title: "Закрой позицию D",
    shortText: "Клавиша D закрывает позицию рыночной противоположной заявкой.",
    targetSelector: "instrument-header",
    calloutPosition: "bottom",
    highlightType: "glow",
    actionHint: "Нажми D",
    expectedAction: "closePositionD",
    nextOnAction: true,
    speakerNotes: "Проверьте flat и PnL в шапке.",
  },
  {
    id: "see-tape",
    title: "Сделка в ленте",
    shortText: "Каждая ваша сделка — пузырь в ленте на строке цены исполнения.",
    targetSelector: "tape",
    calloutPosition: "right",
    highlightType: "dimRest",
    actionHint: "Найди свой принт в ленте",
    expectedAction: "observeTape",
    nextOnAction: true,
    speakerNotes: "Связка: клик → лента → подтверждение факта.",
  },
  {
    id: "see-cluster",
    title: "Объём в кластере",
    shortText: "Последняя колонка (10:00) обновляется — ваш объём на уровне цены.",
    targetSelector: "clusters",
    calloutPosition: "right",
    highlightType: "dimRest",
    actionHint: "Hover по ячейке у last price",
    expectedAction: "observeCluster",
    nextOnAction: true,
    speakerNotes: "Кластер — память рынка, лента — момент.",
  },
];

export const LESSONS: Record<LessonId, LessonDefinition> = {
  anatomy: {
    id: "anatomy",
    title: "Анатомия терминала",
    steps: anatomySteps,
  },
  "first-trade": {
    id: "first-trade",
    title: "Первая сделка",
    steps: firstTradeSteps,
  },
};

/** @deprecated use getLessonSteps */
export const LESSON_STEPS = anatomySteps;

export function isLessonId(id: string | null): id is LessonId {
  return id === "anatomy" || id === "first-trade";
}

export function getLesson(id: string | null): LessonDefinition | null {
  if (!id || !isLessonId(id)) return null;
  return LESSONS[id];
}

export function getLessonSteps(id: string | null): LessonStep[] {
  return getLesson(id)?.steps ?? LESSONS[DEFAULT_LESSON_ID].steps;
}

export function getLessonStepByIndex(
  lessonId: string | null,
  index: number,
): LessonStep {
  const steps = getLessonSteps(lessonId);
  const clamped = Math.max(0, Math.min(index, steps.length - 1));
  return steps[clamped]!;
}

export function parseModeParam(value: string | null): TrainerMode | null {
  if (
    value === "terminal" ||
    value === "explain" ||
    value === "practice" ||
    value === "presenter" ||
    value === "scenario"
  ) {
    return value;
  }
  return null;
}

export function parseLessonParam(value: string | null): LessonId | null {
  return isLessonId(value) ? value : null;
}

/** @deprecated legacy keyframe scripts — use MARKET_SCENARIOS from data/scenarios.ts */
export const SCENARIOS: ScenarioScript[] = [];

export function getLessonStep(index: number): LessonStep {
  return getLessonStepByIndex(DEFAULT_LESSON_ID, index);
}
