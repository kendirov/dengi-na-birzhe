/**
 * Deterministic mock market data — GAZP sandbox ladder.
 * Price range 102.18 → 101.39, step 0.01.
 */

import type {
  ChartCandle,
  ClusterCell,
  ClusterColumn,
  InstrumentMeta,
  OrderBookLevel,
  PriceLevel,
  TapePrint,
  TradeSide,
  UserOrder,
} from "../types";

export type { TapePrint };

export const SYMBOL = "GAZP";
export const PRICE_STEP = 0.01;
export const LADDER_TOP = 102.41;
export const LADDER_BOTTOM = 101.39;
export const BEST_ASK = 102.08;
export const BEST_BID = 102.07;
export const CURRENT_PRICE = 102.07;

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

const ASK_SIZES: Record<number, number> = {
  102.41: 31,
  102.16: 88,
  102.15: 156,
  102.14: 2,
  102.09: 578,
  102.08: 7000,
  101.95: 420,
  101.88: 245,
  101.82: 960,
  101.78: 134,
};

const BID_SIZES: Record<number, number> = {
  102.07: 456,
  102.06: 178,
  102.05: 890,
  102.04: 1200,
  102.03: 578,
  102.0: 92,
  101.97: 240,
  101.94: 2,
  101.91: 67,
  101.75: 7000,
  101.73: 456,
  101.71: 178,
  101.68: 31,
  101.65: 890,
  101.62: 1200,
  101.58: 578,
  101.52: 92,
  101.48: 240,
  101.45: 2,
  101.39: 67,
};

export const INSTRUMENT_META: InstrumentMeta = {
  symbol: SYMBOL,
  exchange: "MOEX",
  tickCount: 192_441,
  maxClusterVol: 7000,
  clusterDeltaBuy: "3,2K",
  clusterDeltaSell: "11,4K",
  latencyMs: 11,
  priceStepMult: 1,
};

function roundPrice(p: number): number {
  return Math.round(p / PRICE_STEP) * PRICE_STEP;
}

function defaultAskSize(price: number): number {
  if (price in ASK_SIZES) return ASK_SIZES[price]!;
  const dist = price - BEST_ASK;
  return Math.max(12, Math.floor(40 + dist * 90));
}

function defaultBidSize(price: number): number {
  if (price in BID_SIZES) return BID_SIZES[price]!;
  const dist = BEST_BID - price;
  return Math.max(8, Math.floor(35 + dist * 75));
}

export function maxLadderVolume(rows: PriceLevel[]): number {
  return Math.max(...rows.flatMap((r) => [r.askSize, r.bidSize]), 1);
}

/** GAZP ladder 102.18 → 101.39 with ask above spread, bid below. */
export function buildMarketLadder(): PriceLevel[] {
  const rows: PriceLevel[] = [];

  for (let p = LADDER_TOP; p >= LADDER_BOTTOM - PRICE_STEP / 2; p -= PRICE_STEP) {
    const price = roundPrice(p);
    let askSize = 0;
    let bidSize = 0;

    if (price >= BEST_ASK) askSize = defaultAskSize(price);
    if (price <= BEST_BID) bidSize = defaultBidSize(price);

    rows.push({
      price,
      askSize,
      bidSize,
      askHeat: 0,
      bidHeat: 0,
      isBestAsk: false,
      isBestBid: false,
      isCurrentPrice: price === CURRENT_PRICE,
    });
  }

  const maxVol = maxLadderVolume(rows);
  const askPrices = rows.filter((r) => r.askSize > 0).map((r) => r.price);
  const bidPrices = rows.filter((r) => r.bidSize > 0).map((r) => r.price);
  const bestAsk = askPrices.length ? Math.min(...askPrices) : -1;
  const bestBid = bidPrices.length ? Math.max(...bidPrices) : -1;

  return rows.map((row) => ({
    ...row,
    askHeat: row.askSize > 0 ? (row.askSize / maxVol) * 100 : 0,
    bidHeat: row.bidSize > 0 ? (row.bidSize / maxVol) * 100 : 0,
    isBestAsk: row.askSize > 0 && row.price === bestAsk,
    isBestBid: row.bidSize > 0 && row.price === bestBid,
    isCurrentPrice: row.price === CURRENT_PRICE,
  }));
}

