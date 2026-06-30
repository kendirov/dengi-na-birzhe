import {
  LADDER_BOTTOM,
  LADDER_TOP,
  PRICE_STEP,
} from "../data/mockMarket";
import type { ClusterCandle, ClusterLevel, TradeSide } from "../types";

export const CLUSTER_TIMES = [
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
] as const;

/** Absolute volume above which a cell may get a POC frame. */
export const POC_VOLUME_THRESHOLD = 5000;

/** Strong delta ratio → colored footprint text. */
const STRONG_DELTA_RATIO = 0.52;

type Spike = { price: number; buy?: number; sell?: number };

/**
 * Sparse asymmetric footprint — mostly empty ladder, spikes at key levels.
 * Reference anchors: 20,8K · 8,0K · 10,1K · 11,6K · 5,4K
 */
const CLUSTER_SPIKES: Record<number, Spike[]> = {
  0: [{ price: 101.95, sell: 240 }, { price: 101.88, buy: 380 }],
  1: [{ price: 101.82, sell: 520 }, { price: 101.71, buy: 290 }],
  2: [{ price: 101.78, buy: 640 }, { price: 101.65, buy: 180 }],
  3: [{ price: 101.82, buy: 6200 }],
  4: [{ price: 101.79, sell: 1100 }, { price: 101.76, buy: 420 }],
  5: [{ price: 101.78, buy: 8000 }],
  6: [{ price: 101.75, sell: 10100 }, { price: 101.72, buy: 890 }],
  7: [
    { price: 101.76, sell: 11600 },
    { price: 101.75, sell: 20800 },
    { price: 101.73, buy: 1400 },
  ],
  8: [{ price: 101.73, buy: 8000 }, { price: 101.74, sell: 760 }],
  9: [
    { price: 101.75, sell: 2100 },
    { price: 101.74, buy: 5400 },
    { price: 101.73, buy: 3200 },
    { price: 101.72, buy: 680 },
  ],
};

export type FootprintFillTier = "none" | "weak" | "medium" | "large";

export type FootprintTextTone = "muted" | "neutral" | "buy" | "sell";

export interface CellFootprintVisual {
  visible: boolean;
  fillTier: FootprintFillTier;
  fillWidthPct: number;
  fillSide: "buy" | "sell" | "neutral";
  textTone: FootprintTextTone;
  isPoc: boolean;
}

function ladderPrices(): number[] {
  const prices: number[] = [];
  for (let p = LADDER_TOP; p >= LADDER_BOTTOM - PRICE_STEP / 2; p -= PRICE_STEP) {
    prices.push(Math.round(p * 100) / 100);
  }
  return prices;
}

function emptyLevel(price: number): ClusterLevel {
  return {
    price,
    buyVol: 0,
    sellVol: 0,
    totalVol: 0,
    delta: 0,
    intensity: 0,
    isPoc: false,
  };
}

function finalizeLevel(
  price: number,
  buyVol: number,
  sellVol: number,
  maxGlobal: number,
): ClusterLevel {
  const totalVol = buyVol + sellVol;
  const delta = buyVol - sellVol;
  const intensity =
    maxGlobal > 0 ? Math.min(1, totalVol / maxGlobal) : totalVol > 0 ? 0.35 : 0;
  return {
    price,
    buyVol,
    sellVol,
    totalVol,
    delta,
    intensity,
    isPoc: totalVol >= POC_VOLUME_THRESHOLD,
  };
}

function markColumnPocs(levels: ClusterLevel[]): ClusterLevel[] {
  const maxVol = Math.max(0, ...levels.map((l) => l.totalVol));
  if (maxVol < POC_VOLUME_THRESHOLD) return levels;
  return levels.map((lv) => ({
    ...lv,
    isPoc: lv.totalVol > 0 && lv.totalVol === maxVol,
  }));
}

function buildColumnLevels(
  colIdx: number,
  prices: number[],
  maxGlobal: number,
): ClusterLevel[] {
  const spikes = CLUSTER_SPIKES[colIdx] ?? [];
  const spikeMap = new Map(spikes.map((s) => [s.price, s]));

  const levels = prices.map((price) => {
    const spike = spikeMap.get(price);
    if (spike) {
      return finalizeLevel(price, spike.buy ?? 0, spike.sell ?? 0, maxGlobal);
    }

    return emptyLevel(price);
  });

  return markColumnPocs(levels);
}

function summarizeCandle(time: string, levels: ClusterLevel[]): ClusterCandle {
  let totalVol = 0;
  let delta = 0;
  let maxVol = 0;
  for (const lv of levels) {
    totalVol += lv.totalVol;
    delta += lv.delta;
    maxVol = Math.max(maxVol, lv.totalVol);
  }
  return { time, levels, totalVol, delta, maxVol };
}

export function buildClusterCandles(): ClusterCandle[] {
  const prices = ladderPrices();

  let maxGlobal = 1;
  for (const spikes of Object.values(CLUSTER_SPIKES)) {
    for (const s of spikes) {
      maxGlobal = Math.max(maxGlobal, (s.buy ?? 0) + (s.sell ?? 0));
    }
  }
  maxGlobal = Math.max(maxGlobal, 5400);

  return CLUSTER_TIMES.map((time, colIdx) => {
    const levels = buildColumnLevels(colIdx, prices, maxGlobal).map((lv) =>
      lv.totalVol > 0
        ? finalizeLevel(lv.price, lv.buyVol, lv.sellVol, maxGlobal)
        : lv,
    );
    return summarizeCandle(time, markColumnPocs(levels));
  });
}

