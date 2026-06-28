"use client";

import { motion } from "framer-motion";
import { cn, formatPct, formatPrice, formatRub } from "@/lib/utils/format";

export interface InstrumentMiniRowProps {
  rank: number;
  ticker: string;
  name: string;
  price: number;
  changePct: number | null;
  turnoverRub: number;
  highlighted?: boolean;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

export function InstrumentMiniRow({
  rank,
  ticker,
  name,
  price,
  changePct,
  turnoverRub,
  highlighted,
  onHover,
  onHoverEnd,
}: InstrumentMiniRowProps) {
  const positive = (changePct ?? 0) >= 0;

  return (
    <motion.div
      role="row"
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      className={cn(
        "grid grid-cols-[24px_minmax(56px,72px)_minmax(0,1fr)_64px_56px_72px] items-center gap-1 border-b border-terminal-border/40 px-2 py-2 font-mono text-[10px] transition-colors last:border-0 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs sm:grid-cols-[28px_72px_1fr_88px_72px_80px]",
        highlighted
          ? "bg-cyan/8 border-l-2 border-l-cyan"
          : "hover:bg-terminal-surface/60",
      )}
      animate={
        highlighted
          ? { backgroundColor: "rgba(34, 211, 238, 0.06)" }
          : { backgroundColor: "transparent" }
      }
      transition={{ duration: 0.3 }}
    >
      <span className="text-terminal-muted">{String(rank).padStart(2, "0")}</span>
      <span className={cn("font-bold", highlighted ? "text-cyan data-glow-cyan" : "text-cyan/90")}>
        {ticker}
      </span>
      <span className="truncate text-terminal-muted">{name}</span>
      <span className="text-right">{formatPrice(price)}</span>
      <span
        className={cn(
          "text-right font-semibold",
          positive ? "text-green data-glow-green" : "text-red data-glow-red",
        )}
      >
        {formatPct(changePct)}
      </span>
      <span className="text-right text-terminal-muted">
        {formatRub(turnoverRub, true)}
      </span>
    </motion.div>
  );
}

export function InstrumentMiniRowHeader() {
  return (
    <div className="grid grid-cols-[24px_minmax(56px,72px)_minmax(0,1fr)_64px_56px_72px] gap-1 border-b border-terminal-border bg-terminal-surface/50 px-2 py-2 font-mono text-[9px] uppercase tracking-wider text-terminal-muted sm:gap-2 sm:px-4 sm:text-[10px] sm:grid-cols-[28px_72px_1fr_88px_72px_80px]">
      <span>#</span>
      <span>Тикер</span>
      <span>Название</span>
      <span className="text-right">Цена</span>
      <span className="text-right">Δ%</span>
      <span className="text-right">Оборот</span>
    </div>
  );
}
