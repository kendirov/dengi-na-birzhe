/**
 * LiveInvestGroup characteristics API — server-side fetch with cache.
 */

import type {
  LiveInvestCommission,
  LiveInvestCommissionMap,
} from "@/lib/screener/liveinvest-commission";

export type { LiveInvestCommission, LiveInvestCommissionMap };
export {
  serializeLiveInvestMap,
  deserializeLiveInvestMap,
} from "@/lib/screener/liveinvest-commission";

export interface LiveInvestFetchMeta {
  rows: number;
  fetchedAt: string;
  fromCache: boolean;
  error?: string;
  timedOut?: boolean;
}

export interface LiveInvestFetchResult {
  map: LiveInvestCommissionMap;
  meta: LiveInvestFetchMeta;
}

const LI_API_URL =
  "https://production2.liveinvestgroup.ru/api/v1/stock/characteristics?isOnlyLiquid=true";

const FETCH_TIMEOUT_MS = 6_000;
const CACHE_TTL_MS = 15 * 60 * 1000;

interface LiApiRow {
  secid?: string;
  comisMarketRub?: number | null;
  comisLimiRub?: number | null;
  comisMarketPip?: number | null;
  comisLimiPip?: number | null;
}

let cache: { map: LiveInvestCommissionMap; fetchedAt: number } | null = null;

function toIntPoints(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return Math.trunc(value);
}

function toRub(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function normalizeRow(row: LiApiRow): LiveInvestCommission | null {
  const ticker = row.secid?.trim().toUpperCase();
  if (!ticker) return null;

  return {
    ticker,
    commissionMarketRub: toRub(row.comisMarketRub),
    commissionLimitRub: toRub(row.comisLimiRub),
    commissionMarketPoints: toIntPoints(row.comisMarketPip),
    commissionLimitPoints: toIntPoints(row.comisLimiPip),
    source: "liveinvest",
  };
}

function parseResponse(data: unknown): LiveInvestCommissionMap {
  const map = new Map<string, LiveInvestCommission>();
  if (!Array.isArray(data)) return map;

  for (const item of data) {
    const normalized = normalizeRow(item as LiApiRow);
    if (normalized) map.set(normalized.ticker, normalized);
  }
  return map;
}

async function fetchFromApi(): Promise<LiveInvestCommissionMap> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(LI_API_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!res.ok) {
      throw new Error(`LiveInvest API HTTP ${res.status}`);
    }
    const data: unknown = await res.json();
    return parseResponse(data);
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch LI commission map with in-memory cache (15 min). Returns empty map on failure. */
export async function fetchLiveInvestCommissionMap(): Promise<LiveInvestFetchResult> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return {
      map: cache.map,
      meta: {
        rows: cache.map.size,
        fetchedAt: new Date(cache.fetchedAt).toISOString(),
        fromCache: true,
      },
    };
  }

  try {
    const map = await fetchFromApi();
    cache = { map, fetchedAt: now };
    return {
      map,
      meta: {
        rows: map.size,
        fetchedAt: new Date(now).toISOString(),
        fromCache: false,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const timedOut =
      err instanceof Error &&
      (err.name === "AbortError" || message.includes("aborted"));

    if (cache) {
      return {
        map: cache.map,
        meta: {
          rows: cache.map.size,
          fetchedAt: new Date(cache.fetchedAt).toISOString(),
          fromCache: true,
          error: message,
          timedOut,
        },
      };
    }

    return {
      map: new Map(),
      meta: {
        rows: 0,
        fetchedAt: new Date(now).toISOString(),
        fromCache: false,
        error: message,
        timedOut,
      },
    };
  }
}
