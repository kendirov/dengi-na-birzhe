import { getMockRawInstruments, getMockInstrument } from "@/lib/data/mock-instruments";
import type { InstrumentSource } from "@/lib/data/legacy-source";

/** @deprecated use getMarketInstruments from provider */
export const mockAdapter: InstrumentSource = {
  async getInstruments() {
    return getMockRawInstruments();
  },
  async getInstrument(ticker: string) {
    return getMockInstrument(ticker);
  },
};