/** Пересчёт heat / best bid·ask после правок объёмов в сценариях. */
export function recomputePriceLevels(
  market: PriceLevel[],
  currentPrice: number,
): PriceLevel[] {
  const maxVol = maxLadderVolume(market);
  const askPrices = market.filter((r) => r.askSize > 0).map((r) => r.price);
  const bidPrices = market.filter((r) => r.bidSize > 0).map((r) => r.price);
  const bestAsk = askPrices.length ? Math.min(...askPrices) : -1;
  const bestBid = bidPrices.length ? Math.max(...bidPrices) : -1;

  return market.map((row) => ({
    ...row,
    askHeat: row.askSize > 0 ? (row.askSize / maxVol) * 100 : 0,
    bidHeat: row.bidSize > 0 ? (row.bidSize / maxVol) * 100 : 0,
    isBestAsk: row.askSize > 0 && row.price === bestAsk,
    isBestBid: row.bidSize > 0 && row.price === bestBid,
    isCurrentPrice: row.price === currentPrice,
  }));
}

export function enrichPriceLevels(
  market: PriceLevel[],
  userOrders: UserOrder[],
  currentPrice: number,
): PriceLevel[] {
  const byPrice = new Map<number, UserOrder>();
  for (const o of userOrders) {
    if (o.status !== "active") continue;
    byPrice.set(o.price, o);
  }

  return market.map((row) => ({
    ...row,
    isCurrentPrice: row.price === currentPrice,
    userOrder: byPrice.get(row.price),
  }));
}

/** Legacy adapter for cluster matrix seeding. */
export function priceLevelsToLegacy(levels: PriceLevel[]): OrderBookLevel[] {
  return levels.map((l) => ({
    price: l.price,
    askQty: l.askSize,
    bidQty: l.bidSize,
    densityQty: l.askSize >= 1000 || l.bidSize >= 1000 ? Math.max(l.askSize, l.bidSize) : 0,
    densitySide:
      l.askSize >= 1000 ? "ask" : l.bidSize >= 1000 ? "bid" : undefined,
  }));
}

export function buildOrderBook(): OrderBookLevel[] {
  return priceLevelsToLegacy(buildMarketLadder());
}

function clusterSeed(price: number, colIdx: number): ClusterCell {
  const seed = Math.abs(Math.sin(price * 11.3 + colIdx * 1.9));
  const buy = Math.floor(seed * 380 + (price <= BEST_BID ? 30 : 0));
  const sell = Math.floor(seed * 340 + (price >= BEST_ASK ? 25 : 0));
  const cell: ClusterCell = { buy: buy > 0 ? buy : 0, sell: sell > 0 ? sell : 0 };

  if (price === 101.75 && colIdx === 7) {
    cell.sell = 7000;
    cell.poc = "red";
  }
  if (price === 101.73 && colIdx === 8) {
    cell.buy = 2400;
    cell.poc = "white";
  }
  if (price === 101.65 && colIdx === 5) {
    cell.buy = 1200;
    cell.poc = "green";
  }

  return cell;
}

export function buildClusterMatrix(levels: OrderBookLevel[] | PriceLevel[]): ClusterColumn[] {
  const legacy = "askSize" in (levels[0] ?? {})
    ? priceLevelsToLegacy(levels as PriceLevel[])
    : (levels as OrderBookLevel[]);

  return CLUSTER_TIMES.map((time, colIdx) => {
    const cells = new Map<number, ClusterCell>();
    let totalBuy = 0;
    let totalSell = 0;

    for (const lv of legacy) {
      const cell = clusterSeed(lv.price, colIdx);
      if (cell.buy > 0 || cell.sell > 0) {
        cells.set(lv.price, cell);
        totalBuy += cell.buy;
        totalSell += cell.sell;
      }
    }

    return { time, cells, totalBuy, totalSell };
  });
}

