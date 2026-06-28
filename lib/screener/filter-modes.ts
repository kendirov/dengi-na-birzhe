import type { EnrichedInstrument } from "@/lib/types/instrument";
import type {
  QuickFilterId,
  ScreenerMode,
  SortColumn,
  SortDirection,
} from "@/lib/types/screener";
import { getModeScore } from "@/lib/types/screener";
import { median } from "@/lib/screener/percentile";
import {
  buildSpreadUniverseContext,
  isFundLikeInstrument,
  isSpreadTradableCandidate,
} from "@/lib/screener/spread-trading";

export const SCREENER_MODES: {
  id: ScreenerMode;
  label: string;
  shortLabel: string;
  description: string;
  taskHint: string;
}[] = [
  {
    id: "all",
    label: "Все",
    shortLabel: "Все",
    description: "Общий список. Лучше начинать с конкретной задачи.",
    taskHint: "Общий список — лучше выбрать задачу ниже.",
  },
  {
    id: "technical",
    label: "Техничные",
    shortLabel: "Для графика",
    description:
      "Ищем инструменты с движением, диапазоном и понятной структурой. Подходит для уровней, high/low, откатов и продолжения.",
    taskHint: "График, уровни, high/low, откаты.",
  },
  {
    id: "spread",
    label: "Спредовые",
    shortLabel: "Для стакана",
    description:
      "Ищем рабочий spread: несколько пунктов между bid/ask, сделки, оборот и понятная цена шага.",
    taskHint: "Работа bid/ask, spread в пунктах.",
  },
  {
    id: "in-play",
    label: "В игре",
    shortLabel: "Активные",
    description:
      "Ищем инструменты, где появились деньги, сделки и движение. Это список для наблюдения, не сигнал.",
    taskHint: "Деньги и движение — список для наблюдения.",
  },
  {
    id: "beginner",
    label: "Для новичка",
    shortLabel: "Для тренировки",
    description:
      "Понятный лот, понятный шаг, не экстремальный spread, достаточно сделок.",
    taskHint: "Тренировка лимиток и цена ошибки.",
  },
  {
    id: "dangerous",
    label: "Опасные",
    shortLabel: "Не лезть без плана",
    description:
      "Движение есть, но условия плохие: широкий spread, мало сделок, дорогая ошибка или пустой стакан.",
    taskHint: "Плохие условия — только с планом.",
  },
];

export const QUICK_FILTERS: { id: QuickFilterId; label: string }[] = [
  { id: "cheap-lot", label: "Дешёвый лот" },
  { id: "many-trades", label: "Много сделок" },
  { id: "narrow-spread", label: "Узкий спред" },
  { id: "wide-spread", label: "Широкий спред" },
  { id: "big-turnover", label: "Большой оборот" },
  { id: "high-range", label: "Высокий диапазон" },
];

function passesSpreadMode(
  inst: EnrichedInstrument,
  spreadCtx: ReturnType<typeof buildSpreadUniverseContext>,
): boolean {
  return isSpreadTradableCandidate(inst, spreadCtx);
}

function passesBeginnerMode(inst: EnrichedInstrument): boolean {
  if (
    inst.beginnerScore < 55 ||
    inst.lotValue > 500_000 ||
    (inst.spreadPct !== null && inst.spreadPct > 0.15)
  ) {
    return false;
  }
  if (isFundLikeInstrument(inst)) {
    return inst.beginnerScore >= 72 && inst.trades >= 8000;
  }
  return true;
}

function passesMode(
  inst: EnrichedInstrument,
  mode: ScreenerMode,
  spreadCtx: ReturnType<typeof buildSpreadUniverseContext>,
): boolean {
  switch (mode) {
    case "all":
      return true;
    case "technical":
      return (
        inst.technicalScore >= 55 &&
        inst.spreadScore >= 50 &&
        inst.liquidityScore >= 50 &&
        (inst.dayRangePct ?? 0) >= 1.2
      );
    case "spread":
      return passesSpreadMode(inst, spreadCtx);
    case "in-play":
      return (
        inst.inPlayScore >= 55 &&
        (inst.hasHistoricalBaseline
          ? inst.avgTurnover20d !== null &&
            inst.turnoverRub >= inst.avgTurnover20d * 0.95
          : inst.turnoverRub > 0 && inst.trades > 0) &&
        (inst.dayRangePct ?? 0) >= 1.5
      );
    case "beginner":
      return passesBeginnerMode(inst);
    case "dangerous":
      return (
        inst.dangerousScore >= 52 ||
        (inst.risk === "high" &&
          inst.spreadPct !== null &&
          inst.spreadPct >= 0.06)
      );
    default:
      return true;
  }
}

