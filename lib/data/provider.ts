import type {
  MarketInstrument,
  MarketInstrumentRaw,
  MarketInstrumentsResult,
  GetMarketInstrumentsOptions,
  MarketDataStatus,
  DataDiagnostics,
  CacheStatus,
} from "@/lib/data/types";
import { getMarketDataConfig } from "@/lib/data/config";
import { getMockRawInstruments } from "@/lib/data/mock-instruments";
import { fetchMoexInstruments } from "@/lib/data/moex-adapter";
import { enrichMarketInstruments } from "@/lib/data/enrich";

function buildStatus(
  partial: Omit<MarketDataStatus, "updatedAt"> & { updatedAt?: string },
): MarketDataStatus {
  return {
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
    source: partial.source,
    isLive: partial.isLive,
    isDemo: partial.isDemo,
    fallbackReason: partial.fallbackReason,
  };
}

function emptyDiagnostics(
  fetchMs = 0,
  cache: CacheStatus = "none",
): DataDiagnostics {
  return {
    fetchMs,
    rowsRaw: 0,
    rowsNormalized: 0,
    cache,
    errors: [],
  };
}

function mockResult(diagnostics: DataDiagnostics): MarketInstrumentsResult {
  const raw = getMockRawInstruments();
  const rows = enrichMarketInstruments(raw);
  return {
    rows,
    status: buildStatus({
      source: "mock",
      isLive: false,
      isDemo: true,
    }),
    diagnostics: {
      ...diagnostics,
      rowsRaw: raw.length,
      rowsNormalized: rows.length,
    },
  };
}

function fallbackResult(
  reason: string,
  diagnostics: DataDiagnostics,
): MarketInstrumentsResult {
  const raw = getMockRawInstruments();
  const rows = enrichMarketInstruments(raw);
  return {
    rows,
    status: buildStatus({
      source: "fallback",
      isLive: false,
      isDemo: true,
      fallbackReason: reason,
    }),
    diagnostics: {
      ...diagnostics,
      rowsRaw: raw.length,
      rowsNormalized: rows.length,
      errors: [...diagnostics.errors, reason],
    },
  };
}

function errorResult(
  reason: string,
  diagnostics: DataDiagnostics,
): MarketInstrumentsResult {
  return {
    rows: [],
    status: buildStatus({
      source: "error",
      isLive: false,
      isDemo: false,
      fallbackReason: reason,
    }),
    diagnostics: {
      ...diagnostics,
      errors: [...diagnostics.errors, reason],
    },
  };
}

function liveResult(
  raw: MarketInstrumentRaw[],
  diagnostics: DataDiagnostics,
  updatedAt: string,
): MarketInstrumentsResult {
  const rows = enrichMarketInstruments(raw);
  return {
    rows,
    status: buildStatus({
      source: "moex",
      isLive: true,
      isDemo: false,
      updatedAt,
    }),
    diagnostics: {
      ...diagnostics,
      rowsNormalized: rows.length,
    },
  };
}

/**
 * Primary data entry point.
 *
 * Modes (MARKET_DATA_MODE):
 * - mock (default): учебные данные, always isDemo=true
 * - live: MOEX only; on failure → error + empty rows (no silent mock)
 * - fallback: try MOEX; on failure → mock with source=fallback + reason
 */
export async function getMarketInstruments(
  options?: GetMarketInstrumentsOptions,
): Promise<MarketInstrumentsResult> {
  const config = getMarketDataConfig();
  const mode = options?.mode ?? config.mode;
  const started = Date.now();
  const diagnostics = emptyDiagnostics();

  if (mode === "mock") {
    diagnostics.fetchMs = Date.now() - started;
    return mockResult(diagnostics);
  }

  try {
    const moex = await fetchMoexInstruments(config);
    diagnostics.fetchMs = Date.now() - started;
    diagnostics.rowsRaw = moex.rowsRaw;
    diagnostics.cache = moex.cache;
    diagnostics.errors.push(...moex.errors);

    if (moex.rows.length === 0) {
      const reason = "MOEX ISS вернул 0 инструментов";
      if (mode === "fallback") {
        return fallbackResult(reason, diagnostics);
      }
      return errorResult(reason, diagnostics);
    }

    return liveResult(moex.rows, diagnostics, moex.fetchedAt);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    diagnostics.fetchMs = Date.now() - started;
    diagnostics.errors.push(reason);

    if (mode === "fallback") {
      return fallbackResult(reason, diagnostics);
    }

    return errorResult(reason, diagnostics);
  }
}

/** Convenience: rows only (legacy) */
export async function getEnrichedInstruments(): Promise<MarketInstrument[]> {
  const { rows } = await getMarketInstruments();
  return rows;
}

export async function getInstrument(
  ticker: string,
): Promise<MarketInstrument | null> {
  const { rows } = await getMarketInstruments();
  return rows.find((i) => i.ticker === ticker) ?? null;
}
