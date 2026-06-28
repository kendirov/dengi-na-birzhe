import type { EnrichedInstrument } from "@/lib/types/instrument";
import type {
  QuickFilterId,
  ScreenerMode,
  SortColumn,
  SortDirection,
} from "@/lib/types/screener";
import { getModeScore } from "@/lib/types/screener";
import { median } from "@/lib/screener/percentile";
import { isFundLikeInstrument } from "@/lib/screener/etf";

export const SCREENER_MODES: {
  id: ScreenerMode;
  label: string;
  description: string;
}[] = [
  {
    id: "all",
    label: "Все",
    description: "Полный список инструментов с расчётом торговых параметров.",
  },
  {
    id: "technical",
    label: "Техничные",
    description:
      "Для графика, уровней, high/low и импульсов. Обычно важны диапазон, ликвидность и понятное движение.",
  },
  {
    id: "spread",
    label: "Спредовые",
    description:
      "Для работы с bid/ask. Важны ширина спреда, цена шага, комиссия, сделки и плотность стакана.",
  },
  {
    id: "in-play",
    label: "В игре",
    description:
      "Сейчас есть оборот, сделки и движение. Не сигнал, а список инструментов для наблюдения.",
  },
  {
    id: "beginner",
    label: "Для новичка",
    description:
      "Понятный лот, не экстремальный спред и достаточно сделок для тренировки.",
  },
  {
    id: "dangerous",
    label: "Опасные",
    description:
      "Движение есть, но условия плохие: широкий спред, мало сделок, дорогой лот или высокая стоимость ошибки.",
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

function passesSpreadMode(inst: EnrichedInstrument): boolean {
  if (isFundLikeInstrument(inst)) return false;
  if (inst.spreadTradingScore < 58) return false;
  if (inst.turnoverRub < 800_000 || inst.trades < 3000) return false;
  if (inst.spreadRub === null || inst.spreadTicks === null) return false;
  if (inst.spreadTicks < 2) return false;
  if (inst.tickValueRub === null || inst.tickValueRub <= 0) return false;
  if (inst.lotValue > 2_000_000) return false;
  if (
    inst.entryCostMarketTicks !== null &&
    inst.entryCostMarketTicks > 12
  ) {
    return false;
  }
  return true;
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

function passesMode(inst: EnrichedInstrument, mode: ScreenerMode): boolean {
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
      return passesSpreadMode(inst);
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

  return instruments
    .filter((inst) => passesMode(inst, mode))
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
  return instruments.filter((inst) => passesMode(inst, mode)).length;
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
