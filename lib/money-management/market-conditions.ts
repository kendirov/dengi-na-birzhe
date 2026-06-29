export type MarketCondition = "calm" | "normal" | "sharp";

export interface MarketConditionConfig {
  id: MarketCondition;
  label: string;
  slippagePoints: number;
  warning: string | null;
}

export const MARKET_CONDITIONS: MarketConditionConfig[] = [
  {
    id: "calm",
    label: "Спокойный",
    slippagePoints: 1,
    warning: null,
  },
  {
    id: "normal",
    label: "Обычный",
    slippagePoints: 2,
    warning: null,
  },
  {
    id: "sharp",
    label: "Резкий",
    slippagePoints: 5,
    warning: "Реальный риск может быть выше — рынок исполняет стоп с проскальзыванием.",
  },
];

export const DEFAULT_MARKET_CONDITION: MarketCondition = "normal";

export function getMarketCondition(
  id: MarketCondition,
): MarketConditionConfig {
  return MARKET_CONDITIONS.find((m) => m.id === id) ?? MARKET_CONDITIONS[1];
}

export const ORDERBOOK_TIPS = [
  "Стоп — это не весь риск.",
  "Если рынок резкий, добавляется проскальзывание.",
  "Комиссия тоже входит в полный риск.",
  "Размер позиции считаем от полного риска.",
] as const;