function passesQuickFilter(
  inst: EnrichedInstrument,
  filter: QuickFilterId,
  medians: Record<string, number>,
): boolean {
  switch (filter) {
    case "cheap-lot":
      return inst.lotValue <= medians.lotValue * 0.75;
    case "many-trades":
      return inst.trades >= medians.trades * 1.1;
    case "narrow-spread":
      return (
        inst.spreadPct !== null &&
        medians.spreadPct > 0 &&
        inst.spreadPct <= medians.spreadPct * 0.85
      );
    case "wide-spread":
      return (
        inst.spreadPct !== null &&
        medians.spreadPct > 0 &&
        inst.spreadPct >= medians.spreadPct * 1.15
      );
    case "big-turnover":
      return inst.turnoverRub >= medians.turnover * 1.1;
    case "high-range":
      return (
        inst.dayRangePct !== null &&
        medians.dayRange > 0 &&
        inst.dayRangePct >= medians.dayRange * 1.1
      );
    default:
      return true;
  }
}

export function filterInstruments(
  instruments: EnrichedInstrument[],
  mode: ScreenerMode,
  search: string,
  quickFilters: QuickFilterId[],
): EnrichedInstrument[] {
  const medians = {
    lotValue: median(instruments.map((i) => i.lotValue)),
    trades: median(instruments.map((i) => i.trades)),
    spreadPct: median(
      instruments
        .map((i) => i.spreadPct)
        .filter((v): v is number => v !== null),
    ) || 0,
    turnover: median(instruments.map((i) => i.turnoverRub)),
    dayRange: median(
      instruments
        .map((i) => i.dayRangePct)
        .filter((v): v is number => v !== null),
    ) || 0,
  };

  const query = search.trim().toLowerCase();

  const spreadCtx = buildSpreadUniverseContext(instruments);

  return instruments
    .filter((inst) => passesMode(inst, mode, spreadCtx))
    .filter((inst) => {
      if (!query) return true;
      return (
        inst.ticker.toLowerCase().includes(query) ||
        inst.name.toLowerCase().includes(query)
      );
    })
    .filter((inst) =>
      quickFilters.every((f) => passesQuickFilter(inst, f, medians)),
    )
    .sort(
      (a, b) => getModeScore(b, mode) - getModeScore(a, mode),
    );
}

export function getTopInstruments(
  instruments: EnrichedInstrument[],
  mode: ScreenerMode,
  limit = 3,
): EnrichedInstrument[] {
  return filterInstruments(instruments, mode, "", []).slice(0, limit);
}

export function countModeInstruments(
  instruments: EnrichedInstrument[],
  mode: ScreenerMode,
): number {
  const spreadCtx = buildSpreadUniverseContext(instruments);
  return instruments.filter((inst) => passesMode(inst, mode, spreadCtx)).length;
}

export function sortInstruments(
  instruments: EnrichedInstrument[],
  column: SortColumn,
  direction: SortDirection,
  mode: ScreenerMode = "all",
): EnrichedInstrument[] {
  const sorted = [...instruments].sort((a, b) => {
    let av: number | string | null;
    let bv: number | string | null;

    if (column === "score") {
      av = getModeScore(a, mode);
      bv = getModeScore(b, mode);
    } else if (column === "ticker") {
      av = a.ticker;
      bv = b.ticker;
    } else {
      av = a[column] as number | null;
      bv = b[column] as number | null;
    }

    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv);
    }

    const aNum = av === null ? Number.NEGATIVE_INFINITY : (av as number);
    const bNum = bv === null ? Number.NEGATIVE_INFINITY : (bv as number);
    return aNum - bNum;
  });

  return direction === "desc" ? sorted.reverse() : sorted;
}
