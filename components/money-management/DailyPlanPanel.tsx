"use client";

import type { DailyPlanUiInput } from "@/lib/money-management/types";
import { MmInput } from "./ui";

interface DailyPlanPanelProps {
  input: DailyPlanUiInput;
  onChange: (patch: Partial<DailyPlanUiInput>) => void;
}

export function DailyPlanPanel({ input, onChange }: DailyPlanPanelProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <MmInput
        label="Депозит"
        tooltip="Сумма на счёте — от неё считаются цель и просадка"
        value={input.depositRub}
        onChange={(v) => onChange({ depositRub: v })}
        min={10_000}
        max={50_000_000}
        step={10_000}
        suffix="₽"
      />
      <MmInput
        label="Просадка"
        tooltip="Максимум, который можно потерять за сессию"
        value={input.drawdownRub}
        onChange={(v) => onChange({ drawdownRub: v })}
        min={1}
        max={1_000_000}
        step={10}
        suffix="₽"
        tone="red"
      />
      <MmInput
        label="Цель / день"
        tooltip="Желаемый результат в процентах от депозита"
        value={input.dailyGoalPct}
        onChange={(v) => onChange({ dailyGoalPct: v })}
        min={0.1}
        max={5}
        step={0.1}
        suffix="%"
        tone="green"
      />
      <MmInput
        label="Сделок"
        tooltip="Сколько идей максимум — риск делится на это число"
        value={input.plannedTrades}
        onChange={(v) => onChange({ plannedTrades: v })}
        min={1}
        max={20}
        step={1}
      />
    </div>
  );
}
