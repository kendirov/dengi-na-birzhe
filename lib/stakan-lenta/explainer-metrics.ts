import { BEST_BID } from "./cscalp-mock-data";

export interface ExplainerMetrics {
  line1: string;
  line2: string;
}

/** Детерминированный mock RR/риска от цены уровня (учебный explainer). */
export function buildExplainerLines(price: number, qty = 0): ExplainerMetrics {
  const ticksFromMid = Math.round((price - BEST_BID) / 0.01);
  const pos = Math.max(100, Math.round(900 + Math.abs(ticksFromMid) * 42 + qty * 0.05));
  const stop = (-0.002 - Math.abs(ticksFromMid) * 0.0003).toFixed(3);
  const rr = ticksFromMid === 0 ? "2:1" : ticksFromMid > 0 ? "1.5:1" : "2.5:1";
  const risk = (3.2 + Math.abs(ticksFromMid) * 0.08).toFixed(1);

  return {
    line1: `Pos: ${pos} | Stop: ${stop} | RR: ${rr}`,
    line2: `Risk: ${risk}`,
  };
}
