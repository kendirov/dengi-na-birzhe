import { BEST_ASK, BEST_BID, SYMBOL } from "../data/mockMarket";
import type { ChartDrawing, ChartPoint, TapeScenarioMode } from "../types";

/** 5m candles — evening + overnight gap + morning session (CiScalp.png). */
export const CHART_POINT_COUNT = 69;
export const CHART_BOOK_TAIL = 8;
export const CHART_INTERVAL_MIN = 5;

/** Last price on reference chart (red tag ~102,07). */
export const CHART_LAST_PRICE = 102.07;

/** Bottom time axis labels — index into candle array. */
export const CHART_TIME_AXIS: ReadonlyArray<{ index: number; label: string }> = [
  { index: 0, label: "21:00" },
  { index: 6, label: "21:30" },
  { index: 12, label: "22:00" },
  { index: 18, label: "22:30" },
  { index: 24, label: "23:00" },
  { index: 29, label: "23:30" },
  { index: 32, label: "07:30" },
  { index: 38, label: "08:00" },
  { index: 44, label: "08:30" },
  { index: 50, label: "09:00" },
  { index: 56, label: "09:30" },
  { index: 62, label: "10:00" },
  { index: 68, label: "10:30" },
];

function roundPrice(p: number): number {
  return Math.round(p * 100) / 100;
}

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timestampForCandleIndex(i: number): number {
  const base = new Date();
  base.setHours(21, 0, 0, 0);
  if (i <= 29) {
    return base.getTime() + i * CHART_INTERVAL_MIN * 60_000;
  }
  if (i <= 31) {
    return base.getTime() + (29 + (i - 29)) * CHART_INTERVAL_MIN * 60_000;
  }
  const morning = new Date(base);
  morning.setHours(7, 30, 0, 0);
  return morning.getTime() + (i - 32) * CHART_INTERVAL_MIN * 60_000;
}

function timeLabelForIndex(i: number): string {
  if (i <= 29) {
    const totalMin = 21 * 60 + i * CHART_INTERVAL_MIN;
    return formatTime(Math.floor(totalMin / 60), totalMin % 60);
  }
  if (i <= 31) return i === 30 ? "23:35" : "23:40";
  const totalMin = 7 * 60 + 30 + (i - 32) * CHART_INTERVAL_MIN;
  return formatTime(Math.floor(totalMin / 60), totalMin % 60);
}

/** Reference close shape: rise → drop → range → 08:20 impulse → pullback → consolidation. */
function referenceCloseAt(i: number): number {
  if (i < 8) return roundPrice(101.52 + i * 0.092);
  if (i < 18) return roundPrice(102.26 - (i - 8) * 0.048);
  if (i < 30) return roundPrice(101.76 + Math.sin((i - 18) * 0.38) * 0.11);
  if (i < 32) return roundPrice(101.8 + (i - 30) * 0.004);
  const m = i - 32;
  if (m < 8) return roundPrice(101.84 + Math.sin(m * 0.45) * 0.07);
  if (m < 14) return roundPrice(101.9 + (m - 8) * 0.045);
  if (m < 24) return roundPrice(102.17 - (m - 14) * 0.028);
  if (i === CHART_POINT_COUNT - 1) return CHART_LAST_PRICE;
  return roundPrice(101.9 + (m - 24) * 0.028);
}

function volumeForIndex(i: number, boost: number): number {
  const base = 480 + Math.abs(Math.sin(i * 0.61 + 0.8)) * 1600;
  const impulse = i >= 40 && i <= 46 ? 2200 : 0;
  return Math.round((base + impulse) * boost);
}

function toOHLC(close: number, prevClose: number): Pick<ChartPoint, "open" | "high" | "low" | "price" | "up"> {
  const open = prevClose;
  const body = Math.max(0.012, Math.abs(close - open) * 0.55 + 0.018);
  const high = roundPrice(Math.max(open, close) + body * 0.45);
  const low = roundPrice(Math.min(open, close) - body * 0.45);
  return {
    open: roundPrice(open),
    high,
    low,
    price: close,
    up: close >= open,
  };
}

