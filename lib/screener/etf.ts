/** Detect ETFs, БПИФ, ПИФ and similar fund instruments by name/ticker. */
export function isFundLikeInstrument(inst: {
  ticker: string;
  name: string;
}): boolean {
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
    "index",
    "индекс",
    "exchange-traded",
    "etf-like",
    "биржевой паев",
    "управляемый фонд",
  ];
  if (namePatterns.some((p) => name.includes(p))) return true;

  // Common MOEX ETF ticker patterns (FX*, SB*, etc. — broad heuristic)
  if (/^(FX|SB|AK|AM|RU|EQ|TD|AKMB|AKME)/.test(ticker) && name.includes("бирж")) {
    return true;
  }

  return false;
}
