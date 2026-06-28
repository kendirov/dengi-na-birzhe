import { getMarketInstruments } from "@/lib/data/provider";
import type { MarketInstrumentRaw } from "@/lib/data/types";

/** Homepage / legacy entry — respects MARKET_DATA_MODE (default mock) */
export async function getInstruments(): Promise<MarketInstrumentRaw[]> {
  const { rows, status } = await getMarketInstruments();
  if (status.source === "error") {
    return [];
  }
  return rows;
}

export { getMarketInstruments };
