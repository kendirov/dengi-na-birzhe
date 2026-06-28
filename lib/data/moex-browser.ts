import {
  TQBR_URL_SUFFIX,
  parseIssResponse,
  type IssSecuritiesResponse,
} from "@/lib/data/moex-iss-core";
import type { MarketInstrumentRaw } from "@/lib/data/types";

export interface MoexBrowserFetchResult {
  rows: MarketInstrumentRaw[];
  rowsRaw: number;
  errors: string[];
  fetchedAt: string;
}

export async function fetchMoexIssFromBrowser(
  moexBaseUrl = "https://iss.moex.com",
  timeoutMs = 12_000,
): Promise<MoexBrowserFetchResult> {
  const url = `${moexBaseUrl}${TQBR_URL_SUFFIX}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

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
    return {
      rows: parsed.rows,
      rowsRaw: parsed.rowsRaw,
      errors: parsed.errors,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    const msg =
      err instanceof Error && err.name === "AbortError"
        ? `MOEX request timed out after ${timeoutMs}ms`
        : `MOEX network error: ${err instanceof Error ? err.message : String(err)}`;
    throw new Error(msg);
  } finally {
    clearTimeout(timer);
  }
}

export { parseIssResponse };
