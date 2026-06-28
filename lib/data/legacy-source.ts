/** @deprecated Legacy adapter interface — use getMarketInstruments from provider */
export interface InstrumentSource {
  getInstruments(): Promise<import("@/lib/data/types").MarketInstrumentRaw[]>;
  getInstrument(ticker: string): Promise<import("@/lib/data/types").MarketInstrumentRaw | null>;
}
