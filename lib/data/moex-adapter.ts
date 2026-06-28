import { unstable_cache } from "next/cache";
import type { MarketInstrumentRaw, CacheStatus } from "@/lib/data/types";
import type { MarketDataConfig } from "@/lib/data/config";
import {
  TQBR_URL_SUFFIX,
  parseIssResponse,
  mapTable,
  safeNumber,
  safeString,
  mergeBySecId,
  type IssSecuritiesResponse,
} from "@/lib/data/moex-iss-core";

export { mapTable, safeNumber, safeString, mergeBySecId };

export interface MoexFetchResult {
  rows: MarketInstrumentRaw[];
  rowsRaw: number;
  errors: string[];
  cache: CacheStatus;
  fetchedAt: string;
}

/** Dev/single-instance cache for diagnostics (hit/miss/stale) */
let memoryCache: {
  key: string;
  fetchedAt: number;
  result: Omit<MoexFetchResult, "cache" | "fetchedAt">;
} | null = null;

function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  revalidateSeconds: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    signal: controller.signal,
    headers: { Accept: "application/json" },
    next: { revalidate: revalidateSeconds },
  }).finally(() => clearTimeout(timer));
}

async function fetchMoexUncached(
  config: MarketDataConfig,
): Promise<Omit<MoexFetchResult, "cache" | "fetchedAt">> {
  const errors: string[] = [];
  const url = `${config.moexBaseUrl}${TQBR_URL_SUFFIX}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(
      url,
      config.moexTimeoutMs,
      config.revalidateSeconds,
    );
  } catch (err) {
    const msg =
      err instanceof Error && err.name === "AbortError"
        ? `MOEX request timed out after ${config.moexTimeoutMs}ms`
        : `MOEX network error: ${err instanceof Error ? err.message : String(err)}`;
    throw new Error(msg);
  }

  if (!response.ok) {
    throw new Error(`MOEX HTTP ${response.status}: ${response.statusText}`);
  }

  let body: IssSecuritiesResponse;
  try {
    body = (await response.json()) as IssSecuritiesResponse;
  } catch {
    throw new Error("MOEX: invalid JSON response");
  }

  const parsed = parseIssResponse(body);
  errors.push(...parsed.errors);

  return { rows: parsed.rows, rowsRaw: parsed.rowsRaw, errors };
}

const getCachedMoex = (config: MarketDataConfig) =>
  unstable_cache(
    () => fetchMoexUncached(config),
    ["moex-tqbr-instruments", config.moexBaseUrl],
    { revalidate: config.revalidateSeconds },
  );

/**
 * Fetch live MOEX TQBR data for all board securities (server-side).
 * Throws on network/HTTP/parse failure — caller handles fallback vs error.
 */
export async function fetchMoexInstruments(
  config: MarketDataConfig,
): Promise<MoexFetchResult> {
  const cacheKey = `${config.moexBaseUrl}:${config.revalidateSeconds}`;
  const ttlMs = config.revalidateSeconds * 1000;
  const now = Date.now();

  if (
    memoryCache &&
    memoryCache.key === cacheKey &&
    now - memoryCache.fetchedAt < ttlMs
  ) {
    return {
      ...memoryCache.result,
      cache: "hit",
      fetchedAt: new Date(memoryCache.fetchedAt).toISOString(),
    };
  }

  const hadStaleEntry =
    memoryCache !== null &&
    memoryCache.key === cacheKey &&
    now - memoryCache.fetchedAt >= ttlMs;

  try {
    const result = await getCachedMoex(config)();
    const fetchedAt = Date.now();
    memoryCache = { key: cacheKey, fetchedAt, result };
    return {
      ...result,
      cache: hadStaleEntry ? "stale" : "miss",
      fetchedAt: new Date(fetchedAt).toISOString(),
    };
  } catch (err) {
    if (hadStaleEntry && memoryCache) {
      return {
        ...memoryCache.result,
        cache: "stale",
        fetchedAt: new Date(memoryCache.fetchedAt).toISOString(),
      };
    }
    throw err;
  }
}
