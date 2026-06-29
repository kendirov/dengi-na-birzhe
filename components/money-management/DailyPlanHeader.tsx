"use client";

import type { DailyPlanUiInput, DailyPlanUiResult } from "@/lib/money-management/types";
import { formatPercent, formatRub } from "@/lib/money-management/format";
import { TrainerInput } from "@/components/trainer";

interface DailyPlanHeaderProps {
  input: DailyPlanUiInput;
  plan: DailyPlanUiResult;
  onChange: (patch: Partial<DailyPlanUiInput>) => void;
}

export function DailyPlanHeader({ input, plan, onChange }: DailyPlanHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <TrainerInput
          label="Депозит"
          value={input.depositRub}
          onChange={(v) => onChange({ depositRub: v })}
          min={100}
          max={50_000_000}
          step={100}
          suffix="₽"
        />
        <TrainerInput
          label="Просадка"
          value={input.drawdownRub}
          onChange={(v) => onChange({ drawdownRub: v })}
          min={1}
          max={1_000_000}
          step={10}
          suffix="₽"
          tone="red"
        />
        <TrainerInput
          label="Цель"
          value={input.dailyGoalPct}
          onChange={(v) => onChange({ dailyGoalPct: v })}
          min={0.1}
          max={20}
          step={0.1}
          suffix="%"
          tone="green"
        />
        <TrainerInput
          label="Сделок в день"
          value={input.plannedTrades}
          onChange={(v) => onChange({ plannedTrades: v })}
          min={1}
          max={20}
          step={1}
        />
        <div className="flex flex-col justify-end rounded-lg border border-terminal-border/70 bg-terminal-card/50 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wider text-terminal-muted">
            Риск / сделку
          </p>
          <p className="font-mono text-lg font-semibold tabular-nums text-cyan">
            {formatRub(plan.baseRiskPerTradeRub)}
          </p>
        </div>
      </div>
      <p className="font-mono text-[11px] text-terminal-muted">
        Цель: {formatRub(plan.targetRub)} · Риск/сделку:{" "}
        {formatRub(plan.baseRiskPerTradeRub)} · {formatPercent(input.dailyGoalPct)}
      </p>
    </div>
  );
}
