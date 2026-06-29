import type { EnrichedInstrument } from "@/lib/types/instrument";

/** Стоимость минимального шага цены на 1 лот (tickSize × lotSize). */
export const CHEAP_POINT_VALUE_MAX_RUB = 0.2;
export const MIN_LIQUID_TURNOVER_RUB = 3_000_000;
export const MIN_LIQUID_TRADES = 100;

export function getPointValueRub(inst: EnrichedInstrument): number | null {
  if (inst.tickValueRub !== null && inst.tickValueRub > 0) {
    return inst.tickValueRub;
  }
  if (
    inst.tickSize !== null &&
    inst.tickSize > 0 &&
    inst.lotSize > 0
  ) {
    return inst.tickSize * inst.lotSize;
  }
  if (inst.rubPerPointPerLot > 0) {
    return inst.rubPerPointPerLot;
  }
  return null;
}

export function isCheapPointValue(inst: EnrichedInstrument): boolean {
  const pointValue = getPointValueRub(inst);
  return pointValue !== null && pointValue > 0 && pointValue <= CHEAP_POINT_VALUE_MAX_RUB;
}

/** Жёсткий неликвид — для фильтра «Скрыть неликвид». */
export function isIlliquid(inst: EnrichedInstrument): boolean {
  if (!Number.isFinite(inst.price) || inst.price <= 0) return true;
  if (!Number.isFinite(inst.lotValue) || inst.lotValue <= 0) return true;
  if (inst.turnoverRub < MIN_LIQUID_TURNOVER_RUB) return true;
  if (inst.trades < MIN_LIQUID_TRADES) return true;

  const hasBid = inst.bid !== null && inst.bid > 0;
  const hasAsk = inst.ask !== null && inst.ask > 0;
  if (!hasBid && !hasAsk && inst.spreadRub === null) {
    if (
      inst.turnoverRub < MIN_LIQUID_TURNOVER_RUB * 1.5 &&
      inst.trades < MIN_LIQUID_TRADES * 2
    ) {
      return true;
    }
  }

  return false;
}

export function isLiquid(inst: EnrichedInstrument): boolean {
  return !isIlliquid(inst);
}

export function isCheapAndLiquid(inst: EnrichedInstrument): boolean {
  return isCheapPointValue(inst) && isLiquid(inst);
}

export function isLowLiquidityWarning(inst: EnrichedInstrument): boolean {
  return isIlliquid(inst);
}

export interface ScreenerFilterStats {
  totalRows: number;
  shownRows: number;
  cheapPointValueCount: number;
  liquidRowsCount: number;
  cheapAndLiquidCount: number;
  illiquidHiddenCount: number;
  thresholds: {
    pointValueRubMax: number;
    minTurnoverRub: number;
    minTrades: number;
  };
  sampleAfterFilter: Array<{
    ticker: string;
    trades: number;
    turnoverRub: number;
    pointValueRub: number | null;
    lotValue: number;
    isLiquid: boolean;
    isCheapPointValue: boolean;
  }>;
}

export function buildScreenerFilterStats(
  instruments: EnrichedInstrument[],
  shownRows: EnrichedInstrument[],
  quickFilters: import("@/lib/types/screener").QuickFilterId[],
): ScreenerFilterStats {
  const filtered = shownRows;
  const illiquidCount = instruments.filter(isIlliquid).length;

  return {
    totalRows: instruments.length,
    shownRows: filtered.length,
    cheapPointValueCount: instruments.filter(isCheapPointValue).length,
    liquidRowsCount: instruments.filter(isLiquid).length,
    cheapAndLiquidCount: instruments.filter(isCheapAndLiquid).length,
    illiquidHiddenCount: quickFilters.includes("hide-illiquid")
      ? illiquidCount
      : 0,
    thresholds: {
      pointValueRubMax: CHEAP_POINT_VALUE_MAX_RUB,
      minTurnoverRub: MIN_LIQUID_TURNOVER_RUB,
      minTrades: MIN_LIQUID_TRADES,
    },
    sampleAfterFilter: filtered.slice(0, 10).map((inst) => ({
      ticker: inst.ticker,
      trades: inst.trades,
      turnoverRub: inst.turnoverRub,
      pointValueRub: getPointValueRub(inst),
      lotValue: inst.lotValue,
      isLiquid: isLiquid(inst),
      isCheapPointValue: isCheapPointValue(inst),
    })),
  };
}
