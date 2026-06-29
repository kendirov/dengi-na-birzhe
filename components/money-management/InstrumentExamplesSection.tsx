"use client";

import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import type { StopMode } from "@/lib/money-management/stop-mode";
import { STOP_MODE_OPTIONS } from "@/lib/money-management/stop-mode";
import { formatPoints, formatRub, formatTickSize } from "@/lib/money-management/format";
import { parseInputNumber } from "@/components/trainer";
import { cn } from "@/lib/utils/format";

interface InstrumentExamplesSectionProps {
  rows: VolumeRowResult[];
  selectedId: string;
  stopMode: StopMode;
  customStopPoints: number;
  onSelect: (id: string) => void;
  onStopModeChange: (mode: StopMode) => void;
  onCustomStopChange: (points: number) => void;
}

export function InstrumentExamplesSection({
  rows,
  selectedId,
  stopMode,
  customStopPoints,
  onSelect,
  onStopModeChange,
  onCustomStopChange,
}: InstrumentExamplesSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-terminal-text">
            Примеры по инструментам
          </h2>
          <p className="mt-0.5 text-xs text-terminal-muted">
            Выбери инструмент и стоп — увидишь 5 объёмов для привода
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {STOP_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStopModeChange(opt.id)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 font-mono text-[10px] transition-colors",
                  stopMode === opt.id
                    ? "border-cyan/35 bg-cyan/10 text-cyan"
                    : "border-terminal-border text-terminal-muted hover:text-terminal-text",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {stopMode === "custom" ? (
            <label className="flex items-center gap-2">
              <span className="text-[10px] text-terminal-muted">Стоп</span>
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
                className="w-16 rounded border border-terminal-border bg-terminal-bg px-2 py-1 font-mono text-xs focus:border-cyan/40 focus:outline-none"
              />
              <span className="font-mono text-[10px] text-terminal-muted">п.</span>
            </label>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        {rows.map((row) => (
          <InstrumentRow
            key={row.id}
            row={row}
            active={row.id === selectedId}
            onSelect={() => onSelect(row.id)}
          />
        ))}
      </div>
    </section>
  );
}

function InstrumentRow({
  row,
  active,
  onSelect,
}: {
  row: VolumeRowResult;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border px-3 py-3 text-left transition-colors",
        active
          ? "border-cyan/30 bg-cyan/[0.06] ring-1 ring-cyan/20"
          : "border-terminal-border/60 bg-terminal-card/30 hover:border-terminal-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-[72px]">
          <p className="font-mono text-base font-bold text-cyan">{row.ticker}</p>
          <p className="text-[10px] text-terminal-muted">{row.name}</p>
        </div>

        <Meta label="Шаг" value={formatTickSize(row.tickSize)} />
        <Meta label="Шаг/лот" value={formatRub(row.pointValueRub)} />
        <Meta label="Стоп" value={formatPoints(row.stopPoints)} />
        <Meta
          label="Риск / лот"
          value={formatRub(row.riskPerLotRub)}
          accent
        />

        <div className="ml-auto flex flex-wrap gap-1.5">
          <VolChip label="1" value={row.beaconVolume} />
          <VolChip label="¼" value={row.quarterVolume} />
          <VolChip label="½" value={row.halfVolume} />
          <VolChip
            label="полн"
            value={row.highRisk ? 0 : row.baseVolume}
            primary
            warn={row.highRisk}
          />
          <VolChip
            label="x2"
            value={row.highRisk ? 0 : row.doubleVolume}
            warn={row.highRisk}
          />
        </div>
      </div>
    </button>
  );
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-terminal-muted">
        {label}
      </p>
      <p
        className={cn(
          "font-mono text-xs tabular-nums",
          accent ? "font-semibold text-cyan" : "text-terminal-text",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function VolChip({
  label,
  value,
  primary,
  warn,
}: {
  label: string;
  value: number;
  primary?: boolean;
  warn?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[36px] flex-col items-center rounded-lg border px-1.5 py-1 font-mono",
        primary && !warn && "border-green/35 bg-green/10 text-green",
        warn && "border-amber/30 bg-amber/10 text-amber",
        !primary && !warn && "border-terminal-border/50 bg-terminal-bg/50 text-terminal-text",
      )}
    >
      <span className="text-[8px] uppercase text-terminal-muted">{label}</span>
      <span className="text-sm font-bold tabular-nums">{warn && primary ? "—" : value}</span>
    </span>
  );
}