/** CiScalp.png reference trail — qty and side from screenshot audit. */
export const REFERENCE_TAPE_SNAPSHOT: Array<{
  side: TradeSide;
  price: number;
  qty: number;
  laneX: number;
  isLarge?: boolean;
  opacity?: number;
}> = [
  { side: "sell", price: 101.67, qty: 250, laneX: 20, opacity: 0.72 },
  { side: "sell", price: 101.68, qty: 19, laneX: 26, opacity: 0.76 },
  { side: "sell", price: 101.69, qty: 133, laneX: 32, opacity: 0.78 },
  { side: "sell", price: 101.7, qty: 80, laneX: 38, opacity: 0.8 },
  { side: "sell", price: 101.71, qty: 400, laneX: 44, isLarge: true, opacity: 0.84 },
  { side: "sell", price: 101.72, qty: 173, laneX: 50, opacity: 0.86 },
  { side: "sell", price: 101.73, qty: 198, laneX: 56, opacity: 0.88 },
  { side: "buy", price: 101.74, qty: 79, laneX: 62, opacity: 0.9 },
  { side: "buy", price: 101.74, qty: 27, laneX: 66, opacity: 0.91 },
  { side: "buy", price: 101.74, qty: 1000, laneX: 70, isLarge: true, opacity: 0.93 },
  { side: "buy", price: 101.75, qty: 51, laneX: 76, opacity: 0.95 },
  { side: "buy", price: 101.75, qty: 110, laneX: 82, opacity: 0.97 },
  { side: "buy", price: 101.75, qty: 1000, laneX: 90, isLarge: true, opacity: 1 },
];

/** @deprecated use REFERENCE_TAPE_SNAPSHOT */
export const INITIAL_TAPE_PRINT_DATA = REFERENCE_TAPE_SNAPSHOT.map(
  ({ side, price, qty, isLarge }) => ({ side, price, qty, isLarge }),
);

export function buildMiniChart(): ChartCandle[] {
  return [
    { time: "09:30", open: 101.62, high: 101.71, low: 101.58, close: 101.68, volume: 5100 },
    { time: "09:45", open: 101.68, high: 101.76, low: 101.65, close: 101.74, volume: 7200 },
    { time: "10:00", open: 101.74, high: 101.78, low: 101.7, close: 101.73, volume: 6400 },
  ];
}

export function fmtPrice(p: number): string {
  return p.toFixed(2).replace(".", ",");
}

export function fmtQty(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(".", ",")}K`;
  }
  return String(Math.round(n));
}

export function fmtClusterVol(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(".", ",")}K`;
  }
  if (n >= 100) return String(Math.round(n));
  if (n >= 10) return n.toFixed(1).replace(".", ",");
  return n > 0 ? String(Math.round(n)) : "";
}

export function getBestAskFromLevels(levels: PriceLevel[]) {
  return levels.find((l) => l.isBestAsk) ?? levels.find((l) => l.askSize > 0) ?? null;
}

export function getBestBidFromLevels(levels: PriceLevel[]) {
  return levels.find((l) => l.isBestBid) ?? [...levels].reverse().find((l) => l.bidSize > 0) ?? null;
}

export function getBestAsk(levels: OrderBookLevel[]) {
  return levels.find((l) => l.askQty > 0) ?? null;
}

export function getBestBid(levels: OrderBookLevel[]) {
  return [...levels].reverse().find((l) => l.bidQty > 0) ?? null;
}

export function maxBookQty(levels: OrderBookLevel[] | PriceLevel[]): number {
  if (levels.length === 0) return 1;
  if ("askSize" in levels[0]!) {
    return maxLadderVolume(levels as PriceLevel[]);
  }
  return Math.max(
    ...(levels as OrderBookLevel[]).flatMap((l) => [l.askQty, l.bidQty, l.densityQty]),
    1,
  );
}

