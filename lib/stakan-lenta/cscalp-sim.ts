import type {
  ClusterColumn,
  OrderBookLevel,
  TapeBubbleSeed,
} from "./cscalp-mock-data";
import {
  BEST_ASK,
  BEST_BID,
  PRICE_STEP,
  buildOrderBook,
} from "./cscalp-mock-data";

export { PRICE_STEP };

export interface LiveTapeBubble extends TapeBubbleSeed {
  createdAt: number;
  opacity: number;
}

export function fmtPrice(p: number): string {
  return p.toFixed(2).replace(".", ",");
}

export function fmtQty(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    const s = k.toFixed(1).replace(".", ",");
    return s.endsWith(",0") ? `${Math.round(k)}K` : `${s}K`;
  }
  return String(Math.round(n));
}

export function fmtClusterVol(n: number): string {
  if (n >= 1000) return fmtQty(n);
  if (n >= 100) return String(Math.round(n));
  if (n >= 10) return n.toFixed(1).replace(".", ",");
  return n > 0 ? String(Math.round(n)) : "";
}

export function getBestAsk(levels: OrderBookLevel[]): OrderBookLevel | null {
  return levels.find((l) => l.askQty > 0) ?? null;
}

export function getBestBid(levels: OrderBookLevel[]): OrderBookLevel | null {
  return [...levels].reverse().find((l) => l.bidQty > 0) ?? null;
}

export function spreadTicks(
  bid: OrderBookLevel | null,
  ask: OrderBookLevel | null,
): number | null {
  if (!bid || !ask) return null;
  return Math.round((ask.price - bid.price) / PRICE_STEP);
}

export function maxBookQty(levels: OrderBookLevel[]): number {
  return Math.max(
    ...levels.flatMap((l) => [l.askQty, l.bidQty, l.densityQty]),
    1,
  );
}

export function randomTapeBubble(
  levels: OrderBookLevel[],
  laneCenter = 55,
): LiveTapeBubble | null {
  const ask = getBestAsk(levels);
  const bid = getBestBid(levels);
  if (!ask || !bid) return null;

  const side: "buy" | "sell" = Math.random() > 0.48 ? "buy" : "sell";
  const price = side === "buy" ? ask.price : bid.price;
  const pool =
    side === "buy"
      ? [1, 6, 20, 50, 100, 129, 457, 800, 1400, 2500]
      : [1, 6, 20, 50, 80, 100, 240, 500];
  const qty = pool[Math.floor(Math.random() * pool.length)] ?? 50;

  return {
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    price,
    qty,
    side,
    xPercent: laneCenter + (Math.random() - 0.5) * 28,
    createdAt: Date.now(),
    opacity: 1,
  };
}

export function applyMarketOrder(
  levels: OrderBookLevel[],
  side: "buy" | "sell",
  qty: number,
): { levels: OrderBookLevel[]; price: number; filled: number } {
  const next = levels.map((l) => ({ ...l }));
  let remaining = qty;
  let hitPrice = side === "buy" ? BEST_ASK : BEST_BID;

  if (side === "buy") {
    const sorted = [...next].sort((a, b) => a.price - b.price);
    for (const lv of sorted) {
      if (remaining <= 0 || lv.askQty <= 0) continue;
      const fill = Math.min(remaining, lv.askQty);
      lv.askQty -= fill;
      remaining -= fill;
      hitPrice = lv.price;
    }
  } else {
    for (const lv of next) {
      if (remaining <= 0 || lv.bidQty <= 0) continue;
      const fill = Math.min(remaining, lv.bidQty);
      lv.bidQty -= fill;
      remaining -= fill;
      hitPrice = lv.price;
    }
  }

  return {
    levels: next.filter((l) => l.askQty > 0 || l.bidQty > 0),
    price: hitPrice,
    filled: qty - remaining,
  };
}

export function updateClustersFromTrade(
  columns: ClusterColumn[],
  price: number,
  qty: number,
  side: "buy" | "sell",
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

export function seedLiveBubbles(seeds: TapeBubbleSeed[]): LiveTapeBubble[] {
  const now = Date.now();
  return seeds.map((s, i) => ({
    ...s,
    createdAt: now - i * 400,
    opacity: 1,
  }));
}

export function refreshBook(): OrderBookLevel[] {
  return buildOrderBook();
}
