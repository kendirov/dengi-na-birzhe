import type { MarketInstrument, ScreenerMode } from "@/lib/data/types";

export type { ScreenerMode };

export type QuickFilterId =
  | "cheap-lot"
  | "many-trades"
  | "narrow-spread"
  | "wide-spread"
  | "big-turnover"
  | "high-range";

export type SortColumn =
  | "ticker"
  | "price"
  | "changePct"
  | "lotValue"
  | "tickSize"
  | "tickValueRub"
  | "spreadTicks"
  | "spreadRub"
  | "spreadPct"
  | "commissionLimitRub"
  | "commissionMarketRub"
  | "commissionLimitTicks"
  | "commissionMarketTicks"
  | "turnoverRub"
  | "trades"
  | "dayRangePct"
  | "score"
  | "entryCostRub"
  | "rubPerPointPerLot";

export type SortDirection = "asc" | "desc";

export interface ScreenerModeConfig {
  id: ScreenerMode;
  label: string;
  description: string;
}

export interface QuickFilterConfig {
  id: QuickFilterId;
  label: string;
}

export interface ScreenerState {
  mode: ScreenerMode;
  search: string;
  quickFilters: QuickFilterId[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

export type ScoreKey =
  | "technicalScore"
  | "spreadTradingScore"
  | "inPlayScore"
  | "beginnerScore"
  | "dangerousScore"
  | "liquidityScore";

export function getModeScore(
  instrument: MarketInstrument,
  mode: ScreenerMode,
): number {
  switch (mode) {
    case "all":
      return instrument.liquidityScore;
    case "technical":
      return instrument.technicalScore;
    case "spread":
      return instrument.spreadTradingScore;
    case "in-play":
      return instrument.inPlayScore;
    case "beginner":
      return instrument.beginnerScore;
    case "dangerous":
      return instrument.dangerousScore;
    default:
      return 0;
  }
}
