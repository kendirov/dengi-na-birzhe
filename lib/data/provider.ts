import type {
  MarketInstrument,
  MarketInstrumentRaw,
  MarketInstrumentsResult,
  GetMarketInstrumentsOptions,
  MarketDataStatus,
  DataDiagnostics,
  CacheStatus,
  UniverseDiagnostics,
} from "@/lib/data/types";
import type { UniverseFilterStats } from "@/lib/data/instrument-classifier";
import { getMarketDataConfig } from "@/lib/data/config";
import { getMockRawInstruments } from "@/lib/data/mock-instruments";
import { fetchMoexInstruments } from "@/lib/data/moex-adapter";
import { enrichMarketInstruments } from "@/lib/data/enrich";
import {
  fetchLiveInvestCommissionMap,
  type LiveInvestCommissionMap,
} from "@/lib/server/liveinvest-characteristics";

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

function applyUniverseDiagnostics(
  diagnostics: DataDiagnostics,
  universe: UniverseFilterStats | undefined,
): DataDiagnostics {
  if (!universe) {
    return diagnostics;
  }
  const universeDiag: UniverseDiagnostics = {
    raw: universe.raw,
    afterParse: universe.afterParse,
    stocks: universe.stocks,
    funds: universe.funds,
    etfs: universe.etfs,
    unknown: universe.unknown,
    noPrice: universe.noPrice,
    noBidAsk: universe.noBidAsk,
  };

  return {
    ...diagnostics,
    rowsAfterParse: universe.afterParse,
    rowsAfterUniverseFilter: universe.stocks,
    excludedFunds: universe.funds,
    excludedEtfs: universe.etfs,
    excludedUnknown: universe.unknown,
    excludedNoPrice: universe.noPrice,
    excludedNoTicker: universe.noTicker,
    universe: universeDiag,
    sampleExcluded: universe.sampleExcluded,
    sampleIncluded: universe.sampleIncluded,
  };
}

function mockResult(
  diagnostics: DataDiagnostics,
  liveInvestMap: LiveInvestCommissionMap,
): MarketInstrumentsResult {
  const raw = getMockRawInstruments();
  const rows = enrichMarketInstruments(raw, liveInvestMap);
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
      rowsAfterUniverseFilter: rows.length,
    },
  };
}

function fallbackResult(
  reason: string,
  diagnostics: DataDiagnostics,
  liveInvestMap: LiveInvestCommissionMap,
): MarketInstrumentsResult {
  const raw = getMockRawInstruments();
  const rows = enrichMarketInstruments(raw, liveInvestMap);
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
      rowsAfterUniverseFilter: rows.length,
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
  universe: UniverseFilterStats | undefined,
  liveInvestMap: LiveInvestCommissionMap,
): MarketInstrumentsResult {
  const rows = enrichMarketInstruments(raw, liveInvestMap);
  return {
    rows,
    status: buildStatus({
      source: "moex",
      isLive: true,
      isDemo: false,
      updatedAt,
    }),
    diagnostics: applyUniverseDiagnostics(
      {
        ...diagnostics,
        rowsNormalized: rows.length,
      },
      universe,
    ),
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

  const { map: liveInvestMap } = await fetchLiveInvestCommissionMap();

  if (mode === "mock") {
    diagnostics.fetchMs = Date.now() - started;
    return mockResult(diagnostics, liveInvestMap);
  }

  try {
    const moex = await fetchMoexInstruments(config);
    diagnostics.fetchMs = Date.now() - started;
    diagnostics.rowsRaw = moex.rowsRaw;
    diagnostics.cache = moex.cache;
    diagnostics.errors.push(...moex.errors);

    if (moex.rows.length === 0) {
      const reason = "MOEX ISS вернул 0 tradable stocks";
      if (mode === "fallback") {
        return fallbackResult(reason, diagnostics, liveInvestMap);
      }
      return errorResult(reason, diagnostics);
    }

    return liveResult(
      moex.rows,
      diagnostics,
      moex.fetchedAt,
      moex.universe,
      liveInvestMap,
    );
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    diagnostics.fetchMs = Date.now() - started;
    diagnostics.errors.push(reason);

    if (mode === "fallback") {
      return fallbackResult(reason, diagnostics, liveInvestMap);
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
