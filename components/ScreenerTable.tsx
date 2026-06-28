"use client";

import type { EnrichedInstrument } from "@/lib/types/instrument";
import type { SortColumn, SortDirection } from "@/lib/types/screener";
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
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  onSelect: (instrument: EnrichedInstrument) => void;
}

type ColumnDef = {
  key: SortColumn | "name";
  label: string;
  tooltip?: string;
  sortable?: boolean;
  tone?: "cyan" | "amber" | "default";
  align?: "left" | "right";
  minW?: string;
};

const COLUMNS: ColumnDef[] = [
  { key: "ticker", label: "Тикер", sortable: true, tone: "cyan", minW: "56px" },
  { key: "name", label: "Инструмент", minW: "88px" },
  { key: "price", label: "Цена", sortable: true, align: "right", minW: "64px" },
  { key: "lotValue", label: "Цена лота", sortable: true, align: "right", minW: "76px" },
  { key: "changePct", label: "%", sortable: true, align: "right", minW: "44px" },
  {
    key: "tickSize",
    label: "Шаг цены",
    sortable: true,
    align: "right",
    tooltip: "Минимальное изменение цены инструмента",
    minW: "56px",
  },
  {
    key: "tickValueRub",
    label: "Шаг/лот",
    sortable: true,
    align: "right",
    tone: "cyan",
    tooltip: "Сколько рублей даёт 1 минимальный шаг цены при позиции 1 лот",
    minW: "64px",
  },
  {
    key: "spreadTicks",
    label: "Спред, шагов",
    sortable: true,
    align: "right",
    tone: "amber",
    tooltip: "Сколько минимальных шагов между bid и ask",
    minW: "68px",
  },
  { key: "spreadRub", label: "Спред, ₽", sortable: true, align: "right", tone: "amber", minW: "60px" },
  { key: "spreadPct", label: "Спред, %", sortable: true, align: "right", tone: "amber", minW: "56px" },
  {
    key: "commissionLimitRub",
    label: "Ком. лимит, ₽",
    sortable: true,
    align: "right",
    minW: "72px",
  },
  {
    key: "commissionMarketRub",
    label: "Ком. рынок, ₽",
    sortable: true,
    align: "right",
    minW: "72px",
  },
  {
    key: "commissionLimitTicks",
    label: "Ком. лимит, шаг",
    sortable: true,
    align: "right",
    tone: "amber",
    tooltip: "Сколько шагов цены съедает лимитная комиссия",
    minW: "72px",
  },
  {
    key: "commissionMarketTicks",
    label: "Ком. рынок, шаг",
    sortable: true,
    align: "right",
    tone: "amber",
    tooltip: "Сколько шагов цены съедает рыночная комиссия",
    minW: "72px",
  },
  { key: "turnoverRub", label: "Оборот", sortable: true, align: "right", minW: "68px" },
  { key: "trades", label: "Сделки", sortable: true, align: "right", minW: "56px" },
  { key: "dayRangePct", label: "Диапазон", sortable: true, align: "right", minW: "56px" },
];

export function ScreenerTable({
  instruments,
  totalFiltered,
  selectedTicker,
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
      <div className="overflow-x-auto rounded-lg border border-terminal-border/80 bg-[#070b10] scrollbar-terminal">
        <table className="w-full min-w-[1280px] border-collapse text-left text-[11px]">
          <thead className="sticky top-0 z-10 bg-[#0a0f14]">
            <tr className="border-b border-terminal-border/70">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  title={col.tooltip}
                  className={cn(
                    "whitespace-nowrap px-2 py-1.5 text-[9px] font-medium uppercase tracking-wider",
                    col.align === "right" && "text-right",
                    col.tone === "cyan" && "text-cyan/90",
                    col.tone === "amber" && "text-amber/80",
                    !col.tone && "text-terminal-muted",
                    col.sortable && "cursor-pointer select-none hover:text-terminal-text",
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

function formatTicks(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return value.toFixed(digits);
}

function InstrumentRow({
  inst,
  selected,
  onSelect,
}: {
  inst: EnrichedInstrument;
  selected: boolean;
  onSelect: () => void;
}) {
  const positive = (inst.changePct ?? 0) >= 0;
  const expensiveEntry =
    inst.entryCostMarketTicks !== null && inst.entryCostMarketTicks >= 6;

  return (
    <tr
      onClick={onSelect}
      className={cn(
        "cursor-pointer border-b border-terminal-border/25 font-mono transition-colors",
        selected
          ? "bg-cyan/6 border-l-2 border-l-cyan"
          : "bg-[#080c11] hover:bg-[#0c1218]",
        expensiveEntry && !selected && "bg-red/[0.03]",
      )}
    >
      <td className="sticky left-0 z-[1] bg-inherit px-2 py-1.5">
        <span className="font-bold text-cyan">{inst.ticker}</span>
      </td>
      <td className="max-w-[100px] truncate px-2 py-1.5 text-terminal-muted/90">
        {inst.name}
      </td>
      <td className="px-2 py-1.5 text-right text-terminal-text/90">
        {formatPrice(inst.price)}
      </td>
      <td className="px-2 py-1.5 text-right">{formatRub(inst.lotValue)}</td>
      <td className={cn("px-2 py-1.5 text-right", positive ? "text-green" : "text-red")}>
        {formatPct(inst.changePct)}
      </td>
      <td className="px-2 py-1.5 text-right text-terminal-muted/80">
        {inst.tickSize !== null ? inst.tickSize : "—"}
      </td>
      <td className="px-2 py-1.5 text-right">
        <span className="font-semibold text-cyan">
          {formatNullableRub(inst.tickValueRub)}
        </span>
      </td>
      <td className="px-2 py-1.5 text-right text-amber/90">
        {formatTicks(inst.spreadTicks, 0)}
      </td>
      <td className="px-2 py-1.5 text-right text-amber/85">
        {inst.spreadRub !== null ? inst.spreadRub.toFixed(2) : "—"}
      </td>
      <td className="px-2 py-1.5 text-right text-amber/80">
        {inst.spreadPct !== null ? `${inst.spreadPct.toFixed(3)}%` : "—"}
      </td>
      <td className="px-2 py-1.5 text-right text-terminal-text/75">
        {formatRub(inst.commissionLimitRub)}
      </td>
      <td className="px-2 py-1.5 text-right text-terminal-text/75">
        {formatRub(inst.commissionMarketRub)}
      </td>
      <td className="px-2 py-1.5 text-right text-amber/85">
        {formatTicks(inst.commissionLimitTicks)}
      </td>
      <td className="px-2 py-1.5 text-right text-amber/85">
        {formatTicks(inst.commissionMarketTicks)}
      </td>
      <td className="px-2 py-1.5 text-right">{formatRub(inst.turnoverRub, true)}</td>
      <td className="px-2 py-1.5 text-right">{formatNumber(inst.trades)}</td>
      <td className="px-2 py-1.5 text-right">
        {inst.dayRangePct !== null ? `${inst.dayRangePct.toFixed(1)}%` : "—"}
      </td>
    </tr>
  );
}
