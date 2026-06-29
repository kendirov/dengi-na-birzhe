"use client";

import type { DailyPlanUiInput, DailyPlanUiResult } from "@/lib/money-management/types";
import { pctFromRub, rubFromPct } from "@/lib/money-management/featured-instruments";
import { formatPercent, formatRub } from "@/lib/money-management/format";
import { parseInputNumber } from "@/components/trainer";
import { cn } from "@/lib/utils/format";

export type ValueMode = "rub" | "pct";

interface DailyPlanSectionProps {
  input: DailyPlanUiInput;
  plan: DailyPlanUiResult;
  drawdownMode: ValueMode;
  goalMode: ValueMode;
  onDrawdownModeChange: (mode: ValueMode) => void;
  onGoalModeChange: (mode: ValueMode) => void;
  onChange: (patch: Partial<DailyPlanUiInput>) => void;
}

export function DailyPlanSection({
  input,
  plan,
  drawdownMode,
  goalMode,
  onDrawdownModeChange,
  onGoalModeChange,
  onChange,
}: DailyPlanSectionProps) {
  const drawdownPct = pctFromRub(input.depositRub, input.drawdownRub);
  const goalRub = plan.targetRub;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-terminal-text">План на день</h2>
        <p className="mt-0.5 text-xs text-terminal-muted">
          Сначала считай риск, потом выбирай объём.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:items-stretch">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PlanField
            label="Депозит"
            tone="neutral"
            value={input.depositRub}
            display={formatRub(input.depositRub)}
            suffix="₽"
            min={100}
            max={50_000_000}
            step={100}
            onChange={(v) => onChange({ depositRub: v })}
          />

          <PlanField
            label="Просадка"
            tone="red"
            mode={drawdownMode}
            onModeChange={onDrawdownModeChange}
            value={
              drawdownMode === "rub"
                ? input.drawdownRub
                : drawdownPct
            }
            display={formatRub(input.drawdownRub)}
            altDisplay={formatPercent(drawdownPct)}
            suffix={drawdownMode === "rub" ? "₽" : "%"}
            min={drawdownMode === "rub" ? 1 : 0.1}
            max={drawdownMode === "rub" ? 1_000_000 : 100}
            step={drawdownMode === "rub" ? 10 : 0.1}
            onChange={(v) => {
              if (drawdownMode === "rub") {
                onChange({ drawdownRub: v });
              } else {
                onChange({ drawdownRub: rubFromPct(input.depositRub, v) });
              }
            }}
          />

          <PlanField
            label="Цель"
            tone="green"
            mode={goalMode}
            onModeChange={onGoalModeChange}
            value={
              goalMode === "pct"
                ? input.dailyGoalPct
                : goalRub
            }
            display={formatRub(goalRub)}
            altDisplay={formatPercent(input.dailyGoalPct)}
            suffix={goalMode === "pct" ? "%" : "₽"}
            min={goalMode === "pct" ? 0.1 : 1}
            max={goalMode === "pct" ? 100 : 1_000_000}
            step={goalMode === "pct" ? 0.1 : 10}
            onChange={(v) => {
              if (goalMode === "pct") {
                onChange({ dailyGoalPct: v });
              } else {
                const pct =
                  input.depositRub > 0 ? (v / input.depositRub) * 100 : 0;
                onChange({ dailyGoalPct: pct });
              }
            }}
          />

          <PlanField
            label="Сделок в день"
            tone="neutral"
            value={input.plannedTrades}
            display={String(input.plannedTrades)}
            min={1}
            max={20}
            step={1}
            onChange={(v) => onChange({ plannedTrades: v })}
          />
        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-cyan/35 bg-cyan/[0.06] px-5 py-4 glow-cyan">
          <p className="text-[11px] font-medium uppercase tracking-wider text-cyan/80">
            Риск на сделку
          </p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-cyan data-glow-cyan sm:text-5xl">
            {formatRub(plan.baseRiskPerTradeRub)}
          </p>
          <p className="mt-2 font-mono text-xs text-terminal-muted">
            {formatRub(input.drawdownRub)} ÷ {input.plannedTrades} сделок
          </p>
        </div>
      </div>

      <p className="text-xs text-terminal-muted">
        Чем больше сделок в день, тем меньше допустимый риск на одну сделку.
      </p>
    </section>
  );
}

function PlanField({
  label,
  tone,
  mode,
  onModeChange,
  value,
  display,
  altDisplay,
  suffix,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  tone: "neutral" | "red" | "green";
  mode?: ValueMode;
  onModeChange?: (m: ValueMode) => void;
  value: number;
  display: string;
  altDisplay?: string;
  suffix?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const styles = {
    neutral: {
      border: "border-terminal-border/80",
      bg: "bg-terminal-card/40",
      value: "text-terminal-text",
      focus: "focus:border-terminal-border",
    },
    red: {
      border: "border-red/30",
      bg: "bg-red/[0.04]",
      value: "text-red",
      focus: "focus:border-red/40",
    },
    green: {
      border: "border-green/30",
      bg: "bg-green/[0.04]",
      value: "text-green",
      focus: "focus:border-green/40",
    },
  }[tone];

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        styles.border,
        styles.bg,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
          {label}
        </p>
        {mode && onModeChange ? (
          <ModeToggle mode={mode} onChange={onModeChange} />
        ) : null}
      </div>
      <p className={cn("mt-1 font-mono text-2xl font-bold tabular-nums", styles.value)}>
        {display}
      </p>
      {altDisplay ? (
        <p className="mt-0.5 font-mono text-[11px] text-terminal-muted">
          ≈ {altDisplay}
        </p>
      ) : null}
      <input
        type="number"
        value={Number.isFinite(value) ? value : min}
        min={min}
        max={max}
        step={step}
        onChange={(e) =>
          onChange(parseInputNumber(e.target.value, min, max, value))
        }
        className={cn(
          "mt-2 w-full rounded-lg border border-terminal-border/60 bg-terminal-bg/80 px-2.5 py-1.5 font-mono text-sm tabular-nums focus:outline-none",
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

function ModeToggle({
  mode,
  onChange,
}: {
  mode: ValueMode;
  onChange: (m: ValueMode) => void;
}) {
  return (
    <div className="flex rounded-md border border-terminal-border/60 p-0.5">
      {(["rub", "pct"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[9px] transition-colors",
            mode === m
              ? "bg-terminal-bg text-terminal-text"
              : "text-terminal-muted hover:text-terminal-text",
          )}
        >
          {m === "rub" ? "₽" : "%"}
        </button>
      ))}
    </div>
  );
}
