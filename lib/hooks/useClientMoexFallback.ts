"use client";

import { useEffect, useRef, useState } from "react";
import type {
  MarketDataMode,
  MarketDataStatus,
  DataDiagnostics,
  MarketInstrument,
  MarketInstrumentRaw,
} from "@/lib/data/types";
import { enrichMarketInstruments } from "@/lib/data/enrich";
import { getMockRawInstruments } from "@/lib/data/mock-instruments";
import { fetchMoexIssFromBrowser } from "@/lib/data/moex-browser";
import {
  deserializeLiveInvestMap,
  type LiveInvestCommission,
} from "@/lib/screener/liveinvest-commission";

export interface ScreenerDataState {
  instruments: MarketInstrument[];
  status: MarketDataStatus;
  diagnostics: DataDiagnostics;
}

interface UseClientMoexFallbackOptions {
  dataMode: MarketDataMode;
  moexBaseUrl: string;
  moexTimeoutMs: number;
  liveInvestCommissions?: Record<string, LiveInvestCommission>;
  initial: ScreenerDataState;
}

function shouldFetchFromBrowser(
  dataMode: MarketDataMode,
  status: MarketDataStatus,
): boolean {
  if (dataMode === "mock") return false;
  if (status.source === "moex" && status.isLive) return false;
  return true;
}

function buildLiveState(
  raw: MarketInstrumentRaw[],
  rowsRaw: number,
  universe: import("@/lib/data/instrument-classifier").UniverseFilterStats,
  errors: string[],
  fetchMs: number,
  fetchedAt: string,
  liveInvestCommissions?: Record<string, LiveInvestCommission>,
): ScreenerDataState {
  const liMap = deserializeLiveInvestMap(liveInvestCommissions);
  const rows = enrichMarketInstruments(raw, liMap);
  return {
    instruments: rows,
    status: {
      source: "moex",
      isLive: true,
      isDemo: false,
      updatedAt: fetchedAt,
    },
    diagnostics: {
      fetchMs,
      rowsRaw,
      rowsNormalized: rows.length,
      rowsAfterParse: universe.afterParse,
      rowsAfterUniverseFilter: universe.stocks,
      excludedFunds: universe.funds,
      excludedEtfs: universe.etfs,
      excludedUnknown: universe.unknown,
      excludedNoPrice: universe.noPrice,
      excludedNoTicker: universe.noTicker,
      universe: {
        raw: universe.raw,
        afterParse: universe.afterParse,
        stocks: universe.stocks,
        funds: universe.funds,
        etfs: universe.etfs,
        unknown: universe.unknown,
        noPrice: universe.noPrice,
        noBidAsk: universe.noBidAsk,
      },
      sampleExcluded: universe.sampleExcluded,
      sampleIncluded: universe.sampleIncluded,
      cache: "none",
      errors: [...errors, "Источник: браузер (MOEX ISS CORS)"],
    },
  };
}

function buildFallbackState(
  reason: string,
  fetchMs: number,
  liveInvestCommissions?: Record<string, LiveInvestCommission>,
): ScreenerDataState {
  const liMap = deserializeLiveInvestMap(liveInvestCommissions);
  const raw = getMockRawInstruments();
  const rows = enrichMarketInstruments(raw, liMap);
  return {
    instruments: rows,
    status: {
      source: "fallback",
      isLive: false,
      isDemo: true,
      updatedAt: new Date().toISOString(),
      fallbackReason: reason,
    },
    diagnostics: {
      fetchMs,
      rowsRaw: raw.length,
      rowsNormalized: rows.length,
      cache: "none",
      errors: [reason],
    },
  };
}

export function useClientMoexFallback({
  dataMode,
  moexBaseUrl,
  moexTimeoutMs,
  liveInvestCommissions,
  initial,
}: UseClientMoexFallbackOptions): ScreenerDataState & { isLoading: boolean } {
  const [state, setState] = useState(initial);
  const serverNeedsFallback = useRef(
    shouldFetchFromBrowser(dataMode, initial.status),
  ).current;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!serverNeedsFallback) {
      return;
    }

    let cancelled = false;

    async function loadFromBrowser() {
      setIsLoading(true);
      const started = Date.now();

      try {
        const result = await fetchMoexIssFromBrowser(
          moexBaseUrl,
          moexTimeoutMs,
        );
        if (cancelled) return;

        setState(
          buildLiveState(
            result.rows,
            result.rowsRaw,
            result.universe,
            result.errors,
            Date.now() - started,
            result.fetchedAt,
            liveInvestCommissions,
          ),
        );
      } catch (err) {
        if (cancelled) return;

        const reason = err instanceof Error ? err.message : String(err);
        if (dataMode === "fallback") {
          setState(buildFallbackState(reason, Date.now() - started, liveInvestCommissions));
        } else {
          setState({
            instruments: [],
            status: {
              source: "error",
              isLive: false,
              isDemo: false,
              updatedAt: new Date().toISOString(),
              fallbackReason: reason,
            },
            diagnostics: {
              fetchMs: Date.now() - started,
              rowsRaw: 0,
              rowsNormalized: 0,
              cache: "none",
              errors: [reason, "Сервер и браузер не смогли получить MOEX ISS"],
            },
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadFromBrowser();

    return () => {
      cancelled = true;
    };
  }, [dataMode, moexBaseUrl, moexTimeoutMs, serverNeedsFallback, liveInvestCommissions]);

  return { ...state, isLoading };
}
