"use client";

import type { InstrumentPreset } from "@/lib/money-management/instrument-presets";
import { TrainerInput } from "@/components/trainer";
import { cn } from "@/lib/utils/format";

interface OrderbookControlsProps {
  preset: InstrumentPreset;
  instrumentId: string;
  entryPrice: number;
  stopPrice: number;
  entryCommissionRub: number;
  exitCommissionRub: number;
  onInstrumentChange: (id: string) => void;
  onEntryChange: (v: number) => void;
  onStopChange: (v: number) => void;
  onEntryCommissionChange: (v: number) => void;
  onExitCommissionChange: (v: number) => void;
  onResetCommissions: () => void;
}

export function OrderbookControls({
  preset,
  instrumentId,
  entryPrice,
  stopPrice,
  entryCommissionRub,
  exitCommissionRub,
  onInstrumentChange,
  onEntryChange,
  onStopChange,
  onEntryCommissionChange,
  onExitCommissionChange,
  onResetCommissions,
}: OrderbookControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-terminal-muted">
          Инструмент
        </span>
        <div className="flex flex-wrap gap-1">
          {(["SBER", "GAZP", "LKOH"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onInstrumentChange(id)}
              className={cn(
                "rounded border px-2.5 py-1 font-mono text-[10px] transition-colors",
                instrumentId === id
                  ? "border-cyan/40 bg-cyan/10 text-cyan"
                  : "border-terminal-border text-terminal-muted hover:text-terminal-text",
              )}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <TrainerInput
          label="Цена входа"
          tooltip="Best ask для лонга — где покупаем"
          value={entryPrice}
          onChange={onEntryChange}
          min={preset.tickSize}
          max={999_999}
          step={preset.tickSize}
          tone="cyan"
        />
        <TrainerInput
          label="Цена стопа"
          tooltip="Ниже входа — расстояние влияет на объём"
          value={stopPrice}
          onChange={onStopChange}
          min={preset.tickSize}
          max={entryPrice}
          step={preset.tickSize}
          tone="red"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <TrainerInput
          label="Ком. вход / лот"
          value={entryCommissionRub}
          onChange={onEntryCommissionChange}
          min={0}
          max={100}
          step={0.01}
          suffix="₽"
          tone="cyan"
        />
        <TrainerInput
          label="Ком. выход / лот"
          value={exitCommissionRub}
          onChange={onExitCommissionChange}
          min={0}
          max={100}
          step={0.01}
          suffix="₽"
          tone="cyan"
        />
      </div>

      <button
        type="button"
        onClick={onResetCommissions}
        className="text-[10px] text-terminal-muted underline-offset-2 hover:text-cyan hover:underline"
      >
        Сбросить комиссии · {preset.ticker}
      </button>
    </div>
  );
}