export function getLevelForPrice(
  candles: ClusterCandle[],
  candleIdx: number,
  price: number,
): ClusterLevel | undefined {
  return candles[candleIdx]?.levels.find((l) => l.price === price);
}

export function addVolumeToClusterCandle(
  candles: ClusterCandle[],
  price: number,
  opts: {
    buyVol?: number;
    sellVol?: number;
    deltaBuy?: number;
    deltaSell?: number;
    candleIndex?: number;
  },
): ClusterCandle[] {
  if (candles.length === 0) return candles;

  const candleIdx = opts.candleIndex ?? candles.length - 1;
  const candle = candles[candleIdx];
  if (!candle) return candles;

  let maxGlobal = 1;
  for (const c of candles) {
    for (const lv of c.levels) {
      maxGlobal = Math.max(maxGlobal, lv.totalVol);
    }
  }

  const nextLevels = candle.levels.map((lv) => {
    if (lv.price !== price) return lv;
    const buyVol = opts.buyVol ?? lv.buyVol + (opts.deltaBuy ?? 0);
    const sellVol = opts.sellVol ?? lv.sellVol + (opts.deltaSell ?? 0);
    return finalizeLevel(price, Math.max(0, buyVol), Math.max(0, sellVol), maxGlobal);
  });

  for (const lv of nextLevels) {
    maxGlobal = Math.max(maxGlobal, lv.totalVol);
  }
  const finalized = nextLevels.map((lv) =>
    lv.totalVol > 0 ? finalizeLevel(lv.price, lv.buyVol, lv.sellVol, maxGlobal) : lv,
  );

  const updated = summarizeCandle(candle.time, markColumnPocs(finalized));
  return candles.map((c, i) => (i === candleIdx ? updated : c));
}

export function updateLastCandleFromTrade(
  candles: ClusterCandle[],
  price: number,
  qty: number,
  side: TradeSide,
): ClusterCandle[] {
  if (candles.length === 0) return candles;

  const lastIdx = candles.length - 1;
  const last = candles[lastIdx]!;

  let maxGlobal = 1;
  for (const c of candles) {
    for (const lv of c.levels) {
      maxGlobal = Math.max(maxGlobal, lv.totalVol);
    }
  }

  const nextLevels = last.levels.map((lv) => {
    if (lv.price !== price) return lv;
    const buyVol = side === "buy" ? lv.buyVol + qty : lv.buyVol;
    const sellVol = side === "sell" ? lv.sellVol + qty : lv.sellVol;
    return finalizeLevel(price, buyVol, sellVol, maxGlobal);
  });

  for (const lv of nextLevels) {
    maxGlobal = Math.max(maxGlobal, lv.totalVol);
  }
  const finalized = nextLevels.map((lv) =>
    lv.totalVol > 0 ? finalizeLevel(lv.price, lv.buyVol, lv.sellVol, maxGlobal) : lv,
  );

  const updated = summarizeCandle(last.time, markColumnPocs(finalized));
  return candles.map((c, i) => (i === lastIdx ? updated : c));
}

/**
 * CScalp footprint visual — local horizontal fill behind number, not full-cell heatmap.
 * Intensity = f(volume / columnMaxVol) with absolute floor tiers.
 */
export function getCellFootprint(
  level: ClusterLevel,
  columnMaxVol: number,
): CellFootprintVisual {
  if (level.totalVol <= 0) {
    return {
      visible: false,
      fillTier: "none",
      fillWidthPct: 0,
      fillSide: "neutral",
      textTone: "muted",
      isPoc: false,
    };
  }

  const colMax = Math.max(columnMaxVol, 1);
  const rel = level.totalVol / colMax;
  const deltaRatio =
    level.totalVol > 0 ? Math.abs(level.delta) / level.totalVol : 0;
  const buyDominant = level.buyVol >= level.sellVol;

  let fillTier: FootprintFillTier = "none";
  if (rel >= 0.45 || level.totalVol >= 5000) fillTier = "large";
  else if (rel >= 0.18 || level.totalVol >= 900) fillTier = "medium";
  else if (level.totalVol >= 70) fillTier = "weak";

  const fillWidthPct = Math.min(
    100,
    Math.max(fillTier === "weak" ? 18 : 28, Math.round(Math.sqrt(rel) * 92)),
  );

  const fillSide: "buy" | "sell" | "neutral" =
    deltaRatio < 0.28 ? "neutral" : buyDominant ? "buy" : "sell";

  let textTone: FootprintTextTone = "neutral";
  if (level.totalVol < 120) textTone = "muted";
  else if (deltaRatio >= STRONG_DELTA_RATIO) textTone = buyDominant ? "buy" : "sell";
  else if (level.totalVol >= 800) textTone = "neutral";
  else textTone = "muted";

  return {
    visible: true,
    fillTier,
    fillWidthPct,
    fillSide,
    textTone,
    isPoc: Boolean(level.isPoc),
  };
}

export function fmtClusterDelta(n: number): string {
  const sign = n > 0 ? "+" : "";
  if (Math.abs(n) >= 1000) {
    return `${sign}${(n / 1000).toFixed(1).replace(".", ",")}K`;
  }
  return `${sign}${Math.round(n)}`;
}
