"use client";

import type { OrderSide } from "@/lib/money-management/types";
import { TrainerInput, TrainerToggle } from "@/components/trainer";
import type { LearningScenario } from "@/lib/money-management/scenarios";
import { LEARNING_SCENARIOS } from "@/lib/money-management/scenarios";
import { TrainerPresetBar } from "@/components/trainer";

interface StopSettingsPanelProps {
  stopPoints: number;
  slipPoints: number;
  entryOrderType: OrderSide;
  exitOrderType: OrderSide;
  scenario: LearningScenario;
  onStopChange: (v: number) => void;
  onSlipChange: (v: number) => void;
  onEntryTypeChange: (v: OrderSide) => void;
  onExitTypeChange: (v: OrderSide) => void;
  onScenarioChange: (s: LearningScenario) => void;
}

export function StopSettingsPanel({
  stopPoints,
  slipPoints,
  entryOrderType,
  exitOrderType,
  scenario,
  onStopChange,
  onSlipChange,
  onEntryTypeChange,
  onExitTypeChange,
  onScenarioChange,
}: StopSettingsPanelProps) {
  return (
    <div className="space-y-2">
      <TrainerPresetBar
        options={LEARNING_SCENARIOS.map((s) => ({
          id: s.id,
          label: s.label,
          tooltip: s.tooltip,
          tone:
            s.id === "aggressive"
              ? "amber"
              : s.id === "cautious"
                ? "cyan"
                : "green",
        }))}
        active={scenario}
        onChange={onScenarioChange}
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <TrainerInput
          label="Стоп"
          value={stopPoints}
          onChange={onStopChange}
          min={1}
          max={300}
          step={1}
          suffix="п."
          tone="red"
        />
        <TrainerInput
          label="Slip"
          value={slipPoints}
          onChange={onSlipChange}
          min={0}
          max={20}
          step={1}
          suffix="п."
          tone="amber"
        />
        <OrderTypeSelect
          label="Вход"
          value={entryOrderType}
          onChange={onEntryTypeChange}
        />
        <OrderTypeSelect
          label="Выход"
          value={exitOrderType}
          onChange={onExitTypeChange}
        />
      </div>
    </div>
  );
}

function OrderTypeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: OrderSide;
  onChange: (v: OrderSide) => void;
}) {
  return (
    <div>
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-terminal-muted">
        {label}
      </span>
      <div className="flex gap-1 rounded border border-terminal-border p-0.5">
        <TrainerToggle
          active={value === "limit"}
          onClick={() => onChange("limit")}
          label="Лимит"
        />
        <TrainerToggle
          active={value === "market"}
          onClick={() => onChange("market")}
          label="Рынок"
        />
      </div>
    </div>
  );
}
