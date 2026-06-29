export type MarketDataSource = "mock" | "moex" | "fallback" | "error";

export type MarketDataMode = "mock" | "live" | "fallback";

export type CacheStatus = "hit" | "miss" | "stale" | "none";

export type BaselineStatus = "missing" | "live_current";

export type InstrumentClass =
  | "stock"
  | "preferred_stock"
  | "fund"
  | "etf"
  | "bond"
  | "currency"
  | "unknown";

export type ScreenerMode =
  | "all"
  | "training"
  | "technical"
  | "spread"
  | "in-play"
  | "beginner"
  | "dangerous";

export type InstrumentCategory =
  | "technical"
  | "spread"
  | "in-play"
  | "liquid"
  | "beginner"
  | "dangerous";

export type VisualTag =
  | "money"
  | "tape"
  | "narrow-spread"
  | "wide-spread"
  | "cheap-lot"
  | "expensive-lot"
  | "technical"
  | "spread-trading"
  | "in-play"
  | "beginner"
  | "dangerous"
  | "high-range";

/** Raw instrument before enrichment (mock or MOEX normalized) */
export interface MarketInstrumentRaw {
  ticker: string;
  name: string;
  price: number;
  changePct: number | null;
  lotSize: number;
  tickSize: number | null;
  bid: number | null;
  ask: number | null;
  spreadRub: number | null;
  turnoverRub: number;
  trades: number;
  volume: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  avgTurnover20d: number | null;
  avgTrades20d: number | null;
  baselineStatus: BaselineStatus;
  dayRangePct: number | null;
  volatilityScore: number;
  technicalScore: number;
  spreadScore: number;
  liquidityScore: number;
  beginnerScore: number;
  categoryTags: InstrumentCategory[];
  explanation: string;
  risk: "low" | "medium" | "high";
  instrumentClass: InstrumentClass;
  isTradableStock: boolean;
  excludeReason: string | null;
}

/** Computed scores (may override raw placeholders after enrichment) */
export interface InstrumentScore {
  volatilityScore: number;
  technicalScore: number;
  spreadScore: number;
  liquidityScore: number;
  beginnerScore: number;
  spreadTradingScore: number;
  inPlayScore: number;
  dangerousScore: number;
  zigzagScore: number;
  hasHistoricalBaseline: boolean;
}

/** Full instrument for UI (screener, inspector) */
export interface MarketInstrument extends MarketInstrumentRaw, InstrumentScore {
  lotValue: number;
  /** @deprecated alias for tickValueRub — use tickValueRub in UI */
  rubPerPointPerLot: number;
  tickValueRub: number | null;
  spreadPct: number | null;
  spreadTicks: number | null;
  bigLotRub: number | null;
  spreadCostRub: number | null;
  entryCostRub: number | null;
  commissionLimitRate: number;
  commissionMarketRate: number;
  commissionLimitRub: number;
  commissionMarketRub: number;
  commissionLimitTicks: number | null;
  commissionMarketTicks: number | null;
  entryCostLimitRub: number | null;
  entryCostMarketRub: number | null;
  entryCostLimitTicks: number | null;
  entryCostMarketTicks: number | null;
  defaultCommissionRate: number;
  visualTags: VisualTag[];
  whyBullets: string[];
  spreadWhyBullets: string[];
  spreadTradable: boolean;
  riskBullets: string[];
  lessonTips: string[];
  typeLabels: string[];
  whyShort: string;
}

export interface MarketDataStatus {
  source: MarketDataSource;
  isLive: boolean;
  isDemo: boolean;
  updatedAt: string;
  fallbackReason?: string;
}

export interface UniverseDiagnostics {
  raw: number;
  afterParse: number;
  stocks: number;
  funds: number;
  etfs: number;
  unknown: number;
  noPrice: number;
  noBidAsk: number;
}

export interface UniverseSampleInstrument {
  ticker: string;
  name: string;
  instrumentClass: InstrumentClass;
  excludeReason?: string | null;
}

export interface DataDiagnostics {
  fetchMs: number;
  rowsRaw: number;
  rowsNormalized: number;
  rowsAfterParse?: number;
  rowsAfterUniverseFilter?: number;
  excludedFunds?: number;
  excludedEtfs?: number;
  excludedUnknown?: number;
  excludedNoPrice?: number;
  excludedNoTicker?: number;
  universe?: UniverseDiagnostics;
  sampleExcluded?: UniverseSampleInstrument[];
  sampleIncluded?: UniverseSampleInstrument[];
  cache: CacheStatus;
  errors: string[];
}

export interface MarketInstrumentsResult {
  rows: MarketInstrument[];
  status: MarketDataStatus;
  diagnostics: DataDiagnostics;
}

export interface GetMarketInstrumentsOptions {
  /** Override env MARKET_DATA_MODE */
  mode?: MarketDataMode;
}

export {
  DEFAULT_COMMISSION_RATE,
  DEFAULT_LIMIT_COMMISSION_RATE,
  DEFAULT_MARKET_COMMISSION_RATE,
} from "@/lib/screener/commission";

/** @deprecated Use MarketInstrument */
export type EnrichedInstrument = MarketInstrument;

/** @deprecated Use MarketInstrumentRaw */
export type Instrument = MarketInstrumentRaw;
