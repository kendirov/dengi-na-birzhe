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

export interface ScreenerDataState {
  instruments: MarketInstrument[];
  status: MarketDataStatus;
  diagnostics: DataDiagnostics;
}

interface UseClientMoexFallbackOptions {
  dataMode: MarketDataMode;
  moexBaseUrl: string;
  moexTimeoutMs: number;
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
  errors: string[],
  fetchMs: number,
  fetchedAt: string,
): ScreenerDataState {
  const rows = enrichMarketInstruments(raw);
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
      cache: "none",
      errors: [...errors, "Источник: браузер (MOEX ISS CORS)"],
    },
  };
}

function buildFallbackState(
  reason: string,
  fetchMs: number,
): ScreenerDataState {
  const raw = getMockRawInstruments();
  const rows = enrichMarketInstruments(raw);
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
  initial,
}: UseClientMoexFallbackOptions): ScreenerDataState & { isLoading: boolean } {
  const [state, setState] = useState(initial);
  const serverNeedsFallback = useRef(
    shouldFetchFromBrowser(dataMode, initial.status),
  ).current;
  const [isLoading, setIsLoading] = useState(serverNeedsFallback);

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
            result.errors,
            Date.now() - started,
            result.fetchedAt,
          ),
        );
      } catch (err) {
        if (cancelled) return;

        const reason = err instanceof Error ? err.message : String(err);
        if (dataMode === "fallback") {
          setState(buildFallbackState(reason, Date.now() - started));
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
  }, [dataMode, moexBaseUrl, moexTimeoutMs, serverNeedsFallback]);

  return { ...state, isLoading };
}
