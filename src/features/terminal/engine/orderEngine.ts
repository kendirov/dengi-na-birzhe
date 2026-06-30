import {
  BEST_ASK,
  BEST_BID,
  CURRENT_PRICE,
  buildMarketLadder,
  enrichPriceLevels,
  maxLadderVolume,
} from "../data/mockMarket";
import type {
  Position,
  PriceLevel,
  TapePrint,
  TradeSide,
  UserOrder,
} from "../types";
import { tapePrintFromTrade } from "./tapeEngine";

let orderSeq = 0;

function nextOrderId(): string {
  orderSeq += 1;
  return `uo-${Date.now()}-${orderSeq}`;
}

export function flatPosition(): Position {
  return { side: "flat", qty: 0, avgPrice: 0, pnlPoints: 0 };
}

function calcPnl(position: Position, markPrice: number): number {
  if (position.side === "flat" || position.qty <= 0) return 0;
  if (position.side === "long") {
    return Number(((markPrice - position.avgPrice) * position.qty).toFixed(2));
  }
  return Number(((position.avgPrice - markPrice) * position.qty).toFixed(2));
}

function withPnl(position: Position, markPrice: number): Position {
  return { ...position, pnlPoints: calcPnl(position, markPrice) };
}

function applyFill(
  position: Position,
  side: TradeSide,
  qty: number,
  price: number,
): Position {
  if (qty <= 0) return position;

  if (side === "buy") {
    if (position.side === "short") {
      const closed = Math.min(position.qty, qty);
      const remaining = qty - closed;
      if (closed >= position.qty) {
        if (remaining > 0) {
          return { side: "long", qty: remaining, avgPrice: price, pnlPoints: 0 };
        }
        return flatPosition();
      }
      return { ...position, qty: position.qty - closed };
    }
    if (position.side === "long") {
      const totalQty = position.qty + qty;
      const avgPrice =
        (position.avgPrice * position.qty + price * qty) / totalQty;
      return { side: "long", qty: totalQty, avgPrice, pnlPoints: 0 };
    }
    return { side: "long", qty, avgPrice: price, pnlPoints: 0 };
  }

  if (position.side === "long") {
    const closed = Math.min(position.qty, qty);
    const remaining = qty - closed;
    if (closed >= position.qty) {
      if (remaining > 0) {
        return { side: "short", qty: remaining, avgPrice: price, pnlPoints: 0 };
      }
      return flatPosition();
    }
    return { ...position, qty: position.qty - closed };
  }
  if (position.side === "short") {
    const totalQty = position.qty + qty;
    const avgPrice =
      (position.avgPrice * position.qty + price * qty) / totalQty;
    return { side: "short", qty: totalQty, avgPrice, pnlPoints: 0 };
  }
  return { side: "short", qty, avgPrice: price, pnlPoints: 0 };
}

function consumeAsks(market: PriceLevel[], qty: number): {
  market: PriceLevel[];
  filled: number;
  lastPrice: number;
} {
  const next = market.map((l) => ({ ...l }));
  let remaining = qty;
  let lastPrice = BEST_ASK;

  for (const row of [...next].sort((a, b) => a.price - b.price)) {
    if (remaining <= 0 || row.askSize <= 0) continue;
    const fill = Math.min(remaining, row.askSize);
    row.askSize -= fill;
    remaining -= fill;
    lastPrice = row.price;
  }

  return { market: recomputeLadder(next, lastPrice), filled: qty - remaining, lastPrice };
}

function consumeBids(market: PriceLevel[], qty: number): {
  market: PriceLevel[];
  filled: number;
  lastPrice: number;
} {
  const next = market.map((l) => ({ ...l }));
  let remaining = qty;
  let lastPrice = BEST_BID;

  for (const row of [...next].sort((a, b) => b.price - a.price)) {
    if (remaining <= 0 || row.bidSize <= 0) continue;
    const fill = Math.min(remaining, row.bidSize);
    row.bidSize -= fill;
    remaining -= fill;
    lastPrice = row.price;
  }

  return { market: recomputeLadder(next, lastPrice), filled: qty - remaining, lastPrice };
}

function recomputeLadder(rows: PriceLevel[], markPrice: number): PriceLevel[] {
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
    isCurrentPrice: row.price === markPrice,
  }));
}

export type BookAction =
  | { type: "limit_buy"; price: number; qty: number }
  | { type: "limit_sell"; price: number; qty: number }
  | { type: "market_buy"; qty: number }
  | { type: "market_sell"; qty: number }
  | { type: "cancel"; orderId: string }
  | { type: "cancel_all_limits" }
  | { type: "close_position"; qty: number };

export interface BookActionResult {
  market: PriceLevel[];
  userOrders: UserOrder[];
  position: Position;
  currentPrice: number;
  tape?: TapePrint;
  feedback: string;
}

