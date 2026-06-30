import {
  CSCALP_ROW_H,
  TAPE_BUBBLE_MAX,
  TAPE_BUBBLE_MIN,
  TAPE_DRIFT_PER_SEC,
  TAPE_ENTRY_X,
  TAPE_FADE_MS,
  TAPE_LANE_JITTER,
  TAPE_LANE_START,
  TAPE_MAX_PRINTS,
  TAPE_TTL_MS,
} from "../constants/layout";
import { createSeededRandom, pickFromPool } from "../utils/seededRandom";
import {
  BEST_ASK,
  BEST_BID,
  CURRENT_PRICE,
  REFERENCE_TAPE_SNAPSHOT,
  fmtQty,
  getBestAskFromLevels,
  getBestBidFromLevels,
} from "../data/mockMarket";
import type { PriceLevel, TapePrint, TapeScenarioMode, TradeSide } from "../types";

export { TAPE_TTL_MS, TAPE_FADE_MS, TAPE_MAX_PRINTS } from "../constants/layout";

export const TAPE_DRIFT_PER_TICK = TAPE_DRIFT_PER_SEC * 0.18;

let printSeq = 0;
const tapeRng = createSeededRandom(9001);

export function nextPrintId(): string {
  printSeq += 1;
  return `tp-${Date.now()}-${printSeq}`;
}

export function isLargePrint(qty: number): boolean {
  return qty >= 400;
}

export function printIntensity(qty: number): number {
  return Math.min(1, 0.25 + Math.sqrt(qty) / 85);
}

export function createTapePrint(
  partial: Omit<TapePrint, "id" | "laneX" | "opacity" | "intensity" | "isLarge"> & {
    id?: string;
    laneX?: number;
    opacity?: number;
    intensity?: number;
    isLarge?: boolean;
  },
): TapePrint {
  const laneX = partial.laneX ?? TAPE_LANE_START + tapeRng() * TAPE_LANE_JITTER;
  return {
    id: partial.id ?? nextPrintId(),
    side: partial.side,
    price: partial.price,
    qty: partial.qty,
    timestamp: partial.timestamp,
    intensity: partial.intensity ?? printIntensity(partial.qty),
    isLarge: partial.isLarge ?? isLargePrint(partial.qty),
    laneX,
    opacity: partial.opacity ?? 1,
  };
}

/** Static CiScalp.png trail — default for pixel / terminal mode. */
export function referenceSnapshotPrints(now = Date.now()): TapePrint[] {
  return REFERENCE_TAPE_SNAPSHOT.map((s, i) => {
    const ageMs = 3800 - i * 280;
    return createTapePrint({
      id: `ref-${i}`,
      side: s.side,
      price: s.price,
      qty: s.qty,
      timestamp: now - ageMs,
      laneX: s.laneX,
      opacity: s.opacity ?? 1,
      isLarge: s.isLarge ?? isLargePrint(s.qty),
    });
  });
}

/** Sparse live tape for normal / lesson modes. */
export function initialTapePrints(now = Date.now()): TapePrint[] {
  return referenceSnapshotPrints(now);
}

export function tapePrintFromTrade(
  side: TradeSide,
  price: number,
  qty: number,
  timestamp = Date.now(),
): TapePrint {
  return createTapePrint({
    side,
    price,
    qty,
    timestamp,
    laneX: TAPE_ENTRY_X - tapeRng() * TAPE_LANE_JITTER,
    intensity: printIntensity(qty),
    isLarge: isLargePrint(qty),
  });
}

