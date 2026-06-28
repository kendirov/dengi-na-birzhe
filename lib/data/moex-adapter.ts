import { unstable_cache } from "next/cache";
import type {
  MarketInstrumentRaw,
  CacheStatus,
  BaselineStatus,
} from "@/lib/data/types";
import type { MarketDataConfig } from "@/lib/data/config";

export interface MoexFetchResult {
  rows: MarketInstrumentRaw[];
  rowsRaw: number;
  errors: string[];
  cache: CacheStatus;
  fetchedAt: string;
}

interface IssTable {
  columns: string[];
  data: unknown[][];
}

interface IssSecuritiesResponse {
  securities?: IssTable;
  marketdata?: IssTable;
}

type RowRecord = Record<string, unknown>;

const TQBR_URL_SUFFIX =
  "/iss/engines/stock/markets/shares/boards/TQBR/securities.json" +
  "?iss.meta=off&iss.only=securities,marketdata";

/** Dev/single-instance cache for diagnostics (hit/miss/stale) */
let memoryCache: {
  key: string;
  fetchedAt: number;
  result: Omit<MoexFetchResult, "cache" | "fetchedAt">;
} | null = null;

export function mapTable(columns: string[], data: unknown[][]): RowRecord[] {
  return data.map((row) => {
    const record: RowRecord = {};
    for (let i = 0; i < columns.length; i += 1) {
      record[columns[i]!] = row[i];
    }
    return record;
  });
}

export function safeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function mergeBySecId(
  securitiesRows: RowRecord[],
  marketdataRows: RowRecord[],
): RowRecord[] {
  const mdByTicker = new Map<string, RowRecord>();
  for (const row of marketdataRows) {
    const id = safeString(row.SECID);
    if (id) mdByTicker.set(id, row);
  }

  return securitiesRows.map((sec) => ({
    ...sec,
    ...mdByTicker.get(safeString(sec.SECID)),
  }));
}

function resolvePrice(row: RowRecord): number | null {
  const last = safeNumber(row.LAST);
  if (last !== null && last > 0) return last;

  const marketPrice = safeNumber(row.MARKETPRICE);
  if (marketPrice !== null && marketPrice > 0) return marketPrice;

  const prev = safeNumber(row.PREVPRICE);
  if (prev !== null && prev > 0) return prev;

  return null;
}

function resolveChangePct(row: RowRecord, price: number): number | null {
  const lastToPrev = safeNumber(row.LASTTOPREVPRICE);
  if (lastToPrev !== null) return lastToPrev;

  const change = safeNumber(row.CHANGE);
  if (change !== null && price > 0) {
    const prev = safeNumber(row.PREVPRICE);
    if (prev !== null && prev > 0) {
      return (change / prev) * 100;
    }
  }

  const lastChangePct = safeNumber(row.LASTCHANGEPRCNT);
  if (lastChangePct !== null) return lastChangePct;

  const prev = safeNumber(row.PREVPRICE);
  if (prev !== null && prev > 0) {
    return ((price - prev) / prev) * 100;
  }

  return null;
}

function normalizeRow(row: RowRecord): MarketInstrumentRaw | null {
  const ticker = safeString(row.SECID);
  if (!ticker) return null;

  const price = resolvePrice(row);
  if (price === null || price <= 0) return null;

  const name =
    safeString(row.SHORTNAME) ||
    safeString(row.SECNAME) ||
    ticker;

  const lotSize = safeNumber(row.LOTSIZE) ?? 1;
  const tickSizeRaw = safeNumber(row.MINSTEP);
  const tickSize = tickSizeRaw !== null && tickSizeRaw > 0 ? tickSizeRaw : null;

  const bid = safeNumber(row.BID);
  const ask = safeNumber(row.OFFER);

  let spreadRub: number | null = null;
  if (
    bid !== null &&
    ask !== null &&
    bid > 0 &&
    ask > 0 &&
    ask > bid
  ) {
    spreadRub = ask - bid;
  }

  const turnoverRub =
    safeNumber(row.VALTODAY) ?? safeNumber(row.VALUE) ?? 0;
  const trades = safeNumber(row.NUMTRADES) ?? 0;
  const volume = safeNumber(row.VOLTODAY) ?? safeNumber(row.VOLUME);

  const dayHigh = safeNumber(row.HIGH);
  const dayLow = safeNumber(row.LOW);

  let dayRangePct: number | null = null;
  if (
    dayHigh !== null &&
    dayLow !== null &&
    price > 0 &&
    dayHigh >= dayLow
  ) {
    dayRangePct = ((dayHigh - dayLow) / price) * 100;
  }

  const baselineStatus: BaselineStatus = "missing";

  return {
    ticker,
    name,
    price,
    changePct: resolveChangePct(row, price),
    lotSize,
    tickSize,
    bid,
    ask,
    spreadRub,
    turnoverRub,
    trades,
    volume,
    dayHigh,
    dayLow,
    avgTurnover20d: null,
    avgTrades20d: null,
    baselineStatus,
    dayRangePct,
    volatilityScore: 50,
    technicalScore: 50,
    spreadScore: 50,
    liquidityScore: 50,
    beginnerScore: 50,
    categoryTags: [],
    explanation: `MOEX TQBR · ${ticker}`,
    risk: "medium",
  };
}

function parseIssResponse(body: IssSecuritiesResponse): {
  rows: MarketInstrumentRaw[];
  errors: string[];
} {
  const parseErrors: string[] = [];
  const sec = body.securities;

  if (!sec?.columns?.length || !sec.data?.length) {
    throw new Error("MOEX ISS: empty securities table in response");
  }

  const secRows = mapTable(sec.columns, sec.data);
  const mdRows =
    body.marketdata?.columns?.length && body.marketdata.data?.length
      ? mapTable(body.marketdata.columns, body.marketdata.data)
      : [];

  const merged = mergeBySecId(secRows, mdRows);
  const rows: MarketInstrumentRaw[] = [];
  let missingSpread = 0;

  for (const row of merged) {
    const inst = normalizeRow(row);
    if (!inst) continue;
    if (inst.spreadRub === null) missingSpread += 1;
    rows.push(inst);
  }

  if (missingSpread > 0) {
    parseErrors.push(
      `Спред недоступен для ${missingSpread} инструментов (нет BID/OFFER в ISS)`,
    );
  }

  return { rows, errors: parseErrors };
}

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

  const rowsRaw = body.securities?.data?.length ?? 0;
  const parsed = parseIssResponse(body);
  const rows = parsed.rows;
  errors.push(...parsed.errors);

  if (rows.length === 0) {
    throw new Error("MOEX parser returned 0 instruments — check ISS schema");
  }

  return { rows, rowsRaw, errors };
}

const getCachedMoex = (config: MarketDataConfig) =>
  unstable_cache(
    () => fetchMoexUncached(config),
    ["moex-tqbr-instruments", config.moexBaseUrl],
    { revalidate: config.revalidateSeconds },
  );

/**
 * Fetch live MOEX TQBR data for all board securities.
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
