"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ORDERBOOK_LEVELS,
  DEMO_BEST_BID,
  DEMO_BEST_ASK,
  DEMO_SPREAD,
  DEMO_LAST,
  DENSITY_LEVEL_PRICE,
  DENSITY_BID_QTY,
} from "@/lib/lesson/orderbook-demo";
import { cn } from "@/lib/utils/format";

type HighlightMode =
  | "none"
  | "bid"
  | "ask"
  | "spread"
  | "large"
  | "density";

interface InteractiveOrderBookProps {
  showDensity?: boolean;
  densityQty?: number;
  densityRemoved?: boolean;
}

export function InteractiveOrderBook({
  showDensity = false,
  densityQty = DENSITY_BID_QTY,
  densityRemoved = false,
}: InteractiveOrderBookProps) {
  const [highlight, setHighlight] = useState<HighlightMode>("none");

  const levels = useMemo(() => {
    return ORDERBOOK_LEVELS.map((l) => {
      if (showDensity && l.price === DENSITY_LEVEL_PRICE && !densityRemoved) {
        return { ...l, bidQty: densityQty };
      }
      return l;
    });
  }, [showDensity, densityQty, densityRemoved]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["bid", "Bid"],
            ["ask", "Ask"],
            ["spread", "Spread"],
            ["large", "Крупная заявка"],
            ...(showDensity ? [["density", "Плотность"] as const] : []),
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setHighlight(highlight === mode ? "none" : mode)}
            className={cn(
              "rounded border px-3 py-1.5 font-mono text-[11px] transition-all",
              highlight === mode
                ? "border-cyan/50 bg-cyan/10 text-cyan"
                : "border-terminal-border text-terminal-muted hover:text-terminal-text",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-terminal-border bg-terminal-bg/80 font-mono text-xs">
        <div className="grid grid-cols-3 border-b border-terminal-border bg-terminal-surface/80 px-3 py-2 text-[10px] uppercase tracking-wider text-terminal-muted">
          <span className="text-green">Bid · qty</span>
          <span className="text-center">Цена</span>
          <span className="text-right text-red">Ask · qty</span>
        </div>

        <div className="relative max-h-[280px] overflow-y-auto scrollbar-terminal">
          {levels.map((level) => {
            const isBestBid = level.price === DEMO_BEST_BID;
            const isBestAsk = level.price === DEMO_BEST_ASK;
            const isSpreadRow = isBestBid || isBestAsk;
            const isLarge =
              highlight === "large" &&
              (level.bidQty >= 4000 || level.askQty >= 4000);
            const isDensity =
              highlight === "density" &&
              showDensity &&
              level.price === DENSITY_LEVEL_PRICE &&
              !densityRemoved;
            const isLast = level.price === DEMO_LAST;

            return (
              <div
                key={level.price}
                className={cn(
                  "grid grid-cols-3 border-b border-terminal-border/30 px-3 py-1.5 transition-colors",
                  highlight === "spread" && isSpreadRow && "bg-amber/10",
                  highlight === "bid" && isBestBid && "bg-green/10",
                  highlight === "ask" && isBestAsk && "bg-red/10",
                  isLarge && "bg-violet/10",
                  isDensity && "bg-amber/15 ring-1 ring-amber/40",
                  isLast && "bg-cyan/5",
                )}
              >
                <span className="text-green">
                  {level.bidQty > 0 ? level.bidQty.toLocaleString("ru-RU") : ""}
                  {isBestBid && highlight === "bid" && (
                    <span className="ml-1 text-[10px] text-green">← best</span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-center font-semibold",
                    isLast ? "text-cyan data-glow-cyan" : "text-terminal-text",
                  )}
                >
                  {level.price.toFixed(2)}
                </span>
                <span className="text-right text-red">
                  {isBestAsk && highlight === "ask" && (
                    <span className="mr-1 text-[10px]">best →</span>
                  )}
                  {level.askQty > 0 ? level.askQty.toLocaleString("ru-RU") : ""}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-terminal-border bg-terminal-surface/50 px-3 py-3">
          <Stat label="Bid" value={DEMO_BEST_BID.toFixed(2)} tone="green" active={highlight === "bid"} />
          <Stat
            label="Spread"
            value={`${DEMO_SPREAD.toFixed(2)} ₽`}
            tone="amber"
            active={highlight === "spread"}
          />
          <Stat label="Ask" value={DEMO_BEST_ASK.toFixed(2)} tone="red" active={highlight === "ask"} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  active,
}: {
  label: string;
  value: string;
  tone: "green" | "red" | "amber";
  active?: boolean;
}) {
  const color =
    tone === "green" ? "text-green" : tone === "red" ? "text-red" : "text-amber";
  return (
    <div className={cn("text-center", active && "data-glow-cyan")}>
      <p className="text-[9px] uppercase text-terminal-muted">{label}</p>
      <p className={cn("font-bold", color)}>{value}</p>
    </div>
  );
}

export function OrderBookLegend() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <LegendItem tone="green" title="Bid" text="Лучшая заявка на покупку — куда можно продать по рынку" />
      <LegendItem tone="red" title="Ask" text="Лучшая заявка на продажу — откуда покупают по рынку" />
      <LegendItem tone="amber" title="Spread" text="Ask − Bid — стоимость мгновенного входа и выхода" />
    </div>
  );
}

function LegendItem({
  tone,
  title,
  text,
}: {
  tone: "green" | "red" | "amber";
  title: string;
  text: string;
}) {
  const color =
    tone === "green" ? "text-green" : tone === "red" ? "text-red" : "text-amber";
  return (
    <div className="rounded border border-terminal-border bg-terminal-surface/40 p-3">
      <p className={cn("mb-1 font-mono text-sm font-bold", color)}>{title}</p>
      <p className="text-xs leading-relaxed text-terminal-muted">{text}</p>
    </div>
  );
}

export function OrderBookPulse({ active }: { active?: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 border-2 border-cyan/30"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    />
  );
}
