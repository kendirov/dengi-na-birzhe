"use client";

import type { EnrichedInstrument } from "@/lib/types/instrument";
import type { SortColumn, SortDirection, ScreenerMode } from "@/lib/types/screener";
import { getModeScore } from "@/lib/types/screener";
import {
  formatPct,
  formatPrice,
  formatRub,
  formatNumber,
  formatNullableRub,
  cn,
} from "@/lib/utils/format";

interface ScreenerTableProps {
  instruments: EnrichedInstrument[];
  totalFiltered?: number;
  selectedTicker?: string;
  mode: ScreenerMode;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  onSelect: (instrument: EnrichedInstrument) => void;
}

type ColumnDef = {
  key: SortColumn | "name" | "type" | "why";
  label: string;
  sortable?: boolean;
  highlight?: boolean;
  secondary?: boolean;
  align?: "left" | "right";
  minW?: string;
};

const PRIMARY_COLUMNS: ColumnDef[] = [
  { key: "ticker", label: "Тикер", sortable: true, minW: "64px" },
  { key: "name", label: "Инструмент", minW: "88px" },
  { key: "price", label: "Цена", sortable: true, align: "right", minW: "64px" },
  { key: "changePct", label: "%", sortable: true, align: "right", minW: "48px" },
  { key: "lotValue", label: "Цена лота", sortable: true, align: "right", minW: "80px" },
  {
    key: "rubPerPointPerLot",
    label: "Пункт/лот",
    sortable: true,
    align: "right",
    highlight: true,
    minW: "72px",
  },
  { key: "tickSize", label: "Шаг", sortable: true, align: "right", minW: "44px" },
  { key: "tickValueRub", label: "Цена шага", sortable: true, align: "right", minW: "68px" },
  { key: "spreadRub", label: "Спред ₽", sortable: true, align: "right", minW: "60px" },
  { key: "spreadPct", label: "Спред %", sortable: true, align: "right", minW: "56px" },
  { key: "turnoverRub", label: "Оборот", sortable: true, align: "right", minW: "68px" },
  { key: "trades", label: "Сделки", sortable: true, align: "right", minW: "56px" },
  { key: "dayRangePct", label: "Диапазон", sortable: true, align: "right", minW: "56px" },
  { key: "type", label: "Тип", minW: "72px" },
  { key: "why", label: "Почему", minW: "140px" },
];

const SECONDARY_COLUMNS: ColumnDef[] = [
  { key: "lotSize", label: "Лот", sortable: true, align: "right", secondary: true, minW: "48px" },
  { key: "spreadTicks", label: "Спред шагов", sortable: true, align: "right", secondary: true, minW: "64px" },
  { key: "bigLotRub", label: "1% 20д", sortable: true, align: "right", secondary: true, minW: "60px" },
  { key: "score", label: "Оценка", sortable: true, align: "right", secondary: true, minW: "48px" },
  { key: "entryCostRub", label: "Вход ₽", sortable: true, align: "right", secondary: true, minW: "60px" },
];

const COLUMNS = [...PRIMARY_COLUMNS, ...SECONDARY_COLUMNS];

