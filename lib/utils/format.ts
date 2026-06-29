/** SSR-safe: avoids Intl locale differences between Node and browser. */
function formatIntegerWithSpaces(value: number): string {
  const sign = value < 0 ? "-" : "";
  const digits = Math.abs(Math.trunc(value)).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatRub(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)} млрд ₽`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} млн ₽`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)} тыс ₽`;
    }
  }
  if (value < 10) {
    return `${value.toFixed(2).replace(".", ",")} ₽`;
  }
  return `${formatIntegerWithSpaces(Math.round(value))} ₽`;
}

export function formatNumber(value: number): string {
  return formatIntegerWithSpaces(value);
}

export function formatPct(value: number | null, signed = true): string {
  if (value === null) return "—";
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatNullable(value: number | null, formatter: (v: number) => string): string {
  if (value === null) return "—";
  return formatter(value);
}

export function formatNullableRub(value: number | null, compact = false): string {
  if (value === null) return "—";
  return formatRub(value, compact);
}

export function formatNullableNumber(value: number | null): string {
  if (value === null) return "—";
  return formatNumber(value);
}

export function formatPrice(value: number): string {
  if (value >= 1000) return value.toFixed(1);
  if (value >= 100) return value.toFixed(2);
  return value.toFixed(2);
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Commission rub in table — 2 decimals; min 0,01 when commission > 0. */
export function formatCommissionRubDisplay(value: number): string {
  if (value <= 0 || !Number.isFinite(value)) return "0,00";
  const rounded = Math.round(value * 100) / 100;
  if (value > 0 && rounded === 0) return "0,01";
  const display = rounded > 0 && rounded < 0.01 ? 0.01 : rounded;
  return display.toFixed(2).replace(".", ",");
}

/** @deprecated use formatCommissionRubDisplay in commission cells */
export function formatCommissionRubValue(value: number): string {
  return formatCommissionRubDisplay(value);
}

/** Single commission point — integer display, null → em dash */
export function formatCommissionPointValue(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return String(Math.trunc(value));
}

/** Market (limit) commission points — e.g. "3 (1)" */
export function formatCommissionPointsPair(
  market: number | null,
  limit: number | null,
): string {
  if (market === null && limit === null) return "—";
  const m = formatCommissionPointValue(market);
  const l = formatCommissionPointValue(limit);
  if (market === null) return `— (${l})`;
  if (limit === null) return m;
  return `${m} (${l})`;
}

/** Market (limit) commission rub — e.g. "0,25 (0,03)" */
export function formatCommissionRubPair(
  marketRub: number,
  limitRub: number,
): string {
  return `${formatCommissionRubValue(marketRub)} (${formatCommissionRubValue(limitRub)})`;
}

/** @deprecated use formatCommissionPointValue for display points */
export function formatCommissionPoints(value: number | null): string {
  return formatCommissionPointValue(value);
}
