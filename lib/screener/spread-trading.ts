/**
 * @deprecated Use order-book.ts — kept for backward-compatible imports.
 */
export {
  isFundLikeInstrument,
  isOrderBookCandidate as isSpreadTradableCandidate,
  calculateOrderBookScore as calculateSpreadTradingScore,
  buildOrderBookUniverseContext as buildSpreadUniverseContext,
  spreadPointsQuality,
} from "@/lib/screener/order-book";

export type { OrderBookUniverseContext as SpreadUniverseContext } from "@/lib/screener/order-book";

import type { MarketInstrument } from "@/lib/data/types";

/** @deprecated Use OrderBookScoreInput from order-book.ts */
export type SpreadScoreInput = Pick<
  MarketInstrument,
  | "ticker"
  | "name"
  | "price"
  | "lotSize"
  | "lotValue"
  | "tickSize"
  | "tickValueRub"
  | "spreadRub"
  | "spreadTicks"
  | "turnoverRub"
  | "trades"
  | "bid"
  | "ask"
  | "entryCostMarketTicks"
  | "commissionMarketTicks"
>;