export function ScreenerTable({
  instruments,
  totalFiltered,
  selectedTicker,
  mode,
  sortColumn,
  sortDirection,
  onSort,
  onSelect,
}: ScreenerTableProps) {
  return (
    <div className="space-y-2">
      {totalFiltered !== undefined && totalFiltered > instruments.length && (
        <p className="text-[10px] text-terminal-muted">
          Показано {instruments.length} из {totalFiltered} по фильтрам
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-terminal-border bg-terminal-card scrollbar-terminal">
        <table className="w-full min-w-[1200px] border-collapse text-left text-[11px]">
          <thead className="sticky top-0 z-10 bg-terminal-surface">
            <tr className="border-b border-terminal-border">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-2 py-1.5 font-medium uppercase tracking-wider",
                    col.secondary ? "text-terminal-muted/60 text-[9px]" : "text-terminal-muted",
                    col.align === "right" && "text-right",
                    col.highlight && "bg-cyan/5 text-cyan",
                    col.sortable && "cursor-pointer select-none hover:text-cyan",
                  )}
                  style={{ minWidth: col.minW }}
                  onClick={() =>
                    col.sortable && onSort(col.key as SortColumn)
                  }
                >
                  {col.label}
                  {col.sortable && sortColumn === col.key && (
                    <span className="ml-0.5 text-cyan">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {instruments.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-10 text-center text-terminal-muted"
                >
                  Нет инструментов по выбранным фильтрам
                </td>
              </tr>
            ) : (
              instruments.map((inst) => (
                <InstrumentRow
                  key={inst.ticker}
                  inst={inst}
                  mode={mode}
                  selected={inst.ticker === selectedTicker}
                  onSelect={() => onSelect(inst)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InstrumentRow({
  inst,
  mode,
  selected,
  onSelect,
}: {
  inst: EnrichedInstrument;
  mode: ScreenerMode;
  selected: boolean;
  onSelect: () => void;
}) {
  const positive = (inst.changePct ?? 0) >= 0;
  const score = getModeScore(inst, mode);
  const expensiveSpread =
    inst.spreadPct !== null && inst.spreadPct >= 0.08;
  const dangerous = inst.dangerousScore >= 60;

  return (
    <tr
      onClick={onSelect}
      className={cn(
        "cursor-pointer border-b border-terminal-border/40 font-mono transition-colors",
        selected ? "bg-cyan/8 border-l-2 border-l-cyan" : "hover:bg-terminal-surface/80",
        dangerous && !selected && "bg-red/3",
      )}
    >
      <td className="sticky left-0 z-[1] bg-inherit px-2 py-1.5">
        <span className="font-bold text-cyan">{inst.ticker}</span>
      </td>
      <td className="max-w-[100px] truncate px-2 py-1.5 text-terminal-muted">
        {inst.name}
      </td>
      <td className="px-2 py-1.5 text-right">{formatPrice(inst.price)}</td>
      <td className={cn("px-2 py-1.5 text-right", positive ? "text-green" : "text-red")}>
        {formatPct(inst.changePct)}
      </td>
      <td className="px-2 py-1.5 text-right">{formatRub(inst.lotValue)}</td>
      <td className="bg-cyan/5 px-2 py-1.5 text-right">
        <span className="font-bold text-cyan">{formatRub(inst.rubPerPointPerLot)}</span>
      </td>
      <td className="px-2 py-1.5 text-right text-terminal-muted">
        {inst.tickSize !== null ? inst.tickSize : "—"}
      </td>
      <td className="px-2 py-1.5 text-right">
        {formatNullableRub(inst.tickValueRub)}
      </td>
      <td className={cn("px-2 py-1.5 text-right", expensiveSpread ? "text-amber font-semibold" : "text-amber/90")}>
        {inst.spreadRub !== null ? inst.spreadRub.toFixed(2) : "—"}
      </td>
      <td className="px-2 py-1.5 text-right text-amber/90">
        {inst.spreadPct !== null ? `${inst.spreadPct.toFixed(3)}%` : "—"}
      </td>
      <td className="px-2 py-1.5 text-right">{formatRub(inst.turnoverRub, true)}</td>
      <td className="px-2 py-1.5 text-right">{formatNumber(inst.trades)}</td>
      <td className="px-2 py-1.5 text-right">
        {inst.dayRangePct !== null ? `${inst.dayRangePct.toFixed(1)}%` : "—"}
      </td>
      <td className="max-w-[90px] truncate px-2 py-1.5 text-[10px] text-violet/90">
        {inst.typeLabels.join(", ")}
      </td>
      <td className="max-w-[160px] truncate px-2 py-1.5 text-[10px] text-terminal-muted">
        {inst.whyShort}
      </td>
      <td className="px-2 py-1.5 text-right text-[10px] text-terminal-muted/70">
        {formatNumber(inst.lotSize)}
      </td>
      <td className="px-2 py-1.5 text-right text-[10px] text-terminal-muted/70">
        {inst.spreadTicks !== null ? inst.spreadTicks.toFixed(0) : "—"}
      </td>
      <td className="px-2 py-1.5 text-right text-[10px] text-terminal-muted/70">
        {inst.bigLotRub !== null
          ? formatRub(inst.bigLotRub, true)
          : "нет базы"}
      </td>
      <td className="px-2 py-1.5 text-right text-[10px] text-terminal-muted/70">{score}</td>
      <td className={cn("px-2 py-1.5 text-right text-[10px]", expensiveSpread ? "text-amber" : "text-terminal-muted/70")}>
        {formatNullableRub(inst.entryCostRub)}
      </td>
    </tr>
  );
}
