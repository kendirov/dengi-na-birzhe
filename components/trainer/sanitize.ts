/** Безопасное число для UI / расчётов — без NaN и Infinity. */
export function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function clampNumber(value: number, min: number, max: number): number {
  const v = finiteOr(value, min);
  return Math.min(max, Math.max(min, v));
}

export function parseInputNumber(
  raw: string,
  min: number,
  max: number,
  fallback: number,
): number {
  if (raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return clampNumber(n, min, max);
}

/** Ширина progress bar: % от депозита, масштаб к maxPct на слайдере. */
export function depositBarPct(
  valueRub: number,
  depositRub: number,
  scaleMaxPct: number,
): number {
  if (depositRub <= 0 || scaleMaxPct <= 0) return 0;
  const pctOfDeposit = (finiteOr(valueRub, 0) / depositRub) * 100;
  return Math.min(100, (pctOfDeposit / scaleMaxPct) * 100);
}
