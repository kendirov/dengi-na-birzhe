"use client";

import type { StopMode } from "@/lib/money-management/stop-mode";
import { STOP_MODE_OPTIONS } from "@/lib/money-management/stop-mode";
import { getInstrumentStopPreset } from "@/lib/money-management/stop-presets";
import { formatPoints } from "@/lib/money-management/format";
import { parseInputNumber } from "@/components/trainer";
import { cn } from "@/lib/utils/format";

interface StopPresetControlProps {
  instrumentId: string;
  stopMode: StopMode;
  customStopPoints: number;
  onStopModeChange: (mode: StopMode) => void;
  onCustomStopChange: (points: number) => void;
}

export function StopPresetControl({
  instrumentId,
  stopMode,
  customStopPoints,
  onStopModeChange,
  onCustomStopChange,
}: StopPresetControlProps) {
  const activeStop =
    stopMode === "custom"
      ? customStopPoints
      : getInstrumentStopPreset(instrumentId, stopMode);

  return (
    <section aria-label="Стоп-пресеты" className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-terminal-text">Стоп</h2>
        <p className="mt-0.5 text-[11px] text-terminal-muted">
          Стоп подбирается под инструмент и стиль торговли.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STOP_MODE_OPTIONS.map((opt) => {
          const presetPoints =
            opt.id === "custom"
              ? customStopPoints
              : getInstrumentStopPreset(instrumentId, opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStopModeChange(opt.id)}
              className={cn(
                "flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-all",
                stopMode === opt.id
                  ? "border-cyan/40 bg-cyan/[0.1] shadow-[0_0_20px_rgba(34,211,238,0.1)] ring-1 ring-cyan/25"
                  : "border-terminal-border/60 bg-terminal-card/30 hover:border-terminal-border",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide",
                  stopMode === opt.id ? "text-cyan" : "text-terminal-muted",
                )}
              >
                {opt.label}
              </span>
              {opt.id !== "custom" ? (
                <span className="mt-0.5 font-mono text-xs tabular-nums text-terminal-text">
                  {formatPoints(presetPoints)}
                </span>
              ) : (
                <span className="mt-0.5 font-mono text-xs text-terminal-muted">
                  свой
                </span>
              )}
            </button>
          );
        })}
      </div>

      {stopMode === "custom" ? (
        <label className="flex items-center gap-2 rounded-lg border border-terminal-border/60 bg-terminal-bg/50 px-3 py-2">
          <span className="text-[10px] text-terminal-muted">Стоп, п.</span>
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

      <p className="font-mono text-[11px] text-red/90">
        Активный стоп: {formatPoints(activeStop)}
      </p>
    </section>
  );
}
