"use client";

import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import {
  formatPoints,
  formatRub,
  formatTickSize,
} from "@/lib/money-management/format";
import { cn } from "@/lib/utils/format";

interface WorkingVolumeTableProps {
  rows: VolumeRowResult[];
  selectedId: string;
  onSelect: (id: string) => void;
}

type CellRole =
  | "default"
  | "commission"
  | "stop"
  | "slip"
  | "fullRisk"
  | "riskRub"
  | "beacon"
  | "quarter"
  | "half"
  | "full"
  | "double";

interface ColumnDef {
  key: keyof VolumeRowResult | "name";
  label: string;
  group?: "drive";
  role: CellRole;
  rub?: boolean;
}

const DRIVE_COLUMNS: ColumnDef[] = [
  { key: "beaconVolume", label: "Маячок", group: "drive", role: "beacon" },
  { key: "quarterVolume", label: "1/4", group: "drive", role: "quarter" },
  { key: "halfVolume", label: "1/2", group: "drive", role: "half" },
  { key: "baseVolume", label: "Полный", group: "drive", role: "full" },
  { key: "doubleVolume", label: "x2", group: "drive", role: "double" },
];

const BASE_COLUMNS: ColumnDef[] = [
  { key: "name", label: "Инструмент", role: "default" },
  { key: "ticker", label: "Тикер", role: "default" },
  { key: "tickSize", label: "Шаг цены", role: "default" },
  { key: "pointValueRub", label: "Шаг/лот, ₽", role: "default", rub: true },
  { key: "entryCommissionPoints", label: "Ком. вход, п.", role: "commission" },
  { key: "exitCommissionPoints", label: "Ком. выход, п.", role: "commission" },
  { key: "stopPoints", label: "Стоп, п.", role: "stop" },
  { key: "slipPoints", label: "Slip, п.", role: "slip" },
  { key: "fullRiskPoints", label: "Полный риск, п.", role: "fullRisk" },
  { key: "riskPerLotRub", label: "Риск / 1 лот, ₽", role: "riskRub", rub: true },
  ...DRIVE_COLUMNS,
];

const ROLE_CELL: Record<CellRole, string> = {
  default: "",
  commission: "bg-amber/[0.08] text-amber",
  stop: "bg-red/[0.1] text-red",
  slip: "bg-violet/[0.1] text-violet",
  fullRisk: "bg-amber/[0.14] text-amber font-semibold",
  riskRub: "bg-cyan/[0.1] text-cyan text-base font-bold data-glow-cyan",
  beacon: "bg-terminal-card/80 text-terminal-text",
  quarter: "bg-slate-500/10 text-slate-300",
  half: "bg-cyan/[0.12] text-cyan font-semibold",
  full: "bg-green/[0.14] text-green font-bold text-base data-glow-green",
  double: "bg-green/[0.2] text-green font-bold text-base",
};

const ROLE_HEAD: Record<CellRole, string> = {
  default: "text-terminal-muted",
  commission: "bg-amber/[0.06] text-amber/90",
  stop: "bg-red/[0.06] text-red/90",
  slip: "bg-violet/[0.06] text-violet/90",
  fullRisk: "bg-amber/[0.08] text-amber",
  riskRub: "bg-cyan/[0.08] text-cyan",
  beacon: "bg-terminal-card/60 text-terminal-muted",
  quarter: "bg-slate-500/[0.08] text-slate-400",
  half: "bg-cyan/[0.08] text-cyan/90",
  full: "bg-green/[0.08] text-green",
  double: "bg-green/[0.1] text-green",
};

export function WorkingVolumeTable({
  rows,
  selectedId,
  onSelect,
}: WorkingVolumeTableProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-terminal-text">Рабочий объём</h2>
        {rows.some((r) => r.highRisk) ? (
          <p className="text-xs text-amber">
            Риск высокий — полный объём меньше 1 лота
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-terminal-border/80">
        <table className="w-full min-w-[1280px] border-collapse font-mono text-[13px]">
          <thead>
            <tr className="border-b border-terminal-border/70 bg-terminal-card/50">
              {BASE_COLUMNS.map((col) =>
                col.group === "drive" ? null : (
                  <th
                    key={col.key}
                    rowSpan={2}
                    className={cn(
                      "whitespace-nowrap px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider",
                      ROLE_HEAD[col.role],
                    )}
                  >
                    {col.label}
                  </th>
                ),
              )}
              <th
                colSpan={DRIVE_COLUMNS.length}
                className="border-l border-terminal-border/60 bg-green/[0.05] px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-green/90"
              >
                5 рабочих объёмов для привода
              </th>
            </tr>
            <tr className="border-b border-terminal-border/70 bg-terminal-card/40">
              {DRIVE_COLUMNS.map((col) => (
                <th
                  key={`drive-${col.key}`}
                  className={cn(
                    "whitespace-nowrap border-l border-terminal-border/30 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider",
                    ROLE_HEAD[col.role],
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onSelect(row.id)}
                className={cn(
                  "cursor-pointer border-b border-terminal-border/40 transition-colors hover:bg-terminal-card/50",
                  selectedId === row.id && "bg-cyan/[0.06] ring-1 ring-inset ring-cyan/25",
                  row.highRisk && "bg-red/[0.03]",
                )}
              >
                {BASE_COLUMNS.map((col) => (
                  <VolumeCell
                    key={`${row.id}-${col.key}`}
                    col={col}
                    row={row}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VolumeCell({
  col,
  row,
}: {
  col: ColumnDef;
  row: VolumeRowResult;
}) {
  const value = col.key === "name" ? row.name : row[col.key as keyof VolumeRowResult];
  const isDrive = col.group === "drive";
  const highRiskDouble = col.role === "double" && row.highRisk;

  let display: React.ReactNode;
  if (typeof value === "number") {
    if (col.rub) display = formatRub(value);
    else if (col.key === "tickSize") display = formatTickSize(value);
    else if (col.key.includes("Points") || col.key === "fullRiskPoints")
      display = formatPoints(value);
    else if (isDrive) {
      if (row.highRisk && col.key === "baseVolume") {
        display = <span className="text-amber">0</span>;
      } else if (row.highRisk && col.key === "doubleVolume") {
        display = <span className="text-amber">0</span>;
      } else {
        display = String(value);
      }
    } else display = String(value);
  } else {
    display = String(value);
  }

  return (
    <td
      className={cn(
        "whitespace-nowrap px-2.5 py-3 tabular-nums",
        col.key === "name" || col.key === "ticker" ? "text-left" : "text-right",
        col.group === "drive" && "border-l border-terminal-border/30",
        ROLE_CELL[col.role],
        highRiskDouble && "bg-amber/[0.12] text-amber",
        col.rub && "text-[15px]",
        isDrive && "text-[15px]",
      )}
    >
      {display}
    </td>
  );
}
