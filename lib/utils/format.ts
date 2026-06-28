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
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: value < 10 ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
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
