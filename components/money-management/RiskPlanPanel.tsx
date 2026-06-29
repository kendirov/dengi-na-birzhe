"use client";

import type { DailyPlanUiInput, DailyPlanUiResult } from "@/lib/money-management/types";
import { pctFromRub, rubFromPct } from "@/lib/money-management/featured-instruments";
import { formatPercent, formatRub } from "@/lib/money-management/format";
import { parseInputNumber } from "@/components/trainer";
import { cn } from "@/lib/utils/format";

export type ValueMode = "rub" | "pct";

interface RiskPlanPanelProps {
  input: DailyPlanUiInput;
  plan: DailyPlanUiResult;
  drawdownMode: ValueMode;
  goalMode: ValueMode;
  onDrawdownModeChange: (mode: ValueMode) => void;
  onGoalModeChange: (mode: ValueMode) => void;
  onChange: (patch: Partial<DailyPlanUiInput>) => void;
}

export function RiskPlanPanel({
  input,
  plan,
  drawdownMode,
  goalMode,
  onDrawdownModeChange,
  onGoalModeChange,
  onChange,
}: RiskPlanPanelProps) {
  const drawdownPct = pctFromRub(input.depositRub, input.drawdownRub);
  const goalRub = plan.targetRub;

  return (
    <section
      aria-label="План дня"
      className="rounded-2xl border border-terminal-border/60 bg-gradient-to-br from-terminal-card/50 via-terminal-bg/30 to-terminal-card/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PlanZone
          label="Депозит"
          tone="neutral"
          primary={formatRub(input.depositRub)}
          value={input.depositRub}
          min={100}
          max={50_000_000}
          step={100}
          onChange={(v) => onChange({ depositRub: v })}
        />

        <PlanZone
          label="Просадка"
          tone="red"
          mode={drawdownMode}
          onModeChange={onDrawdownModeChange}
          primary={
            drawdownMode === "rub"
              ? formatRub(input.drawdownRub)
              : formatPercent(drawdownPct)
          }
          secondary={
            drawdownMode === "rub"
              ? formatPercent(drawdownPct)
              : formatRub(input.drawdownRub)
          }
          value={drawdownMode === "rub" ? input.drawdownRub : drawdownPct}
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

        <PlanZone
          label="Цель"
          tone="green"
          mode={goalMode}
          onModeChange={onGoalModeChange}
          primary={
            goalMode === "pct"
              ? formatPercent(input.dailyGoalPct)
              : formatRub(goalRub)
          }
          secondary={
            goalMode === "pct" ? formatRub(goalRub) : formatPercent(input.dailyGoalPct)
          }
          value={goalMode === "pct" ? input.dailyGoalPct : goalRub}
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

        <PlanZone
          label="Сделок в день"
          tone="neutral"
          primary={String(input.plannedTrades)}
          value={input.plannedTrades}
          min={1}
          max={20}
          step={1}
          onChange={(v) => onChange({ plannedTrades: v })}
        />
      </div>
    </section>
  );
}

function PlanZone({
  label,
  tone,
  mode,
  onModeChange,
  primary,
  secondary,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  tone: "neutral" | "red" | "green";
  mode?: ValueMode;
  onModeChange?: (m: ValueMode) => void;
  primary: string;
  secondary?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const toneStyles = {
    neutral: {
      shell: "border-terminal-border/70 bg-terminal-bg/50 shadow-[inset_0_0_24px_rgba(100,116,139,0.06)]",
      value: "text-terminal-text",
      glow: "",
    },
    red: {
      shell: "border-red/35 bg-red/[0.07] shadow-[inset_0_0_32px_rgba(248,113,113,0.08)] glow-red",
      value: "text-red data-glow-red",
      glow: "before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-red/40 before:to-transparent",
    },
    green: {
      shell: "border-green/35 bg-green/[0.07] shadow-[inset_0_0_32px_rgba(52,211,153,0.08)] glow-green",
      value: "text-green data-glow-green",
      glow: "before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-green/40 before:to-transparent",
    },
  }[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border px-3.5 py-3 transition-colors",
        toneStyles.shell,
        toneStyles.glow,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-terminal-muted">
          {label}
        </p>
        {mode && onModeChange ? (
          <ModeToggle mode={mode} onChange={onModeChange} />
        ) : null}
      </div>
      <p
        className={cn(
          "mt-1 font-mono text-2xl font-bold tabular-nums sm:text-3xl",
          toneStyles.value,
        )}
      >
        {primary}
      </p>
      {secondary ? (
        <p className="mt-0.5 font-mono text-[11px] text-terminal-muted">
          · {secondary}
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
        className="mt-2.5 w-full rounded-lg border border-terminal-border/50 bg-terminal-bg/70 px-2.5 py-1.5 font-mono text-sm tabular-nums focus:border-cyan/40 focus:outline-none focus:ring-1 focus:ring-cyan/20"
        aria-label={label}
      />
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
    <div className="flex rounded-md border border-terminal-border/60 bg-terminal-bg/60 p-0.5">
      {(["rub", "pct"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[9px] transition-colors",
            mode === m
              ? "bg-terminal-card text-terminal-text shadow-sm"
              : "text-terminal-muted hover:text-terminal-text",
          )}
        >
          {m === "rub" ? "₽" : "%"}
        </button>
      ))}
    </div>
  );
}
