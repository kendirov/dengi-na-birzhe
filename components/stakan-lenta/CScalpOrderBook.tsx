"use client";

import type { OrderBookLevel } from "@/lib/stakan-lenta/cscalp-mock-data";
import { CSCALP, type HighlightZone, zoneHighlightClass } from "@/lib/stakan-lenta/cscalp-theme";
import {
  fmtPrice,
  fmtQty,
  getBestAsk,
  getBestBid,
  maxBookQty,
} from "@/lib/stakan-lenta/cscalp-sim";
import { ExplainerCursorOverlay, useExplainerCursor } from "./ExplainerCursor";

interface CScalpOrderBookProps {
  levels: OrderBookLevel[];
  selectedPrice: number | null;
  onLevelClick: (level: OrderBookLevel) => void;
  highlight: HighlightZone;
}

export function CScalpOrderBook({
  levels,
  selectedPrice,
  onLevelClick,
  highlight,
}: CScalpOrderBookProps) {
  const bestAsk = getBestAsk(levels);
  const bestBid = getBestBid(levels);
  const maxQty = maxBookQty(levels);

  const {
    crosshairRef,
    tooltipRef,
    line1Ref,
    line2Ref,
    handleGridMouseMove,
    handleGridMouseLeave,
  } = useExplainerCursor();

  return (
    <>
      <div
        className={`relative min-h-0 cursor-none overflow-hidden transition-all duration-200 ${zoneHighlightClass("stakan", highlight)}`}
        style={{ borderLeft: `1px solid ${CSCALP.border}` }}
        onMouseMove={handleGridMouseMove}
        onMouseLeave={handleGridMouseLeave}
      >
        {levels.map((lv) => {
          const isAsk = lv.askQty > 0;
          const isBid = lv.bidQty > 0;
          const isBestAsk = bestAsk?.price === lv.price;
          const isBestBid = bestBid?.price === lv.price;
          const qty = isAsk ? lv.askQty : lv.bidQty;
          const isSelected = selectedPrice === lv.price;
          const hasDensity = lv.densityQty > 0;

          let rowBg: string = CSCALP.bg;
          if (isAsk) rowBg = isBestAsk ? CSCALP.askBest : CSCALP.askBg;
          if (isBid) rowBg = isBestBid ? CSCALP.bidBest : CSCALP.bidBg;

          const barPct = hasDensity
            ? (lv.densityQty / maxQty) * 100
            : qty > 0
              ? (qty / maxQty) * 65
              : 0;

          return (
            <button
              key={lv.price}
              type="button"
              data-price={lv.price}
              data-qty={qty}
              onClick={() => onLevelClick(lv)}
              className="group relative flex w-full items-stretch font-mono text-[10px] hover:brightness-125"
              style={{
                height: CSCALP.rowH,
                background: rowBg,
                outline: isSelected ? `1px solid ${CSCALP.highlightRing}` : undefined,
              }}
            >
              <span className="relative flex flex-1 items-center justify-end pr-1 tabular-nums">
                {hasDensity && (
                  <span
                    className="absolute inset-y-0 right-0"
                    style={{
                      width: `${Math.min(barPct, 92)}%`,
                      background: CSCALP.densityBg,
                      borderLeft: `2px solid ${CSCALP.density}`,
                    }}
                  />
                )}
                {!hasDensity && qty > 0 && (
                  <span
                    className="absolute inset-y-0 right-0 opacity-40"
                    style={{
                      width: `${barPct}%`,
                      background: isAsk ? CSCALP.askBest : CSCALP.bidBest,
                    }}
                  />
                )}
                <span
                  className="relative z-10"
                  style={{ color: hasDensity ? CSCALP.textVolume : CSCALP.text }}
                >
                  {qty > 0 ? fmtQty(qty) : ""}
                </span>
              </span>
              <span
                className="flex w-[52px] shrink-0 items-center justify-end pr-1.5 tabular-nums"
                style={{
                  color: isBestAsk || isBestBid ? "#fff" : CSCALP.text,
                  fontWeight: isBestAsk || isBestBid ? 700 : 400,
                }}
              >
                {fmtPrice(lv.price)}
              </span>
            </button>
          );
        })}
      </div>

      <ExplainerCursorOverlay
        crosshairRef={crosshairRef}
        tooltipRef={tooltipRef}
        line1Ref={line1Ref}
        line2Ref={line2Ref}
      />
    </>
  );
}