export function buildInitialChartPoints(): ChartPoint[] {
  const points: ChartPoint[] = [];
  let prev = referenceCloseAt(0) - 0.04;

  for (let i = 0; i < CHART_POINT_COUNT; i++) {
    const close = referenceCloseAt(i);
    const ohlc = toOHLC(close, i === 0 ? close - 0.03 : prev);
    prev = close;

    points.push({
      time: timeLabelForIndex(i),
      timestamp: timestampForCandleIndex(i),
      ...ohlc,
      volume: volumeForIndex(i, 1),
    });
  }

  points[CHART_POINT_COUNT - 1]!.price = CHART_LAST_PRICE;
  const last = points[CHART_POINT_COUNT - 1]!;
  if (last) {
    last.open = roundPrice(last.open);
    last.high = roundPrice(Math.max(last.high, CHART_LAST_PRICE));
    last.low = roundPrice(Math.min(last.low, CHART_LAST_PRICE));
    last.up = CHART_LAST_PRICE >= last.open;
  }
  return syncChartTail(points, CHART_LAST_PRICE, BEST_BID, BEST_ASK, "referenceSnapshot");
}

export function syncChartTail(
  points: ChartPoint[],
  currentPrice: number,
  bestBid: number,
  bestAsk: number,
  scenarioMode: TapeScenarioMode,
): ChartPoint[] {
  if (scenarioMode === "referenceSnapshot") {
    return points.map((p) => ({ ...p }));
  }

  const volBoost =
    scenarioMode === "active" || scenarioMode === "breakoutAttempt" ? 1.85 : 1;
  const simActive = scenarioMode === "active";
  const next = points.map((p) => ({ ...p }));
  const tailStart = CHART_POINT_COUNT - CHART_BOOK_TAIL;
  const pivot = next[tailStart - 1]?.price ?? currentPrice;
  const mid = roundPrice((bestBid + bestAsk) / 2);
  let prev = next[tailStart - 1]?.price ?? pivot;

  for (let i = tailStart; i < CHART_POINT_COUNT; i++) {
    const t = i - tailStart;
    const frac = (t + 1) / CHART_BOOK_TAIL;
    const isLast = i === CHART_POINT_COUNT - 1;
    const target = pivot + (currentPrice - pivot) * frac;
    const micro = Math.sin(t * 1.4 + mid * 12) * 0.003;
    const close = roundPrice(isLast ? currentPrice : target + micro);
    const ohlc = toOHLC(close, prev);
    prev = close;

    next[i] = {
      ...next[i]!,
      ...ohlc,
      volume: volumeForIndex(i, volBoost * (simActive && t >= 6 ? 1.35 : 1)),
    };
  }

  return next;
}

export function chartPriceExtents(points: ChartPoint[], pad = 0.035): {
  min: number;
  max: number;
} {
  const lows = points.map((p) => p.low ?? p.price);
  const highs = points.map((p) => p.high ?? p.price);
  const minRaw = Math.min(...lows);
  const maxRaw = Math.max(...highs);
  const span = Math.max(maxRaw - minRaw, 0.12);
  return {
    min: roundPrice(minRaw - span * pad),
    max: roundPrice(maxRaw + span * pad),
  };
}

export function maxChartVolume(points: ChartPoint[]): number {
  return Math.max(...points.map((p) => p.volume), 1);
}

export function chartLabel(): string {
  return `${SYMBOL}.${CHART_INTERVAL_MIN}m`;
}

export function chartDisplayPrice(points: ChartPoint[]): number {
  return points[points.length - 1]?.price ?? CHART_LAST_PRICE;
}

export function priceToY(
  price: number,
  min: number,
  max: number,
  top: number,
  height: number,
): number {
  const span = max - min || 0.01;
  return top + height - ((price - min) / span) * height;
}

export function yToPrice(
  y: number,
  min: number,
  max: number,
  top: number,
  height: number,
): number {
  const span = max - min || 0.01;
  return roundPrice(max - ((y - top) / height) * span);
}

export function indexToX(
  index: number,
  left: number,
  width: number,
  count = CHART_POINT_COUNT,
): number {
  if (count <= 1) return left;
  return left + (index / (count - 1)) * width;
}

export function xToIndex(
  x: number,
  left: number,
  width: number,
  count = CHART_POINT_COUNT,
): number {
  const ratio = (x - left) / width;
  return Math.max(0, Math.min(count - 1, Math.round(ratio * (count - 1))));
}

export function candleWidth(plotWidth: number, count = CHART_POINT_COUNT): number {
  return Math.max(3.5, (plotWidth / Math.max(count, 1)) * 0.68);
}

export function newDrawingId(): string {
  return `dr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function defaultDrawings(): ChartDrawing[] {
  return [];
}
