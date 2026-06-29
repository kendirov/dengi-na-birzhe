"use client";

import type { DailyPlanUiInput, DailyPlanUiResult } from "@/lib/money-management/types";
import { pctFromRub, rubFromPct } from "@/lib/money-management/featured-instruments";
import { formatPercent, formatRub } from "@/lib/money-management/format";
import { parseInputNumber } from "@/components/trainer";
import { cn } from "@/lib/utils/format";

export type ValueMode = "rub" | "pct";

interface PlanDayStripProps {
  input: DailyPlanUiInput;
  plan: DailyPlanUiResult;
  drawdownMode: ValueMode;
  goalMode: ValueMode;
  onDrawdownModeChange: (mode: ValueMode) => void;
  onGoalModeChange: (mode: ValueMode) => void;
  onChange: (patch: Partial<DailyPlanUiInput>) => void;
}

export function PlanDayStrip({
  input,
  drawdownMode,
  goalMode,
  onDrawdownModeChange,
  onGoalModeChange,
  onChange,
  plan,
}: PlanDayStripProps) {
  const drawdownPct = pctFromRub(input.depositRub, input.drawdownRub);
  const goalRub = plan.targetRub;

  return (
    <section
      aria-label="План дня"
      className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
    >
      <StripField
        label="Депозит"
        tone="neutral"
        display={formatRub(input.depositRub)}
        value={input.depositRub}
        min={100}
        max={50_000_000}
        step={100}
        onChange={(v) => onChange({ depositRub: v })}
      />

      <StripField
        label="Просадка"
        tone="drawdown"
        mode={drawdownMode}
        onModeChange={onDrawdownModeChange}
        display={
          drawdownMode === "rub"
            ? formatRub(input.drawdownRub)
            : formatPercent(drawdownPct)
        }
        alt={
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

      <StripField
        label="Цель"
        tone="goal"
        mode={goalMode}
        onModeChange={onGoalModeChange}
        display={
          goalMode === "pct" ? formatPercent(input.dailyGoalPct) : formatRub(goalRub)
        }
        alt={
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
            const pct = input.depositRub > 0 ? (v / input.depositRub) * 100 : 0;
            onChange({ dailyGoalPct: pct });
          }
        }}
      />

      <StripField
        label="Сделок в день"
        tone="neutral"
        display={String(input.plannedTrades)}
        value={input.plannedTrades}
        min={1}
        max={20}
        step={1}
        onChange={(v) => onChange({ plannedTrades: v })}
      />
    </section>
  );
}

function StripField({
  label,
  tone,
  mode,
  onModeChange,
  display,
  alt,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  tone: "neutral" | "drawdown" | "goal";
  mode?: ValueMode;
  onModeChange?: (m: ValueMode) => void;
  display: string;
  alt?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const toneStyles = {
    neutral: "border-terminal-border/70 bg-terminal-card/35",
    drawdown: "border-red/20 bg-red/[0.04]",
    goal: "border-green/25 bg-green/[0.05]",
  }[tone];

  const valueColor = {
    neutral: "text-terminal-text",
    drawdown: "text-red/85",
    goal: "text-green",
  }[tone];

  return (
    <div className={cn("rounded-xl border px-3 py-2.5", toneStyles)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
          {label}
        </span>
        {mode && onModeChange ? (
          <div className="flex rounded border border-terminal-border/50 p-0.5">
            {(["rub", "pct"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onModeChange(m)}
                className={cn(
                  "rounded px-1.5 py-0.5 font-mono text-[9px]",
                  mode === m ? "bg-terminal-bg text-terminal-text" : "text-terminal-muted",
                )}
              >
                {m === "rub" ? "₽" : "%"}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p className={cn("mt-0.5 font-mono text-xl font-bold tabular-nums", valueColor)}>
        {display}
      </p>
      {alt ? (
        <p className="font-mono text-[10px] text-terminal-muted">· {alt}</p>
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
        className="mt-2 w-full rounded-lg border border-terminal-border/50 bg-terminal-bg/80 px-2 py-1 font-mono text-xs tabular-nums focus:border-cyan/35 focus:outline-none"
        aria-label={label}
      />
    </div>
  );
}
