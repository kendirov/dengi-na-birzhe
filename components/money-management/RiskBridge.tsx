"use client";

import { formatRub } from "@/lib/money-management/format";
import { tradesHint } from "@/lib/money-management/risk-engine";
import { cn } from "@/lib/utils/format";

interface RiskBridgeProps {
  drawdownRub: number;
  plannedTrades: number;
  riskPerTradeRub: number;
}

export function RiskBridge({
  drawdownRub,
  plannedTrades,
  riskPerTradeRub,
}: RiskBridgeProps) {
  const hint = tradesHint(plannedTrades);

  return (
    <section
      aria-label="Риск-мост"
      className="relative overflow-hidden rounded-2xl border border-terminal-border/50 bg-terminal-bg/40 px-4 py-5 sm:px-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.06),transparent_70%)]"
      />

      <div className="relative flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-center lg:gap-0">
        <BridgeNode
          label="Просадка дня"
          value={formatRub(drawdownRub)}
          tone="red"
          className="lg:rounded-l-2xl lg:rounded-r-none"
        />

        <BridgeOperator symbol="÷" />

        <BridgeNode
          label="Сделок"
          value={String(plannedTrades)}
          tone="neutral"
          className="lg:rounded-none"
        />

        <BridgeOperator symbol="=" />

        <BridgeNode
          label="Риск на сделку"
          value={formatRub(riskPerTradeRub)}
          tone="cyan"
          highlight
          className="lg:rounded-l-none lg:rounded-r-2xl"
        />
      </div>

      {hint ? (
        <p className="relative mt-3 text-center text-[11px] text-terminal-muted">
          {hint}
        </p>
      ) : null}

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
      >
        <defs>
          <linearGradient id="bridge-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(248,113,113,0.3)" />
            <stop offset="50%" stopColor="rgba(100,116,139,0.2)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.4)" />
          </linearGradient>
        </defs>
        <line
          x1="12%"
          y1="50%"
          x2="88%"
          y2="50%"
          stroke="url(#bridge-line)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      </svg>
    </section>
  );
}

function BridgeNode({
  label,
  value,
  tone,
  highlight,
  className,
}: {
  label: string;
  value: string;
  tone: "red" | "neutral" | "cyan";
  highlight?: boolean;
  className?: string;
}) {
  const styles = {
    red: "border-red/40 bg-red/[0.1] text-red shadow-[0_0_24px_rgba(248,113,113,0.12)]",
    neutral:
      "border-terminal-border/70 bg-terminal-card/50 text-terminal-text shadow-[inset_0_0_20px_rgba(100,116,139,0.08)]",
    cyan: "border-cyan/45 bg-cyan/[0.12] text-cyan shadow-[0_0_32px_rgba(34,211,238,0.15)] glow-cyan",
  }[tone];

  return (
    <div
      className={cn(
        "relative z-10 flex min-w-0 flex-1 flex-col items-center rounded-xl border px-4 py-4 text-center transition-all duration-300",
        styles,
        highlight && "scale-[1.03] lg:scale-105",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono font-bold tabular-nums",
          highlight ? "text-4xl sm:text-5xl data-glow-cyan" : "text-3xl sm:text-4xl",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function BridgeOperator({ symbol }: { symbol: "÷" | "=" }) {
  return (
    <div
      className="relative z-10 flex shrink-0 items-center justify-center px-2 py-1 lg:px-4"
      aria-hidden
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-terminal-border/60 bg-terminal-bg/80 font-mono text-xl text-terminal-muted shadow-sm">
        {symbol}
      </span>
    </div>
  );
}
