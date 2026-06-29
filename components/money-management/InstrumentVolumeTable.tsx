"use client";

import type { ReactNode } from "react";
import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import { formatPoints, formatRub, formatTickSize } from "@/lib/money-management/format";
import { VolumeKeyButton, type VolumeKeyVariant } from "./volume-key-ui";
import { cn } from "@/lib/utils/format";

interface InstrumentVolumeTableProps {
  rows: VolumeRowResult[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const VOL_KEYS: {
  variant: VolumeKeyVariant;
  get: (r: VolumeRowResult) => number;
  label: string;
  primary?: boolean;
  warnField?: "full";
}[] = [
  { variant: "beacon", get: (r) => r.beaconVolume, label: "1" },
  { variant: "quarter", get: (r) => r.quarterVolume, label: "¼" },
  { variant: "half", get: (r) => r.halfVolume, label: "½" },
  {
    variant: "full",
    get: (r) => (r.highRisk ? 0 : r.baseVolume),
    label: "полн",
    primary: true,
    warnField: "full",
  },
  {
    variant: "double",
    get: (r) => (r.highRisk ? 0 : r.doubleVolume),
    label: "x2",
    warnField: "full",
  },
];

export function InstrumentVolumeTable({
  rows,
  selectedId,
  onSelect,
}: InstrumentVolumeTableProps) {
  return (
    <section aria-label="Таблица инструментов" className="space-y-2">
      <div>
        <h2 className="text-sm font-semibold text-terminal-text">Инструменты</h2>
        <p className="text-[11px] text-terminal-muted">
          Клик по строке — выбор и пересчёт формулы
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-terminal-border/60">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="border-b border-terminal-border/60 bg-terminal-card/50 text-[10px] uppercase tracking-wider text-terminal-muted">
              <th className="px-3 py-2.5 font-medium">Инструмент</th>
              <th className="px-2 py-2.5 font-medium">Шаг/лот</th>
              <th className="px-2 py-2.5 font-medium">Стоп, п.</th>
              <th className="px-2 py-2.5 font-medium">Slip, п.</th>
              <th className="px-2 py-2.5 font-medium">Ком. вх.</th>
              <th className="px-2 py-2.5 font-medium">Ком. вых.</th>
              <th className="px-2 py-2.5 font-medium">Полный риск</th>
              <th className="px-2 py-2.5 font-medium">Риск / 1 лот</th>
              {VOL_KEYS.map((v) => (
                <th key={v.label} className="px-1 py-2.5 text-center font-medium">
                  {v.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const active = row.id === selectedId;
              return (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(row.id);
                    }
                  }}
                  className={cn(
                    "cursor-pointer border-b border-terminal-border/40 transition-colors last:border-b-0",
                    active
                      ? "bg-cyan/[0.07] shadow-[inset_3px_0_0_0_rgba(34,211,238,0.75)]"
                      : "hover:bg-terminal-card/25",
                  )}
                >
                  <td className="px-3 py-3">
                    <span className="font-mono text-base font-bold text-cyan">
                      {row.ticker}
                    </span>
                    <span className="ml-2 hidden text-xs text-terminal-muted sm:inline">
                      {row.name}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <CellMuted>{formatRub(row.pointValueRub)}</CellMuted>
                    <span className="block font-mono text-[10px] text-terminal-muted">
                      {formatTickSize(row.tickSize)}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <CellTone tone="red">{formatPoints(row.stopPoints)}</CellTone>
                  </td>
                  <td className="px-2 py-3">
                    <CellTone tone="amber">{formatPoints(row.slipPoints)}</CellTone>
                  </td>
                  <td className="px-2 py-3">
                    <CellTone tone="cyan">{formatPoints(row.entryCommissionPoints)}</CellTone>
                  </td>
                  <td className="px-2 py-3">
                    <CellTone tone="cyan">{formatPoints(row.exitCommissionPoints)}</CellTone>
                  </td>
                  <td className="px-2 py-3">
                    <CellTone tone="amber">{formatPoints(row.fullRiskPoints)}</CellTone>
                  </td>
                  <td className="px-2 py-3">
                    <CellTone tone="cyanBright">{formatRub(row.riskPerLotRub)}</CellTone>
                  </td>
                  {VOL_KEYS.map((v) => (
                    <td key={v.label} className="px-1 py-2 text-center">
                      <VolumeKeyButton
                        variant={v.variant}
                        lots={v.get(row)}
                        label={v.label}
                        unavailable={v.warnField === "full" && row.highRisk && v.primary}
                        compact
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CellMuted({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-sm tabular-nums text-terminal-text">{children}</span>
  );
}

function CellTone({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "red" | "amber" | "cyan" | "cyanBright";
}) {
  const styles = {
    red: "border-red/20 bg-red/[0.06] text-red/85",
    amber: "border-amber/25 bg-amber/[0.08] text-amber",
    cyan: "border-cyan/20 bg-cyan/[0.06] text-cyan/90",
    cyanBright: "border-cyan/35 bg-cyan/[0.12] text-cyan font-semibold",
  }[tone];

  return (
    <span
      className={cn(
        "inline-block rounded-md border px-2 py-1 font-mono text-sm tabular-nums",
        styles,
      )}
    >
      {children}
    </span>
  );
}
