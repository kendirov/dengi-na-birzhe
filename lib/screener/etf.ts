import type { InstrumentClass } from "@/lib/data/types";

/** Detect ETFs, БПИФ, ПИФ by classification or name/ticker heuristics. */
export function isFundLikeInstrument(inst: {
  ticker: string;
  name: string;
  instrumentClass?: InstrumentClass;
}): boolean {
  if (inst.instrumentClass) {
    return inst.instrumentClass === "fund" || inst.instrumentClass === "etf";
  }
  return isEtfOrFund(inst);
}

export function isEtfOrFund(inst: { ticker: string; name: string }): boolean {
  const name = inst.name.toLowerCase();
  const ticker = inst.ticker.toUpperCase();

  const namePatterns = [
    "etf",
    "бпиф",
    "пиф",
    "фонд",
    "inav",
    "биржевой фонд",
    "биржевой паев",
    "управляемый фонд",
  ];
  if (namePatterns.some((p) => name.includes(p))) return true;

  if (/^RU000[A-Z0-9]{7,}$/.test(ticker)) return true;

  if (/^(FX|SB|AK|AM|RU|EQ|TD|AKMB|AKME)/.test(ticker) && name.includes("бирж")) {
    return true;
  }

  return false;
}
