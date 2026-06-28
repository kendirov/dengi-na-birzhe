export {
  getMarketInstruments,
  getEnrichedInstruments,
  getInstrument,
} from "@/lib/data/provider";

export type {
  MarketInstrumentsResult,
  MarketDataStatus,
  DataDiagnostics,
} from "@/lib/data/types";

/** @deprecated use getMarketInstruments */
export { getMarketInstruments as fetchMarketData } from "@/lib/data/provider";
