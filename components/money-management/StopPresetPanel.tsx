"use client";

import { STOCK_PRESETS } from "@/lib/money-management/defaults";
import type { LearningScenario } from "@/lib/money-management/scenarios";
import { LEARNING_SCENARIOS } from "@/lib/money-management/scenarios";
import { getInstrumentStopPreset } from "@/lib/money-management/stop-presets";
import type { OrderSide } from "@/lib/money-management/types";
import { TrainerInput, TrainerPresetBar, TrainerToggle } from "@/components/trainer";
import { formatPoints } from "@/lib/money-management/format";

interface StopPresetPanelProps {
  selectedId: string;
  scenario: LearningScenario;
  stopPoints: number;
  slipPoints: number;
  entryOrderType: OrderSide;
  exitOrderType: OrderSide;
  onInstrumentChange: (id: string) => void;
  onScenarioChange: (s: LearningScenario) => void;
  onStopChange: (v: number) => void;
  onSlipChange: (v: number) => void;
  onEntryTypeChange: (v: OrderSide) => void;
  onExitTypeChange: (v: OrderSide) => void;
}

export function StopPresetPanel({
  selectedId,
  scenario,
  stopPoints,
  slipPoints,
  entryOrderType,
  exitOrderType,
  onInstrumentChange,
  onScenarioChange,
  onStopChange,
  onSlipChange,
  onEntryTypeChange,
  onExitTypeChange,
}: StopPresetPanelProps) {
  const presetStop = getInstrumentStopPreset(selectedId, scenario);

  return (
    <div className="space-y-2 rounded-xl border border-terminal-border/70 bg-terminal-card/40 px-3 py-2.5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-terminal-text">
            Средний рабочий стоп для выбранного инструмента
          </h3>
          <p className="text-[10px] text-terminal-muted">
            Пресет: {formatPoints(presetStop)} · текущий: {formatPoints(stopPoints)}
          </p>
        </div>
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
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-terminal-muted">
            Инструмент
          </span>
          <select
            value={selectedId}
            onChange={(e) => onInstrumentChange(e.target.value)}
            className="w-full rounded border border-terminal-border bg-terminal-bg px-2 py-1.5 font-mono text-sm focus:border-cyan/40 focus:outline-none"
          >
            {STOCK_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.ticker} — {p.name}
              </option>
            ))}
          </select>
        </label>

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
