export const PRICE_STEP = 0.01;
export const SYMBOL = "GAZP";
export const MID_PRICE = 101.99;
export const BEST_ASK = 102.0;
export const BEST_BID = 101.99;

export interface OrderBookLevel {
  price: number;
  askQty: number;
  bidQty: number;
  densityQty: number;
  densitySide?: "ask" | "bid";
}

export interface ClusterCell {
  buy: number;
  sell: number;
  poc?: "white" | "red" | "green";
}

export interface ClusterColumn {
  time: string;
  cells: Map<number, ClusterCell>;
  totalBuy: number;
  totalSell: number;
}

export interface TapeBubbleSeed {
  id: string;
  price: number;
  qty: number;
  side: "buy" | "sell";
  xPercent: number;
}

export const CLUSTER_TIMES = [
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
] as const;

/** Плотности как на скрине GAZP. */
export const DENSITY_LEVELS: Record<number, number> = {
  102.2: 6400,
  102.19: 1500,
  102.0: 1600,
  101.9: 2100,
  101.82: 1700,
  101.8: 1400,
  101.78: 1700,
  101.81: 1400,
};

function roundPrice(p: number): number {
  return Math.round(p / PRICE_STEP) * PRICE_STEP;
}

function baseAskQty(price: number): number {
  if (price in DENSITY_LEVELS && price >= BEST_ASK) {
    return DENSITY_LEVELS[price] ?? 120;
  }
  const dist = price - BEST_ASK;
  return Math.max(40, Math.floor(80 + dist * 180));
}

function baseBidQty(price: number): number {
  if (price in DENSITY_LEVELS && price <= BEST_BID) {
    return DENSITY_LEVELS[price] ?? 90;
  }
  const dist = BEST_BID - price;
  return Math.max(35, Math.floor(70 + dist * 160));
}

/** Стакан: ask 102.39 → 102.00, bid 101.99 → 101.61. */
export function buildOrderBook(): OrderBookLevel[] {
  const levels: OrderBookLevel[] = [];

  for (let p = 102.39; p >= 102.0 - PRICE_STEP / 2; p -= PRICE_STEP) {
    const price = roundPrice(p);
    const densityQty = DENSITY_LEVELS[price] ?? 0;
    levels.push({
      price,
      askQty: densityQty > 0 && price >= BEST_ASK ? densityQty : baseAskQty(price),
      bidQty: 0,
      densityQty,
      densitySide: densityQty > 0 ? "ask" : undefined,
    });
  }

  for (let p = BEST_BID; p >= 101.61 - PRICE_STEP / 2; p -= PRICE_STEP) {
    const price = roundPrice(p);
    const densityQty = DENSITY_LEVELS[price] ?? 0;
    const existing = levels.find((l) => l.price === price);
    if (existing) {
      existing.bidQty = densityQty > 0 ? densityQty : baseBidQty(price);
      if (densityQty > 0) {
        existing.densityQty = densityQty;
        existing.densitySide = "bid";
      }
    } else {
      levels.push({
        price,
        askQty: 0,
        bidQty: densityQty > 0 ? densityQty : baseBidQty(price),
        densityQty,
        densitySide: densityQty > 0 ? "bid" : undefined,
      });
    }
  }

  return levels.sort((a, b) => b.price - a.price);
}

function clusterSeed(price: number, colIdx: number): ClusterCell {
  const seed = Math.abs(Math.sin(price * 13.7 + colIdx * 2.3));
  const buy = Math.floor(seed * 480 + (price <= BEST_BID ? 40 : 0));
  const sell = Math.floor(seed * 420 + (price >= BEST_ASK ? 35 : 0));
  const cell: ClusterCell = {
    buy: buy > 0 ? buy : 0,
    sell: sell > 0 ? sell : 0,
  };

  if (price === 101.9 && colIdx === 2) cell.poc = "white";
  if (price === 102.2 && colIdx === 4) {
    cell.sell = 9500;
    cell.poc = "red";
  }
  if (price === 101.82 && colIdx === 1) {
    cell.buy = 4600;
    cell.poc = "white";
  }
  if (price === 101.78 && colIdx === 5) {
    cell.buy = 8000;
    cell.poc = "green";
  }
  if (price === 102.0 && colIdx === 6) {
    cell.sell = 390;
    cell.poc = "white";
  }

  return cell;
}

export function buildClusterMatrix(levels: OrderBookLevel[]): ClusterColumn[] {
  return CLUSTER_TIMES.map((time, colIdx) => {
    const cells = new Map<number, ClusterCell>();
    let totalBuy = 0;
    let totalSell = 0;

    for (const lv of levels) {
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

/** Начальные сделки для «цепочки» у mid-price. */
export function initialTapeBubbles(): TapeBubbleSeed[] {
  return [
    { id: "s0", price: 102.0, qty: 129, side: "buy", xPercent: 58 },
    { id: "s1", price: 101.99, qty: 50, side: "sell", xPercent: 52 },
    { id: "s2", price: 102.0, qty: 1400, side: "buy", xPercent: 65 },
    { id: "s3", price: 101.99, qty: 20, side: "sell", xPercent: 48 },
    { id: "s4", price: 102.0, qty: 2500, side: "buy", xPercent: 72 },
    { id: "s5", price: 101.98, qty: 6, side: "sell", xPercent: 44 },
    { id: "s6", price: 102.0, qty: 100, side: "buy", xPercent: 55 },
    { id: "s7", price: 101.99, qty: 1, side: "sell", xPercent: 50 },
  ];
}

export const BOTTOM_BARS = [
  { h: 18, up: false },
  { h: 24, up: true },
  { h: 12, up: false },
  { h: 30, up: true },
  { h: 16, up: false },
  { h: 22, up: true },
  { h: 14, up: false },
  { h: 28, up: true },
  { h: 20, up: false },
  { h: 26, up: true },
  { h: 15, up: false },
  { h: 32, up: true },
] as const;