export function applyBookAction(
  market: PriceLevel[],
  userOrders: UserOrder[],
  position: Position,
  currentPrice: number,
  action: BookAction,
): BookActionResult {
  switch (action.type) {
    case "limit_buy": {
      if (action.price > BEST_BID) {
        return noop(market, userOrders, position, currentPrice, "Лимит BUY только ≤ bestBid");
      }
      const order: UserOrder = {
        id: nextOrderId(),
        side: "buy",
        price: action.price,
        qty: action.qty,
        type: "limit",
        status: "active",
      };
      const orders = [...userOrders, order];
      return {
        market,
        userOrders: orders,
        position: withPnl(position, currentPrice),
        currentPrice,
        feedback: `Limit BUY ${action.qty} @ ${action.price.toFixed(2)}`,
      };
    }
    case "limit_sell": {
      if (action.price < BEST_ASK) {
        return noop(market, userOrders, position, currentPrice, "Лимит SELL только ≥ bestAsk");
      }
      const order: UserOrder = {
        id: nextOrderId(),
        side: "sell",
        price: action.price,
        qty: action.qty,
        type: "limit",
        status: "active",
      };
      const orders = [...userOrders, order];
      return {
        market,
        userOrders: orders,
        position: withPnl(position, currentPrice),
        currentPrice,
        feedback: `Limit SELL ${action.qty} @ ${action.price.toFixed(2)}`,
      };
    }
    case "market_buy": {
      const { market: nextMarket, filled, lastPrice } = consumeAsks(market, action.qty);
      if (filled <= 0) {
        return noop(market, userOrders, position, currentPrice, "Нет ликвидности ask");
      }
      const nextPos = withPnl(applyFill(position, "buy", filled, lastPrice), lastPrice);
      return {
        market: nextMarket,
        userOrders,
        position: nextPos,
        currentPrice: lastPrice,
        tape: makeTape("buy", filled, lastPrice),
        feedback: `Market BUY ${filled} @ ${lastPrice.toFixed(2)}`,
      };
    }
    case "market_sell": {
      const { market: nextMarket, filled, lastPrice } = consumeBids(market, action.qty);
      if (filled <= 0) {
        return noop(market, userOrders, position, currentPrice, "Нет ликвидности bid");
      }
      const nextPos = withPnl(applyFill(position, "sell", filled, lastPrice), lastPrice);
      return {
        market: nextMarket,
        userOrders,
        position: nextPos,
        currentPrice: lastPrice,
        tape: makeTape("sell", filled, lastPrice),
        feedback: `Market SELL ${filled} @ ${lastPrice.toFixed(2)}`,
      };
    }
    case "cancel": {
      const orders = userOrders.map((o) =>
        o.id === action.orderId && o.status === "active"
          ? { ...o, status: "cancelled" as const }
          : o,
      );
      return {
        market,
        userOrders: orders.filter((o) => o.status === "active"),
        position: withPnl(position, currentPrice),
        currentPrice,
        feedback: "Заявка отменена",
      };
    }
    case "cancel_all_limits": {
      return {
        market,
        userOrders: [],
        position: withPnl(position, currentPrice),
        currentPrice,
        feedback: "Все лимитные заявки сняты (F)",
      };
    }
    case "close_position": {
      if (position.side === "flat" || position.qty <= 0) {
        return {
          market,
          userOrders: [],
          position,
          currentPrice,
          feedback: "Позиция flat — D снял лимиты",
        };
      }
      const qty = position.qty;
      if (position.side === "long") {
        const sell = applyBookAction(market, [], flatPosition(), currentPrice, {
          type: "market_sell",
          qty,
        });
        return {
          ...sell,
          userOrders: [],
          feedback: `D: закрыт long ${qty} по рынку`,
        };
      }
      const buy = applyBookAction(market, [], flatPosition(), currentPrice, {
        type: "market_buy",
        qty,
      });
      return {
        ...buy,
        userOrders: [],
        feedback: `D: закрыт short ${qty} по рынку`,
      };
    }
    default:
      return noop(market, userOrders, position, currentPrice, "");
  }
}

function noop(
  market: PriceLevel[],
  userOrders: UserOrder[],
  position: Position,
  currentPrice: number,
  feedback: string,
): BookActionResult {
  return {
    market,
    userOrders,
    position: withPnl(position, currentPrice),
    currentPrice,
    feedback,
  };
}

function makeTape(side: TradeSide, qty: number, price: number): TapePrint {
  return tapePrintFromTrade(side, price, qty);
}

export function createInitialBookState(): {
  market: PriceLevel[];
  userOrders: UserOrder[];
  position: Position;
  currentPrice: number;
} {
  const market = buildMarketLadder();
  return {
    market,
    userOrders: [],
    position: flatPosition(),
    currentPrice: CURRENT_PRICE,
  };
}

export function mergeBookView(
  market: PriceLevel[],
  userOrders: UserOrder[],
  currentPrice: number,
): PriceLevel[] {
  return enrichPriceLevels(market, userOrders.filter((o) => o.status === "active"), currentPrice);
}

export function resetMarket(): PriceLevel[] {
  return buildMarketLadder();
}
