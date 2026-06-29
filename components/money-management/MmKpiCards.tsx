"use client";

import type { DailyPlanUiInput, DailyPlanUiResult } from "@/lib/money-management/types";
import { formatPercent, formatRub } from "@/lib/money-management/format";
import { parseInputNumber } from "@/components/trainer";
import { cn } from "@/lib/utils/format";

interface MmKpiCardsProps {
  input: DailyPlanUiInput;
  plan: DailyPlanUiResult;
  onChange: (patch: Partial<DailyPlanUiInput>) => void;
}

export function MmKpiCards({ input, plan, onChange }: MmKpiCardsProps) {
  const drawdownPct =
    input.depositRub > 0 ? (input.drawdownRub / input.depositRub) * 100 : 0;

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      <EditableKpi
        label="Депозит"
        value={input.depositRub}
        display={formatRub(input.depositRub)}
        suffix="₽"
        tone="neutral"
        min={100}
        max={50_000_000}
        step={100}
        onChange={(v) => onChange({ depositRub: v })}
      />
      <EditableKpi
        label="Просадка"
        value={input.drawdownRub}
        display={formatRub(input.drawdownRub)}
        sub={formatPercent(drawdownPct)}
        suffix="₽"
        tone="red"
        min={1}
        max={1_000_000}
        step={10}
        onChange={(v) => onChange({ drawdownRub: v })}
      />
      <EditableKpi
        label="Цель"
        value={input.dailyGoalPct}
        display={formatRub(plan.targetRub)}
        sub={formatPercent(input.dailyGoalPct)}
        suffix="%"
        tone="green"
        min={0.1}
        max={20}
        step={0.1}
        onChange={(v) => onChange({ dailyGoalPct: v })}
      />
      <EditableKpi
        label="Сделок в день"
        value={input.plannedTrades}
        display={String(input.plannedTrades)}
        sub="сделок"
        tone="neutral"
        min={1}
        max={20}
        step={1}
        onChange={(v) => onChange({ plannedTrades: v })}
      />
      <KpiReadonly
        label="Риск на сделку"
        value={formatRub(plan.baseRiskPerTradeRub)}
        sub={`просадка ÷ ${input.plannedTrades}`}
        tone="cyan"
      />
    </div>
  );
}

function EditableKpi({
  label,
  value,
  display,
  sub,
  suffix,
  tone,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  sub?: string;
  suffix?: string;
  tone: "neutral" | "red" | "green";
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const styles = toneStyles(tone);

  return (
    <div className={cn("rounded-xl border px-3 py-2.5", styles.border, styles.bg, styles.glow)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-2xl font-bold tabular-nums leading-none sm:text-3xl", styles.value)}>
        {display}
      </p>
      {sub ? (
        <p className="mt-1 font-mono text-[11px] text-terminal-muted">{sub}</p>
      ) : null}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) =>
          onChange(parseInputNumber(e.target.value, min, max, value))
        }
        className={cn(
          "mt-2 w-full rounded border border-terminal-border/60 bg-terminal-bg/80 px-2 py-1 font-mono text-xs tabular-nums focus:outline-none",
          styles.focus,
        )}
        aria-label={label}
      />
      {suffix ? (
        <span className="sr-only">{suffix}</span>
      ) : null}
    </div>
  );
}

function KpiReadonly({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "cyan";
}) {
  const styles = toneStyles(tone);
  return (
    <div className={cn("rounded-xl border px-3 py-2.5", styles.border, styles.bg, styles.glow)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-2xl font-bold tabular-nums leading-none sm:text-3xl", styles.value)}>
        {value}
      </p>
      {sub ? (
        <p className="mt-1 font-mono text-[11px] text-terminal-muted">{sub}</p>
      ) : null}
    </div>
  );
}

function toneStyles(tone: "neutral" | "red" | "green" | "cyan") {
  return {
    neutral: {
      border: "border-terminal-border/80",
      bg: "bg-terminal-card/50",
      glow: "",
      value: "text-terminal-text",
      focus: "focus:border-terminal-border",
    },
    red: {
      border: "border-red/30",
      bg: "bg-red/[0.04]",
      glow: "shadow-[0_0_24px_rgba(248,113,113,0.08)]",
      value: "text-red data-glow-red",
      focus: "focus:border-red/40",
    },
    green: {
      border: "border-green/30",
      bg: "bg-green/[0.04]",
      glow: "glow-green",
      value: "text-green data-glow-green",
      focus: "focus:border-green/40",
    },
    cyan: {
      border: "border-cyan/35",
      bg: "bg-cyan/[0.05]",
      glow: "glow-cyan",
      value: "text-cyan data-glow-cyan",
      focus: "focus:border-cyan/40",
    },
  }[tone];
}
