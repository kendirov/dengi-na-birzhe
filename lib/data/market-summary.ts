import type { Instrument } from "@/lib/types/instrument";

export interface MarketSummary {
  indexName: string;
  indexValue: number;
  indexChangePct: number;
  liquidityScore: number;
  inPlayCount: number;
  avgVolatility: number;
  topTurnoverTicker: string;
  topTurnoverRub: number;
  sessionLabel: string;
}

export const marketSummary: MarketSummary = {
  indexName: "IMOEX",
  indexValue: 3245.67,
  indexChangePct: 0.84,
  liquidityScore: 87,
  inPlayCount: 6,
  avgVolatility: 72,
  topTurnoverTicker: "SBER",
  topTurnoverRub: 8_420_000_000,
  sessionLabel: "Основная сессия",
};

export function getTerminalPreviewRows(instruments: Instrument[]): Instrument[] {
  return [...instruments]
    .sort((a, b) => b.turnoverRub - a.turnoverRub)
    .slice(0, 7);
}
