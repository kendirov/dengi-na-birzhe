import type { InstrumentPreset } from "@/lib/money-management/instrument-presets";

export interface OrderbookLevel {
  price: number;
  bidQty: number | null;
  askQty: number | null;
  side: "ask" | "bid" | "spread";
}

const ROW_HALF = 7;

/** Учебные уровни: ask сверху, spread, bid снизу. Вход = best ask (лонг). */
export function buildOrderbookLevels(
  preset: InstrumentPreset,
  entryPrice: number,
): OrderbookLevel[] {
  const { tickSize, typicalSpreadRub = preset.spreadRub } = preset;
  const bestAsk = entryPrice;
  const bestBid = Number((entryPrice - typicalSpreadRub).toFixed(6));

  const levels: OrderbookLevel[] = [];

  for (let i = ROW_HALF; i >= 1; i -= 1) {
    const price = Number((bestAsk + (i - 1) * tickSize).toFixed(6));
    levels.push({
      price,
      bidQty: null,
      askQty: 120 + i * 28,
      side: "ask",
    });
  }

  levels.push({
    price: Number(bestAsk.toFixed(6)),
    bidQty: null,
    askQty: 340,
    side: "spread",
  });

  levels.push({
    price: Number(bestBid.toFixed(6)),
    bidQty: 380,
    askQty: null,
    side: "spread",
  });

  for (let i = 1; i <= ROW_HALF + 3; i += 1) {
    const price = Number((bestBid - i * tickSize).toFixed(6));
    levels.push({
      price,
      bidQty: 200 + i * 22,
      askQty: null,
      side: "bid",
    });
  }

  return levels.sort((a, b) => b.price - a.price);
}

export function priceMatches(
  a: number,
  b: number,
  tickSize: number,
): boolean {
  return Math.abs(a - b) < tickSize / 2;
}

export function findLevelIndex(
  levels: OrderbookLevel[],
  price: number,
  tickSize: number,
): number {
  return levels.findIndex((l) => priceMatches(l.price, price, tickSize));
}
