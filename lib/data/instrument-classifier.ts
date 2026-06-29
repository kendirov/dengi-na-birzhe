import type { InstrumentClass } from "@/lib/data/types";

export type RowRecord = Record<string, unknown>;

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export interface MoexInstrumentClassification {
  instrumentClass: InstrumentClass;
  isTradableStock: boolean;
  excludeReason: string | null;
}

const FUND_NAME_PATTERNS: RegExp[] = [
  /\betf\b/i,
  /бпиф/i,
  /\bпиф\b/i,
  /фонд/i,
  /inav/i,
  /биржев[^\s]*\s+фонд/i,
  /биржев[^\s]*\s+паев/i,
  /управля[^\s]*\s+фонд/i,
  /зпif/i,
  /ипif/i,
  /фондсуб/i,
  /паев[^\s]*\s+инвест/i,
];

const ETF_NAME_PATTERNS: RegExp[] = [
  /\betf\b/i,
  /бпиф/i,
  /inav/i,
  /биржев[^\s]*\s+фонд/i,
];

const BOND_NAME_PATTERNS: RegExp[] = [
  /облигац/i,
  /\bbond\b/i,
  /биржев[^\s]*\s+облигац/i,
];

const CURRENCY_NAME_PATTERNS: RegExp[] = [
  /валют/i,
  /\bcurrency\b/i,
  /usd\/rub/i,
  /eur\/rub/i,
];

function buildNameBlob(row: RowRecord): string {
  return [
    safeString(row.SHORTNAME),
    safeString(row.SECNAME),
    safeString(row.LATNAME),
    safeString(row.REMARKS),
    safeString(row.SECID),
    safeString(row.ISIN),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

/** Name/ticker heuristics for ПИФ, БПИФ, ETF (MOEX row before normalize). */
export function isFundLikeInstrument(row: RowRecord): boolean;
export function isFundLikeInstrument(row: { ticker: string; name: string }): boolean;
export function isFundLikeInstrument(
  row: RowRecord | { ticker: string; name: string },
): boolean {
  if ("SECID" in row || "SHORTNAME" in row) {
    const c = classifyMoexInstrument(row as RowRecord);
    return c.instrumentClass === "fund" || c.instrumentClass === "etf";
  }

  const inst = row as { ticker: string; name: string };
  const name = inst.name.toLowerCase();
  const ticker = inst.ticker.toUpperCase();
  if (matchesAny(name, FUND_NAME_PATTERNS)) return true;
  if (/\betf\b/i.test(name) || name.includes("бпиф")) return true;
  if (/^RU000[A-Z0-9]+$/.test(ticker) && matchesAny(name, [/пif/i, /фонд/i])) {
    return true;
  }
  return false;
}

export function isStockLikeInstrument(row: RowRecord): boolean {
  const c = classifyMoexInstrument(row);
  return c.instrumentClass === "stock" || c.instrumentClass === "preferred_stock";
}

export function shouldIncludeInStockScreener(
  row: RowRecord,
  classification?: MoexInstrumentClassification,
): boolean {
  const c = classification ?? classifyMoexInstrument(row);
  if (!c.isTradableStock) return false;

  const ticker = safeString(row.SECID);
  if (!ticker) return false;

  const status = safeString(row.STATUS);
  if (status && status !== "A") return false;

  return true;
}

export function classifyMoexInstrument(row: RowRecord): MoexInstrumentClassification {
  const ticker = safeString(row.SECID);
  const sectype = safeString(row.SECTYPE);
  const instrid = safeString(row.INSTRID);
  const nameBlob = buildNameBlob(row);

  if (sectype === "J") {
    return {
      instrumentClass: "etf",
      isTradableStock: false,
      excludeReason: "SECTYPE J — ETF/БПИФ",
    };
  }

  if (sectype === "B" || sectype === "A" || sectype === "9") {
    return {
      instrumentClass: "fund",
      isTradableStock: false,
      excludeReason: `SECTYPE ${sectype} — ПИФ/фонд`,
    };
  }

  if (matchesAny(nameBlob, FUND_NAME_PATTERNS)) {
    const isEtf =
      matchesAny(nameBlob, ETF_NAME_PATTERNS) ||
      /\betf\b/i.test(nameBlob);
    return {
      instrumentClass: isEtf ? "etf" : "fund",
      isTradableStock: false,
      excludeReason: isEtf ? "ETF по названию" : "фонд по названию",
    };
  }

  if (/^RU000[A-Z0-9]{7,}$/i.test(ticker)) {
    return {
      instrumentClass: "fund",
      isTradableStock: false,
      excludeReason: "ISIN-тикер — вероятно ПИФ/фонд",
    };
  }

  if (matchesAny(nameBlob, CURRENCY_NAME_PATTERNS)) {
    return {
      instrumentClass: "currency",
      isTradableStock: false,
      excludeReason: "валютный инструмент",
    };
  }

  if (matchesAny(nameBlob, BOND_NAME_PATTERNS)) {
    return {
      instrumentClass: "bond",
      isTradableStock: false,
      excludeReason: "облигация",
    };
  }

  if (sectype === "2") {
    return {
      instrumentClass: "preferred_stock",
      isTradableStock: true,
      excludeReason: null,
    };
  }

  if (sectype === "1") {
    return {
      instrumentClass: "stock",
      isTradableStock: true,
      excludeReason: null,
    };
  }

  if (sectype === "D") {
    return {
      instrumentClass: "unknown",
      isTradableStock: false,
      excludeReason: "SECTYPE D — депозитарная расписка",
    };
  }

  if (instrid === "EQIN" && (sectype === "1" || sectype === "2")) {
    return {
      instrumentClass: sectype === "2" ? "preferred_stock" : "stock",
      isTradableStock: true,
      excludeReason: null,
    };
  }

  return {
    instrumentClass: "unknown",
    isTradableStock: false,
    excludeReason: sectype
      ? `неизвестный SECTYPE ${sectype}`
      : "не удалось классифицировать",
  };
}

export const TRADABLE_STOCK_DEFAULTS: Pick<
  MoexInstrumentClassification,
  "instrumentClass" | "isTradableStock" | "excludeReason"
> = {
  instrumentClass: "stock",
  isTradableStock: true,
  excludeReason: null,
};

export interface UniverseSampleRow {
  ticker: string;
  name: string;
  instrumentClass: InstrumentClass;
  excludeReason?: string | null;
}

export interface UniverseFilterStats {
  raw: number;
  afterParse: number;
  stocks: number;
  funds: number;
  etfs: number;
  unknown: number;
  noPrice: number;
  noTicker: number;
  noBidAsk: number;
  sampleExcluded: UniverseSampleRow[];
  sampleIncluded: UniverseSampleRow[];
}

export function emptyUniverseStats(): UniverseFilterStats {
  return {
    raw: 0,
    afterParse: 0,
    stocks: 0,
    funds: 0,
    etfs: 0,
    unknown: 0,
    noPrice: 0,
    noTicker: 0,
    noBidAsk: 0,
    sampleExcluded: [],
    sampleIncluded: [],
  };
}
