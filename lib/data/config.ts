import type { MarketDataMode } from "@/lib/data/types";

const VALID_MODES: MarketDataMode[] = ["mock", "live", "fallback"];

export interface MarketDataConfig {
  mode: MarketDataMode;
  moexBaseUrl: string;
  moexTimeoutMs: number;
  revalidateSeconds: number;
}

function parseMode(raw: string | undefined): MarketDataMode {
  const value = (raw ?? "mock").toLowerCase();
  if (VALID_MODES.includes(value as MarketDataMode)) {
    return value as MarketDataMode;
  }
  return "mock";
}

export function getMarketDataConfig(): MarketDataConfig {
  return {
    mode: parseMode(process.env.MARKET_DATA_MODE),
    moexBaseUrl: process.env.MOEX_BASE_URL ?? "https://iss.moex.com",
    moexTimeoutMs: Number(process.env.MOEX_HTTP_TIMEOUT_MS ?? 12_000),
    revalidateSeconds: Number(process.env.MARKET_DATA_REVALIDATE_SECONDS ?? 900),
  };
}

export function isExplicitLiveMode(): boolean {
  return getMarketDataConfig().mode === "live";
}

export function isFallbackMode(): boolean {
  return getMarketDataConfig().mode === "fallback";
}
