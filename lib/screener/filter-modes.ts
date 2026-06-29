import type { EnrichedInstrument } from "@/lib/types/instrument";
import type {
  QuickFilterId,
  ScreenerMode,
  SortColumn,
  SortDirection,
} from "@/lib/types/screener";
import { getModeScore } from "@/lib/types/screener";
import { percentileAt } from "@/lib/screener/percentile";
import {
  isCheapAndLiquid,
  isCheapPointValue,
  isLiquid,
} from "@/lib/screener/liquidity-filters";
import {
  buildOrderBookUniverseContext,
  isFundLikeInstrument,
  isOrderBookCandidate,
} from "@/lib/screener/order-book";
import {
  buildTrainingSelection,
  getTrainingInstruments,
} from "@/lib/screener/training-picks";

export interface FilterThresholds {
  tradesP80: number;
  tradesP50: number;
  turnoverP80: number;
  turnoverP40: number;
  rangeP80: number;
  spreadP20: number;
  spreadP80: number;
}

export function buildFilterThresholds(
  instruments: EnrichedInstrument[],
): FilterThresholds {
  const trades = instruments.map((i) => i.trades);
  const turnoverRub = instruments.map((i) => i.turnoverRub);
  const dayRange = instruments
    .map((i) => i.dayRangePct)
    .filter((v): v is number => v !== null);
  const spreadPoints = instruments
    .map((i) => i.spreadTicks)
    .filter((v): v is number => v !== null);

  return {
    tradesP80: percentileAt(trades, 80),
    tradesP50: percentileAt(trades, 50),
    turnoverP80: percentileAt(turnoverRub, 80),
    turnoverP40: percentileAt(turnoverRub, 40),
    rangeP80: percentileAt(dayRange.length ? dayRange : [0], 80),
    spreadP20: percentileAt(spreadPoints.length ? spreadPoints : [0], 20),
    spreadP80: percentileAt(spreadPoints.length ? spreadPoints : [0], 80),
  };
}

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
    description: "Все доступные акции.",
    taskHint: "",
  },
  {
    id: "training",
    label: "Обучение",
    shortLabel: "Обучение",
    description:
      "Не весь рынок, а учебная подборка: несколько хороших, стаканных и опасных примеров — чтобы увидеть разницу.",
    taskHint: "12 примеров: техничные, стакан, новичку, опасные.",
  },
  {
    id: "technical",
    label: "Техничные",
    shortLabel: "Техничные",
    description: "Хорошо двигаются по графику.",
    taskHint: "",
  },
  {
    id: "spread",
    label: "Для стакана",
    shortLabel: "Для стакана",
    description: "Отрабатывают плотности, айсберги и bid/ask.",
    taskHint: "",
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

/** Режимы на основном экране /screener */
export const MAIN_SCREENER_MODES = SCREENER_MODES.filter((m) =>
  (["all", "technical", "spread"] as ScreenerMode[]).includes(m.id),
);

export const DEFAULT_SCREENER_QUICK_FILTERS: QuickFilterId[] = [
  "many-trades",
  "hide-illiquid",
];
export const DEFAULT_SCREENER_SORT_COLUMN: SortColumn = "trades";
export const DEFAULT_SCREENER_SORT_DIRECTION: SortDirection = "desc";
export { buildTrainingSelection, trainingMetaMap } from "@/lib/screener/training-picks";
export type { TrainingPickMeta, TrainingRole } from "@/lib/screener/training-picks";

export const QUICK_FILTERS: {
  id: QuickFilterId;
  label: string;
  tooltip: string;
  primary?: boolean;
}[] = [
  {
    id: "many-trades",
    label: "Много сделок",
    tooltip: "Верхние 20% по количеству сделок.",
    primary: true,
  },
  {
    id: "hide-illiquid",
    label: "Скрыть неликвид",
    tooltip:
      "Убирает инструменты с оборотом меньше 3 млн ₽, малым числом сделок или плохими данными.",
    primary: true,
  },
  {
    id: "cheap-step-lot",
    label: "Дешёвый шаг/лот",
    tooltip:
      "Шаг/лот ≤ 0,20 ₽. Удобнее набирать объём и точнее управлять риском.",
    primary: true,
  },
  {
    id: "cheap-and-liquid",
    label: "Дешёвые и ликвидные",
    tooltip:
      "Шаг/лот ≤ 0,20 ₽ и оборот от 3 млн ₽. Убирает жёсткий неликвид.",
    primary: true,
  },
  {
    id: "big-turnover",
    label: "Большой оборот",
    tooltip: "Верхние 20% по обороту в рублях.",
  },
  {
    id: "high-range",
    label: "Высокий диапазон",
    tooltip: "Верхние 20% по диапазону дня.",
  },
  {
    id: "narrow-spread",
    label: "Узкий спред",
    tooltip: "Нижние 20% по spread в пунктах.",
  },
  {
    id: "wide-spread",
    label: "Широкий спред",
    tooltip:
      "Верхние 20% по spread в пунктах, но только среди живых инструментов.",
  },
];

export const PRIMARY_QUICK_FILTERS = QUICK_FILTERS.filter((f) => f.primary);
export const SECONDARY_QUICK_FILTERS = QUICK_FILTERS.filter((f) => !f.primary);

function passesTechnicalMode(inst: EnrichedInstrument): boolean {
  if (isFundLikeInstrument(inst)) return false;
  if (inst.trades <= 0 || inst.turnoverRub <= 0 || inst.price <= 0) return false;
  return inst.technicalScore >= 40;
}

function passesSpreadMode(
  inst: EnrichedInstrument,
  orderBookCtx: ReturnType<typeof buildOrderBookUniverseContext>,
): boolean {
  return isOrderBookCandidate(inst, orderBookCtx);
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
  spreadCtx: ReturnType<typeof buildOrderBookUniverseContext>,
): boolean {
  switch (mode) {
    case "all":
      return true;
    case "training":
      return false;
    case "technical":
      return false;
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
  thresholds: FilterThresholds,
): boolean {
  switch (filter) {
    case "cheap-step-lot":
      return isCheapPointValue(inst);
    case "hide-illiquid":
      return isLiquid(inst);
    case "cheap-and-liquid":
      return isCheapAndLiquid(inst);
    case "many-trades":
      return inst.trades >= thresholds.tradesP80;
    case "big-turnover":
      return inst.turnoverRub >= thresholds.turnoverP80;
    case "high-range":
      return inst.dayRangePct !== null && inst.dayRangePct >= thresholds.rangeP80;
    case "narrow-spread":
      return (
        inst.spreadTicks !== null && inst.spreadTicks <= thresholds.spreadP20
      );
    case "wide-spread":
      return (
        inst.spreadTicks !== null &&
        inst.spreadTicks >= thresholds.spreadP80 &&
        inst.trades >= thresholds.tradesP50 &&
        inst.turnoverRub >= thresholds.turnoverP40
      );
    default:
      return true;
  }
}

export function countQuickFilterMatches(
  instruments: EnrichedInstrument[],
  filter: QuickFilterId,
): number {
  const thresholds = buildFilterThresholds(instruments);
  return instruments.filter((inst) =>
    passesQuickFilter(inst, filter, thresholds),
  ).length;
}

export function filterInstruments(
  instruments: EnrichedInstrument[],
  mode: ScreenerMode,
  search: string,
  quickFilters: QuickFilterId[],
): EnrichedInstrument[] {
  const thresholds = buildFilterThresholds(instruments);
  const query = search.trim().toLowerCase();

  if (mode === "training") {
    let training = getTrainingInstruments(instruments);
    if (query) {
      training = training.filter(
        (inst) =>
          inst.ticker.toLowerCase().includes(query) ||
          inst.name.toLowerCase().includes(query),
      );
    }
    return training;
  }

  const spreadCtx = buildOrderBookUniverseContext(instruments);

  return instruments
    .filter((inst) => {
      if (mode === "technical") {
        return passesTechnicalMode(inst);
      }
      return passesMode(inst, mode, spreadCtx);
    })
    .filter((inst) => {
      if (!query) return true;
      return (
        inst.ticker.toLowerCase().includes(query) ||
        inst.name.toLowerCase().includes(query)
      );
    })
    .filter((inst) =>
      quickFilters.every((f) => passesQuickFilter(inst, f, thresholds)),
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
  if (mode === "training") {
    const picks = buildTrainingSelection(instruments);
    return picks.slice(0, limit).map((p) => p.instrument);
  }
  return filterInstruments(instruments, mode, "", []).slice(0, limit);
}

export function countModeInstruments(
  instruments: EnrichedInstrument[],
  mode: ScreenerMode,
): number {
  if (mode === "training") {
    return buildTrainingSelection(instruments).length;
  }
  if (mode === "technical") {
    return instruments.filter((inst) => passesTechnicalMode(inst)).length;
  }
  const spreadCtx = buildOrderBookUniverseContext(instruments);
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
    } else if (column === "commissionRub") {
      av = a.commissionMarketRub;
      bv = b.commissionMarketRub;
    } else if (column === "commissionPoints") {
      av = a.commissionMarketPoints;
      bv = b.commissionMarketPoints;
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
