"use client";

import { useState } from "react";
import type { OrderBookLevel } from "@/lib/stakan-lenta/cscalp-mock-data";
import { CSCALP, type HighlightZone, zoneHighlightClass } from "@/lib/stakan-lenta/cscalp-theme";
import { fmtPrice, fmtQty, type LiveTapeBubble } from "@/lib/stakan-lenta/cscalp-sim";

interface CScalpTapeBubblesProps {
  levels: OrderBookLevel[];
  bubbles: LiveTapeBubble[];
  paused: boolean;
  onTogglePause: () => void;
  highlight: HighlightZone;
}

export function CScalpTapeBubbles({
  levels,
  bubbles,
  paused,
  onTogglePause,
  highlight,
}: CScalpTapeBubblesProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const priceIndex = new Map(levels.map((l, i) => [l.price, i]));

  return (
    <div
      className={`relative min-h-0 min-w-0 overflow-hidden transition-all duration-200 ${zoneHighlightClass("lenta", highlight)}`}
      style={{
        borderRight: `1px solid ${CSCALP.border}`,
        background: "#08080c",
      }}
    >
      <button
        type="button"
        onClick={onTogglePause}
        className="absolute left-1 top-1 z-20 rounded px-1.5 py-0.5 font-mono text-[8px]"
        style={{
          background: "rgba(0,0,0,0.6)",
          color: paused ? CSCALP.clusterSell : CSCALP.clusterBuy,
          border: `1px solid ${CSCALP.border}`,
        }}
      >
        {paused ? "▶ Пуск" : "⏸ Пауза"}
      </button>

      {bubbles.map((b) => {
        const idx = priceIndex.get(b.price);
        if (idx === undefined) return null;

        const y = idx * CSCALP.rowH + CSCALP.rowH / 2;
        const r = Math.min(22, 6 + Math.sqrt(b.qty) * 0.65);
        const label = b.qty >= 1000 ? fmtQty(b.qty) : String(b.qty);

        return (
          <div
            key={b.id}
            role="presentation"
            className="absolute flex cursor-default items-center justify-center rounded-full font-mono text-[8px] font-bold text-white"
            style={{
              top: y - r,
              left: `${b.xPercent}%`,
              width: r * 2,
              height: r * 2,
              transform: "translateX(-50%)",
              background: b.side === "buy" ? CSCALP.buyBubble : CSCALP.sellBubble,
              opacity: b.opacity,
              boxShadow:
                b.side === "buy"
                  ? "0 0 6px rgba(46,125,50,0.6)"
                  : "0 0 6px rgba(198,40,40,0.6)",
              transition: "opacity 0.6s ease",
            }}
            onMouseEnter={() =>
              setTooltip(
                `Сделка ${fmtQty(b.qty)} · ${b.side === "buy" ? "buy" : "sell"} · цена ${fmtPrice(b.price)}`,
              )
            }
            onMouseLeave={() => setTooltip(null)}
          >
            {label}
          </div>
        );
      })}

      {tooltip && (
        <div
          className="pointer-events-none absolute bottom-2 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 font-mono text-[9px]"
          style={{
            background: "rgba(0,0,0,0.85)",
            color: CSCALP.text,
            border: `1px solid ${CSCALP.border}`,
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
