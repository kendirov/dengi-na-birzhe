export interface OrderBookLevel {
  price: number;
  bidQty: number;
  askQty: number;
}

export const DEMO_BEST_BID = 312.42;
export const DEMO_BEST_ASK = 312.45;
export const DEMO_SPREAD = DEMO_BEST_ASK - DEMO_BEST_BID;
export const DEMO_LAST = 312.44;

export const ORDERBOOK_LEVELS: OrderBookLevel[] = [
  { price: 312.48, bidQty: 0, askQty: 1200 },
  { price: 312.47, bidQty: 0, askQty: 800 },
  { price: 312.46, bidQty: 0, askQty: 2400 },
  { price: 312.45, bidQty: 0, askQty: 5600 },
  { price: 312.44, bidQty: 2100, askQty: 1800 },
  { price: 312.43, bidQty: 3200, askQty: 0 },
  { price: 312.42, bidQty: 4200, askQty: 0 },
  { price: 312.41, bidQty: 1800, askQty: 0 },
  { price: 312.4, bidQty: 4800, askQty: 0 },
  { price: 312.39, bidQty: 900, askQty: 0 },
];

export const DENSITY_LEVEL_PRICE = 312.4;
export const DENSITY_BID_QTY = 48000;

export interface TapePrint {
  id: string;
  time: string;
  price: number;
  qty: number;
  side: "buy" | "sell";
  large?: boolean;
}

export const DEMO_TAPE: TapePrint[] = [
  { id: "1", time: "14:32:01", price: 312.44, qty: 50, side: "buy" },
  { id: "2", time: "14:32:02", price: 312.45, qty: 200, side: "buy", large: true },
  { id: "3", time: "14:32:03", price: 312.43, qty: 30, side: "sell" },
  { id: "4", time: "14:32:04", price: 312.44, qty: 100, side: "buy" },
  { id: "5", time: "14:32:05", price: 312.42, qty: 500, side: "sell", large: true },
  { id: "6", time: "14:32:06", price: 312.41, qty: 20, side: "sell" },
  { id: "7", time: "14:32:07", price: 312.44, qty: 80, side: "buy" },
];
