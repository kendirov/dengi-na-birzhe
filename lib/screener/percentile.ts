export function percentileRank(value: number, values: number[]): number {
  if (values.length === 0) return 0;
  const below = values.filter((v) => v < value).length;
  return Math.round((below / values.length) * 100);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function datasetStats(values: number[]) {
  return {
    median: median(values),
    min: Math.min(...values),
    max: Math.max(...values),
    values,
  };
}