export function randomTapePrint(
  market: PriceLevel[],
): Omit<TapePrint, "laneX" | "opacity"> | null {
  const ask = getBestAskFromLevels(market);
  const bid = getBestBidFromLevels(market);
  if (!ask || !bid) return null;

  const side: TradeSide = Math.random() > 0.5 ? "buy" : "sell";
  const price = side === "buy" ? ask.price : bid.price;
  const pool = side === "buy" ? [2, 31, 50, 100, 141, 578] : [2, 31, 50, 100, 456];
  const qty = pool[Math.floor(Math.random() * pool.length)] ?? 50;
  const now = Date.now();

  return {
    id: `t-${now}-${Math.random().toString(36).slice(2, 6)}`,
    price,
    qty,
    side,
    timestamp: now,
    intensity: Math.min(1, 0.25 + Math.sqrt(qty) / 90),
    isLarge: qty >= 200,
  };
}

export function applyMarketOrderToLadder(
  market: PriceLevel[],
  side: TradeSide,
  qty: number,
): { market: PriceLevel[]; price: number; filled: number } {
  const next = market.map((l) => ({ ...l }));
  let remaining = qty;
  let hitPrice = side === "buy" ? BEST_ASK : BEST_BID;

  if (side === "buy") {
    for (const row of [...next].sort((a, b) => a.price - b.price)) {
      if (remaining <= 0 || row.askSize <= 0) continue;
      const fill = Math.min(remaining, row.askSize);
      row.askSize -= fill;
      remaining -= fill;
      hitPrice = row.price;
    }
  } else {
    for (const row of [...next].sort((a, b) => b.price - a.price)) {
      if (remaining <= 0 || row.bidSize <= 0) continue;
      const fill = Math.min(remaining, row.bidSize);
      row.bidSize -= fill;
      remaining -= fill;
      hitPrice = row.price;
    }
  }

  const maxVol = maxLadderVolume(next);
  const askPrices = next.filter((r) => r.askSize > 0).map((r) => r.price);
  const bidPrices = next.filter((r) => r.bidSize > 0).map((r) => r.price);
  const bestAsk = askPrices.length ? Math.min(...askPrices) : -1;
  const bestBid = bidPrices.length ? Math.max(...bidPrices) : -1;

  const recomputed = next.map((row) => ({
    ...row,
    askHeat: row.askSize > 0 ? (row.askSize / maxVol) * 100 : 0,
    bidHeat: row.bidSize > 0 ? (row.bidSize / maxVol) * 100 : 0,
    isBestAsk: row.askSize > 0 && row.price === bestAsk,
    isBestBid: row.bidSize > 0 && row.price === bestBid,
  }));

  return { market: recomputed, price: hitPrice, filled: qty - remaining };
}

export function applyMarketOrder(
  levels: OrderBookLevel[],
  side: TradeSide,
  qty: number,
): { levels: OrderBookLevel[]; price: number; filled: number } {
  const ladder = buildMarketLadder();
  const { market, price, filled } = applyMarketOrderToLadder(ladder, side, qty);
  return { levels: priceLevelsToLegacy(market), price, filled };
}

export function updateClustersFromTrade(
  columns: ClusterColumn[],
  price: number,
  qty: number,
  side: TradeSide,
): ClusterColumn[] {
  const lastIdx = columns.length - 1;
  const col = columns[lastIdx];
  if (!col) return columns;

  const existing = col.cells.get(price) ?? { buy: 0, sell: 0 };
  const nextCell = {
    ...existing,
    buy: side === "buy" ? existing.buy + qty : existing.buy,
    sell: side === "sell" ? existing.sell + qty : existing.sell,
  };
  const newCells = new Map(col.cells);
  newCells.set(price, nextCell);

  return columns.map((c, i) =>
    i === lastIdx
      ? {
          ...c,
          cells: newCells,
          totalBuy: c.totalBuy + (side === "buy" ? qty : 0),
          totalSell: c.totalSell + (side === "sell" ? qty : 0),
        }
      : c,
  );
}

export const VOLUME_PRESETS = [50, 100, 200, 400, 800] as const;

export function volumePresetByIndex(index: number): (typeof VOLUME_PRESETS)[number] {
  return VOLUME_PRESETS[Math.max(0, Math.min(index, VOLUME_PRESETS.length - 1))] ?? 100;
}
