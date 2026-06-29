"use client";

import { useState } from "react";
import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import { formatPoints, formatRub, formatTickSize } from "@/lib/money-management/format";
import { cn } from "@/lib/utils/format";

interface InstrumentRiskMatrixProps {
  rows: VolumeRowResult[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function InstrumentRiskMatrix({
  rows,
  selectedId,
  onSelect,
}: InstrumentRiskMatrixProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section aria-label="Матрица инструментов" className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-terminal-text">
          Инструменты
        </h2>
        <p className="mt-0.5 text-[11px] text-terminal-muted">
          Клик — выбор инструмента и пересчёт объёмов
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-terminal-border/60">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-terminal-border/60 bg-terminal-card/40 text-[9px] uppercase tracking-wider text-terminal-muted">
              <th className="px-3 py-2 font-medium">Инструмент</th>
              <th className="px-2 py-2 font-medium">Стоп</th>
              <th className="px-2 py-2 font-medium">Риск/лот</th>
              <th className="px-1.5 py-2 text-center font-medium">М</th>
              <th className="px-1.5 py-2 text-center font-medium">¼</th>
              <th className="px-1.5 py-2 text-center font-medium">½</th>
              <th className="px-1.5 py-2 text-center font-medium">Полн</th>
              <th className="px-1.5 py-2 text-center font-medium">x2</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const active = row.id === selectedId;
              const expanded = expandedId === row.id;

              return (
                <MatrixRow
                  key={row.id}
                  row={row}
                  active={active}
                  expanded={expanded}
                  onSelect={() => {
                    onSelect(row.id);
                    setExpandedId((prev) => (prev === row.id ? null : row.id));
                  }}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MatrixRow({
  row,
  active,
  expanded,
  onSelect,
}: {
  row: VolumeRowResult;
  active: boolean;
  expanded: boolean;
  onSelect: () => void;
}) {
  return (
    <>
      <tr
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "cursor-pointer border-b border-terminal-border/40 transition-colors last:border-b-0",
          active
            ? "bg-cyan/[0.08] shadow-[inset_3px_0_0_0_rgba(34,211,238,0.7)]"
            : "hover:bg-terminal-card/30",
        )}
      >
        <td className="px-3 py-2.5">
          <span className="font-mono text-sm font-bold text-cyan">{row.ticker}</span>
          <span className="ml-2 text-[10px] text-terminal-muted">{row.name}</span>
        </td>
        <td className="px-2 py-2.5 font-mono text-xs tabular-nums text-red/90">
          {formatPoints(row.stopPoints)}
        </td>
        <td className="px-2 py-2.5 font-mono text-xs font-semibold tabular-nums text-cyan">
          {formatRub(row.riskPerLotRub)}
        </td>
        <VolCell value={row.beaconVolume} />
        <VolCell value={row.quarterVolume} />
        <VolCell value={row.halfVolume} />
        <VolCell value={row.highRisk ? 0 : row.baseVolume} primary warn={row.highRisk} />
        <VolCell value={row.highRisk ? 0 : row.doubleVolume} warn={row.highRisk} />
      </tr>
      {expanded ? (
        <tr className="bg-terminal-bg/60">
          <td colSpan={8} className="px-4 py-2">
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] text-terminal-muted">
              <span>Шаг {formatTickSize(row.tickSize)}</span>
              <span>Шаг/лот {formatRub(row.pointValueRub)}</span>
              <span>Slip {formatPoints(row.slipPoints)}</span>
              <span>Ком. вх. {formatPoints(row.entryCommissionPoints)}</span>
              <span>Ком. вых. {formatPoints(row.exitCommissionPoints)}</span>
              <span className="text-amber">
                Полный риск {formatPoints(row.fullRiskPoints)} ={" "}
                {formatRub(row.riskPerLotRub)}
              </span>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function VolCell({
  value,
  primary,
  warn,
}: {
  value: number;
  primary?: boolean;
  warn?: boolean;
}) {
  return (
    <td className="px-1.5 py-2.5 text-center">
      <span
        className={cn(
          "inline-flex min-w-[28px] justify-center rounded-md border px-1 py-0.5 font-mono text-xs font-bold tabular-nums",
          primary && !warn && "border-green/40 bg-green/10 text-green",
          warn && primary && "border-amber/40 bg-amber/10 text-amber",
          warn && !primary && "border-amber/30 text-amber/80",
          !primary && !warn && "border-terminal-border/40 text-terminal-text",
        )}
      >
        {warn && primary ? "—" : value}
      </span>
    </td>
  );
}
