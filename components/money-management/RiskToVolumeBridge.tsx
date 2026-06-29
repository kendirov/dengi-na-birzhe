"use client";

import { formatLots, formatRub } from "@/lib/money-management/format";
import { cn } from "@/lib/utils/format";

interface RiskToVolumeBridgeProps {
  riskPerTradeRub: number;
  riskPerLotRub: number;
  fullVolume: number;
  highRisk: boolean;
}

export function RiskToVolumeBridge({
  riskPerTradeRub,
  riskPerLotRub,
  fullVolume,
  highRisk,
}: RiskToVolumeBridgeProps) {
  return (
    <section
      aria-label="Связка риска и объёма"
      className="space-y-3 rounded-xl border border-terminal-border/50 bg-terminal-bg/30 px-4 py-4"
    >
      <p className="text-center text-xs text-terminal-muted">
        Допустимый рабочий объём считается от риска, а не от желания.
      </p>

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-0">
        <BridgeStep
          label="Риск на сделку"
          value={formatRub(riskPerTradeRub)}
          tone="cyan"
        />
        <BridgeArrow />
        <BridgeStep
          label="Риск на 1 лот"
          value={formatRub(riskPerLotRub)}
          tone="cyan"
        />
        <BridgeArrow />
        <BridgeStep
          label="Полный объём"
          value={highRisk ? "—" : formatLots(fullVolume)}
          sub={highRisk ? "недоступно" : `${fullVolume} лот.`}
          tone="green"
          highlight
        />
      </div>

      {!highRisk && riskPerLotRub > 0 ? (
        <p className="text-center font-mono text-[10px] text-terminal-muted">
          {formatRub(riskPerTradeRub)} ÷ {formatRub(riskPerLotRub)} = {fullVolume}{" "}
          лот.
        </p>
      ) : null}
    </section>
  );
}

function BridgeStep({
  label,
  value,
  sub,
  tone,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "cyan" | "green";
  highlight?: boolean;
}) {
  const styles = {
    cyan: "border-cyan/30 bg-cyan/[0.08] text-cyan",
    green: "border-green/40 bg-green/[0.1] text-green",
  }[tone];

  return (
    <div
      className={cn(
        "flex min-w-[140px] flex-col items-center rounded-xl border px-4 py-3 text-center",
        styles,
        highlight && "shadow-[0_0_24px_rgba(52,211,153,0.12)] ring-1 ring-green/20",
      )}
    >
      <span className="text-[9px] uppercase tracking-wider text-terminal-muted">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 font-mono font-bold tabular-nums",
          highlight ? "text-2xl data-glow-green" : "text-xl",
        )}
      >
        {value}
      </span>
      {sub ? (
        <span className="mt-0.5 font-mono text-[10px] text-terminal-muted">{sub}</span>
      ) : null}
    </div>
  );
}

function BridgeArrow() {
  return (
    <div className="flex items-center px-2 py-1 sm:py-0" aria-hidden>
      <svg
        width="32"
        height="16"
        viewBox="0 0 32 16"
        className="text-terminal-muted sm:rotate-0 rotate-90"
      >
        <path
          d="M0 8 H22 M16 4 L24 8 L16 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
