"use client";

import type { StopMode } from "@/lib/money-management/stop-mode";
import { STOP_MODE_OPTIONS } from "@/lib/money-management/stop-mode";
import { getInstrumentStopPreset } from "@/lib/money-management/stop-presets";
import { formatPoints } from "@/lib/money-management/format";
import { parseInputNumber } from "@/components/trainer";
import { cn } from "@/lib/utils/format";

interface StopPresetPanelProps {
  instrumentId: string;
  ticker: string;
  stopMode: StopMode;
  customStopPoints: number;
  onStopModeChange: (mode: StopMode) => void;
  onCustomStopChange: (points: number) => void;
}

/** Компактная панель стоп-пресетов для главного экрана. */
export function StopPresetPanel({
  instrumentId,
  ticker,
  stopMode,
  customStopPoints,
  onStopModeChange,
  onCustomStopChange,
}: StopPresetPanelProps) {
  const activeStop =
    stopMode === "custom"
      ? customStopPoints
      : getInstrumentStopPreset(instrumentId, stopMode);

  return (
    <section aria-label="Стоп для инструмента" className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-terminal-text">
          Средний рабочий стоп
        </h2>
        <p className="mt-0.5 font-mono text-[11px] text-terminal-muted">
          {ticker} · стоп подбирается под инструмент и стиль
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {STOP_MODE_OPTIONS.map((opt) => {
          const pts =
            opt.id === "custom"
              ? null
              : getInstrumentStopPreset(instrumentId, opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStopModeChange(opt.id)}
              className={cn(
                "rounded-lg border px-2 py-2 text-left transition-all",
                stopMode === opt.id
                  ? "border-cyan/40 bg-cyan/[0.1] ring-1 ring-cyan/20"
                  : "border-terminal-border/60 bg-terminal-card/30 hover:border-terminal-border",
              )}
            >
              <span
                className={cn(
                  "block text-[10px] font-semibold uppercase tracking-wide",
                  stopMode === opt.id ? "text-cyan" : "text-terminal-muted",
                )}
              >
                {opt.label}
              </span>
              <span className="mt-0.5 block font-mono text-sm tabular-nums text-terminal-text">
                {pts !== null ? formatPoints(pts) : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {stopMode === "custom" ? (
        <label className="flex items-center gap-2 rounded-lg border border-terminal-border/50 bg-terminal-bg/50 px-3 py-2">
          <span className="text-[10px] text-terminal-muted">Свой стоп, п.</span>
          <input
            type="number"
            value={customStopPoints}
            min={1}
            max={300}
            step={1}
            onChange={(e) =>
              onCustomStopChange(
                parseInputNumber(e.target.value, 1, 300, customStopPoints),
              )
            }
            className="w-20 rounded border border-terminal-border bg-terminal-bg px-2 py-1 font-mono text-sm focus:border-cyan/40 focus:outline-none"
          />
        </label>
      ) : null}

      <p className="rounded-lg border border-red/15 bg-red/[0.04] px-3 py-2 font-mono text-xs text-red/80">
        Активный: {formatPoints(activeStop)}
      </p>
    </section>
  );
}
