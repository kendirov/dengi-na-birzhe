export type LearningScenario = "cautious" | "normal" | "aggressive";

export interface LearningScenarioConfig {
  id: LearningScenario;
  label: string;
  stopPoints: number;
  slippagePoints: number;
  volumeHighlight: "reduced" | "base" | "increased";
  tooltip: string;
  warning?: string;
}

export const LEARNING_SCENARIOS: LearningScenarioConfig[] = [
  {
    id: "cautious",
    label: "Осторожно",
    stopPoints: 30,
    slippagePoints: 1,
    volumeHighlight: "reduced",
    tooltip: "Уже стоп, меньше slip — пониженный объём",
  },
  {
    id: "normal",
    label: "Нормально",
    stopPoints: 40,
    slippagePoints: 2,
    volumeHighlight: "base",
    tooltip: "Базовый стоп и slip для внутридня",
  },
  {
    id: "aggressive",
    label: "Агрессивно",
    stopPoints: 50,
    slippagePoints: 4,
    volumeHighlight: "increased",
    tooltip: "Шире стоп и slip — только с опытом",
    warning: "Повышенный объём — риск выше нормы",
  },
];

export const DEFAULT_LEARNING_SCENARIO: LearningScenario = "normal";

export function getLearningScenario(id: LearningScenario): LearningScenarioConfig {
  return LEARNING_SCENARIOS.find((s) => s.id === id) ?? LEARNING_SCENARIOS[1];
}

export const COMMON_MISTAKES = [
  "Не учитывать slip.",
  "Не учитывать комиссию выхода.",
  'Брать объём "на глаз".',
  "Ставить слишком близкий стоп ради большего объёма.",
  "Увеличивать объём после убытка.",
] as const;

export const HOW_TO_USE_STEPS = [
  "Выбери просадку и число сделок.",
  "Посмотри риск на сделку.",
  "Выбери рабочий стоп.",
  "Посмотри полный риск на 1 лот.",
  "Возьми в привод один из объёмов: маячок / 1/4 / 1/2 / полный / x2.",
] as const;
