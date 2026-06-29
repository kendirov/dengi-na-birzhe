"use client";

import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import { formatPoints, formatRub } from "@/lib/money-management/format";
import { tradesHint } from "@/lib/money-management/risk-engine";
import { cn } from "@/lib/utils/format";

interface RiskFormulaSceneProps {
  drawdownRub: number;
  plannedTrades: number;
  riskPerTradeRub: number;
  row: VolumeRowResult | null;
}

export function RiskFormulaScene({
  drawdownRub,
  plannedTrades,
  riskPerTradeRub,
  row,
}: RiskFormulaSceneProps) {
  const hint = tradesHint(plannedTrades);
  const pointValue = row?.pointValueRub ?? 0;
  const fullRiskPoints = row?.fullRiskPoints ?? 0;
  const riskPerLot = row?.riskPerLotRub ?? 0;

  return (
    <section
      aria-label="Формула риска"
      className="relative overflow-hidden rounded-2xl border border-cyan/25 bg-gradient-to-br from-terminal-card/80 via-terminal-bg/50 to-cyan/[0.04] px-4 py-5 sm:px-6 sm:py-6 glow-cyan"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan/[0.04] blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-terminal-text sm:text-lg">
          Риск на сделку
        </h2>
        {row ? (
          <span className="font-mono text-xs text-terminal-muted">
            {row.ticker} · стоп {formatPoints(row.stopPoints)}
          </span>
        ) : null}
      </div>

      {/* Поток: просадка → сделки → Р */}
      <div className="relative mt-4 flex flex-col items-center gap-2 lg:flex-row lg:justify-center lg:gap-1">
        <FlowChip label="Просадка" value={formatRub(drawdownRub)} tone="drawdown" />
        <FlowOp symbol="÷" />
        <FlowChip label="Сделок" value={String(plannedTrades)} tone="neutral" />
        <FlowOp symbol="=" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-5xl font-bold leading-none text-red/90 sm:text-6xl">
            Р
          </span>
          <div className="rounded-xl border border-cyan/40 bg-cyan/[0.12] px-4 py-3 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
            <p className="text-[10px] uppercase tracking-wider text-cyan/80">
              Риск на сделку
            </p>
            <p className="font-mono text-3xl font-bold tabular-nums text-cyan data-glow-cyan sm:text-4xl">
              {formatRub(riskPerTradeRub)}
            </p>
          </div>
        </div>
      </div>

      {hint ? (
        <p className="relative mt-3 text-center text-[11px] text-terminal-muted">
          {hint}
        </p>
      ) : null}

      {/* SVG стрелка к формуле лота */}
      <div className="relative my-5 flex justify-center" aria-hidden>
        <svg width="24" height="32" viewBox="0 0 24 32" className="text-cyan/40">
          <path
            d="M12 0 L12 24 M6 18 L12 26 L18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Главная формула */}
      <div className="relative space-y-3">
        <p className="text-center text-[11px] font-medium uppercase tracking-wider text-terminal-muted">
          Риск на 1 лот
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 sm:gap-x-3">
          <FormulaTerm
            symbol="Р"
            label="риск / лот"
            value={formatRub(riskPerLot)}
            tone="red"
            large
          />
          <span className="font-mono text-3xl font-light text-terminal-muted sm:text-4xl">
            =
          </span>
          <FormulaTerm
            label="Стоимость шага"
            value={formatRub(pointValue)}
            tone="cyan"
          />
          <span className="font-mono text-3xl font-light text-terminal-muted sm:text-4xl">
            ×
          </span>
          <FormulaTerm label="V позиции" value="1 лот" tone="amber" />
          <span className="font-mono text-3xl font-light text-terminal-muted sm:text-4xl">
            ×
          </span>
          <FormulaTerm
            label="Пунктов риска"
            value={formatPoints(fullRiskPoints)}
            tone="cyan"
          />
        </div>

        <p className="text-center text-[11px] text-terminal-muted">
          Полный риск = стоп + slip + комиссия входа + комиссия выхода
        </p>

        {row ? (
          <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-2 pt-1">
            <MiniPart label="Стоп" points={row.stopPoints} tone="red" />
            <MiniPart label="Slip" points={row.slipPoints} tone="amber" />
            <MiniPart label="Ком. вх." points={row.entryCommissionPoints} tone="cyan" />
            <MiniPart label="Ком. вых." points={row.exitCommissionPoints} tone="cyan" />
            <span className="rounded-md border border-amber/35 bg-amber/[0.1] px-2 py-1 font-mono text-[10px] text-amber">
              = {formatPoints(row.fullRiskPoints)}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FlowChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "drawdown" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-center",
        tone === "drawdown"
          ? "border-red/20 bg-red/[0.05]"
          : "border-terminal-border/60 bg-terminal-card/40",
      )}
    >
      <p className="text-[9px] uppercase tracking-wider text-terminal-muted">{label}</p>
      <p
        className={cn(
          "font-mono text-lg font-bold tabular-nums",
          tone === "drawdown" ? "text-red/85" : "text-terminal-text",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FlowOp({ symbol }: { symbol: "÷" | "=" }) {
  return (
    <span className="font-mono text-2xl font-light text-terminal-muted sm:text-3xl">
      {symbol}
    </span>
  );
}

function FormulaTerm({
  symbol,
  label,
  value,
  tone,
  large,
}: {
  symbol?: string;
  label: string;
  value: string;
  tone: "red" | "cyan" | "amber";
  large?: boolean;
}) {
  const styles = {
    red: "border-red/25 bg-red/[0.06] text-red/90",
    cyan: "border-cyan/35 bg-cyan/[0.1] text-cyan",
    amber: "border-amber/35 bg-amber/[0.1] text-amber",
  }[tone];

  return (
    <div
      className={cn(
        "flex min-w-[88px] flex-col items-center rounded-xl border px-3 py-2.5 text-center sm:min-w-[100px]",
        styles,
        large && "min-w-[110px] sm:min-w-[120px]",
      )}
    >
      {symbol ? (
        <span className="font-mono text-2xl font-bold leading-none">{symbol}</span>
      ) : null}
      <span className="text-[9px] uppercase tracking-wide opacity-80">{label}</span>
      <span
        className={cn(
          "mt-1 font-mono font-bold tabular-nums",
          large ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
          tone === "cyan" && "data-glow-cyan",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function MiniPart({
  label,
  points,
  tone,
}: {
  label: string;
  points: number;
  tone: "red" | "amber" | "cyan";
}) {
  const bg = {
    red: "border-red/20 bg-red/[0.05] text-red/80",
    amber: "border-amber/25 bg-amber/[0.08] text-amber",
    cyan: "border-cyan/25 bg-cyan/[0.06] text-cyan",
  }[tone];

  return (
    <span className={cn("rounded px-2 py-0.5 font-mono text-[10px]", bg)}>
      {label} {formatPoints(points)}
    </span>
  );
}