export function tickTapePrints(prints: TapePrint[], now: number): TapePrint[] {
  return prints
    .map((p) => {
      const age = now - p.timestamp;
      if (age > TAPE_TTL_MS) return null;

      const ageSec = age / 1000;
      const laneX = Math.max(6, (p.laneX ?? TAPE_ENTRY_X) - ageSec * TAPE_DRIFT_PER_SEC);

      let opacity = p.opacity;
      if (opacity >= 0.99) {
        opacity = Math.max(0.62, 1 - ageSec * 0.045);
      }
      if (age > TAPE_TTL_MS - TAPE_FADE_MS) {
        opacity = Math.min(opacity, (TAPE_TTL_MS - age) / TAPE_FADE_MS);
      }

      return { ...p, laneX, opacity };
    })
    .filter((p): p is TapePrint => p !== null)
    .slice(0, TAPE_MAX_PRINTS);
}

export interface TapeModeConfig {
  minDelay: number;
  maxDelay: number;
  qtyPool: number[];
  sideBias: number;
  pricePin?: number;
  forceSide?: TradeSide;
  frozen?: boolean;
}

export const TAPE_MODE_CONFIG: Record<TapeScenarioMode, TapeModeConfig> = {
  referenceSnapshot: {
    minDelay: 60_000,
    maxDelay: 120_000,
    qtyPool: [],
    sideBias: 0.5,
    frozen: true,
  },
  normal: {
    minDelay: 1400,
    maxDelay: 3200,
    qtyPool: [19, 27, 51, 79, 110, 133, 173, 198],
    sideBias: 0.52,
  },
  active: {
    minDelay: 380,
    maxDelay: 900,
    qtyPool: [51, 110, 173, 198, 250, 400],
    sideBias: 0.55,
  },
  absorption: {
    minDelay: 300,
    maxDelay: 580,
    qtyPool: [80, 110, 133, 173, 250],
    sideBias: 0.48,
    pricePin: BEST_BID,
  },
  breakoutAttempt: {
    minDelay: 200,
    maxDelay: 480,
    qtyPool: [110, 198, 250, 400, 1000],
    sideBias: 0.72,
    forceSide: "buy",
  },
};

export function pickTapeQty(pool: number[]): number {
  return pickFromPool(tapeRng, pool);
}

export function generateScenarioPrint(
  mode: TapeScenarioMode,
  market: PriceLevel[],
): TapePrint | null {
  const cfg = TAPE_MODE_CONFIG[mode];
  if (cfg.frozen || cfg.qtyPool.length === 0) return null;

  const ask = getBestAskFromLevels(market);
  const bid = getBestBidFromLevels(market);
  if (!ask || !bid) return null;

  const side: TradeSide =
    cfg.forceSide ?? (tapeRng() < cfg.sideBias ? "buy" : "sell");

  let price = side === "buy" ? ask.price : bid.price;
  if (cfg.pricePin != null) price = cfg.pricePin;

  if (mode === "absorption") {
    price = BEST_BID;
  }

  const qty = pickTapeQty(cfg.qtyPool);
  return tapePrintFromTrade(side, price, qty);
}

export function applyBreakoutShift(market: PriceLevel[]): PriceLevel[] {
  const shift = 0.01;
  return market.map((row) => {
    const price = Math.round((row.price + shift) * 100) / 100;
    return { ...row, price };
  });
}

export function scheduleDelay(mode: TapeScenarioMode): number {
  const cfg = TAPE_MODE_CONFIG[mode];
  return cfg.minDelay + tapeRng() * (cfg.maxDelay - cfg.minDelay);
}

export function printRadius(qty: number, isLarge: boolean): number {
  const scaled = TAPE_BUBBLE_MIN + Math.sqrt(qty) * 0.62;
  const cap = isLarge || qty >= 400 ? TAPE_BUBBLE_MAX : TAPE_BUBBLE_MAX - 2;
  return Math.min(cap, Math.max(TAPE_BUBBLE_MIN, scaled));
}

export function printLabel(qty: number): string {
  if (qty >= 1000) return fmtQty(qty);
  return String(Math.round(qty));
}

export function tapeRowHeightPx(): number {
  return CSCALP_ROW_H;
}

export { BEST_ASK, BEST_BID, CURRENT_PRICE };
