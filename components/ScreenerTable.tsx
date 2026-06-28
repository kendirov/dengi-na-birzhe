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
  zone?: "price" | "spread" | "commission" | "activity";
};

const ZONE_LABELS: Record<NonNullable<ColumnDef["zone"]>, string> = {
  price: "цена / лот",
  spread: "шаг / spread",
  commission: "комиссия",
  activity: "активность",
};

const COLUMNS: ColumnDef[] = [
  { key: "ticker", label: "Тикер", sortable: true, tone: "cyan", minW: "56px", zone: "price" },
  { key: "name", label: "Инструмент", minW: "88px", zone: "price" },
  { key: "price", label: "Цена", sortable: true, align: "right", minW: "64px", zone: "price" },
  { key: "lotValue", label: "Цена лота", sortable: true, align: "right", minW: "76px", zone: "price" },
  { key: "changePct", label: "%", sortable: true, align: "right", minW: "44px", zone: "price" },
  {
    key: "tickSize",
    label: "Шаг цены",
    sortable: true,
    align: "right",
    tooltip: "Минимальное изменение цены инструмента",
    minW: "56px",
    zone: "spread",
  },
  {
    key: "tickValueRub",
    label: "Шаг/лот",
    sortable: true,
    align: "right",
    tone: "cyan",
    tooltip: "Сколько рублей даёт 1 минимальный шаг цены при позиции 1 лот",
    minW: "64px",
    zone: "spread",
  },
  {
    key: "spreadTicks",
    label: "Спред, пунктов",
    sortable: true,
    align: "right",
    tone: "amber",
    tooltip: "Сколько минимальных шагов цены между bid и ask.",
    minW: "68px",
    zone: "spread",
  },
  { key: "spreadRub", label: "Спред, ₽", sortable: true, align: "right", tone: "amber", minW: "60px", zone: "spread" },
  { key: "spreadPct", label: "Спред, %", sortable: true, align: "right", tone: "amber", minW: "56px", zone: "spread" },
  {
    key: "commissionLimitRub",
    label: "Ком. лимит, ₽",
    sortable: true,
    align: "right",
    minW: "72px",
    zone: "commission",
  },
  {
    key: "commissionMarketRub",
    label: "Ком. рынок, ₽",
    sortable: true,
    align: "right",
    minW: "72px",
    zone: "commission",
  },
  {
    key: "commissionLimitTicks",
    label: "Ком. лимит, п.",
    sortable: true,
    align: "right",
    tone: "amber",
    tooltip: "Сколько пунктов нужно пройти, чтобы отбить лимитную комиссию.",
    minW: "72px",
    zone: "commission",
  },
  {
    key: "commissionMarketTicks",
    label: "Ком. рынок, п.",
    sortable: true,
    align: "right",
    tone: "amber",
    tooltip: "Сколько пунктов нужно пройти, чтобы отбить рыночную комиссию.",
    minW: "72px",
    zone: "commission",
  },
  { key: "turnoverRub", label: "Оборот", sortable: true, align: "right", minW: "68px", zone: "activity" },
  { key: "trades", label: "Сделки", sortable: true, align: "right", minW: "56px", zone: "activity" },
  { key: "dayRangePct", label: "Диапазон", sortable: true, align: "right", minW: "56px", zone: "activity" },
];

function zoneSpan(zone: NonNullable<ColumnDef["zone"]>): number {
  return COLUMNS.filter((c) => c.zone === zone).length;
}

const ZONE_ROW: { zone: NonNullable<ColumnDef["zone"]>; span: number }[] = [
  { zone: "price", span: zoneSpan("price") },
  { zone: "spread", span: zoneSpan("spread") },
  { zone: "commission", span: zoneSpan("commission") },
  { zone: "activity", span: zoneSpan("activity") },
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
      <p className="text-[10px] text-terminal-muted">
        Прокрутите вправо: комиссии и активность.
      </p>
      <div className="overflow-x-auto rounded-lg border border-terminal-border/80 bg-[#070b10] scrollbar-terminal">
        <table className="w-full min-w-[1280px] border-collapse text-left text-[11px]">
          <thead className="sticky top-0 z-20 bg-[#0a0f14]">
            <tr className="border-b border-terminal-border/40">
              {ZONE_ROW.map(({ zone, span }) => (
                <th
                  key={zone}
                  colSpan={span}
                  className={cn(
                    "px-2 py-1 text-[8px] font-semibold uppercase tracking-wider text-terminal-muted/80",
                    zone === "price" && "sticky left-0 z-30 bg-[#0a0f14]",
                    zone === "spread" && "bg-cyan/[0.03]",
                    zone === "commission" && "bg-amber/[0.03]",
                    zone === "activity" && "bg-green/[0.03]",
                  )}
                >
                  {ZONE_LABELS[zone]}
                </th>
              ))}
            </tr>
            <tr className="border-b border-terminal-border/70">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  title={col.tooltip}
                  className={cn(
                    "whitespace-nowrap px-2 py-1.5 text-[9px] font-medium uppercase tracking-wider",
                    col.key === "ticker" && "sticky left-0 z-30 bg-[#0a0f14]",
                    col.zone === "spread" && "bg-cyan/[0.02]",
                    col.zone === "commission" && "bg-amber/[0.02]",
                    col.zone === "activity" && "bg-green/[0.02]",
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

function formatPoints(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return value.toFixed(digits);
}

function spreadPointsClass(points: number | null): string {
  if (points === null) return "text-amber/85";
  if (points >= 4) return "font-semibold text-amber";
  return "text-amber/90";
}

function commissionPointsClass(points: number | null): string {
  if (points === null) return "text-amber/85";
  if (points >= 3) return "font-semibold text-amber";
  return "text-amber/85";
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
  const spreadPoints = inst.spreadTicks;
  const marketEntryPoints = inst.entryCostMarketTicks;
  const expensiveEntry =
    marketEntryPoints !== null && marketEntryPoints >= 8;
  const wideSpread = spreadPoints !== null && spreadPoints >= 4;

  return (
    <tr
      onClick={onSelect}
      className={cn(
        "cursor-pointer border-b border-terminal-border/25 font-mono transition-colors",
        selected
          ? "bg-cyan/10 ring-1 ring-inset ring-cyan/25"
          : "bg-[#080c11] hover:bg-[#0c1218]",
        (expensiveEntry || wideSpread) && !selected && "bg-red/[0.03]",
      )}
    >
      <td
        className={cn(
          "sticky left-0 z-[1] border-r border-terminal-border/30 px-2 py-1.5",
          selected ? "bg-[#0a1520]" : "bg-inherit",
        )}
      >
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
      <td className={cn("px-2 py-1.5 text-right", spreadPointsClass(spreadPoints))}>
        {formatPoints(spreadPoints, 0)}
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
      <td className={cn("px-2 py-1.5 text-right", commissionPointsClass(inst.commissionLimitTicks))}>
        {formatPoints(inst.commissionLimitTicks)}
      </td>
      <td
        className={cn(
          "px-2 py-1.5 text-right",
          commissionPointsClass(inst.commissionMarketTicks),
          expensiveEntry && "text-red/90",
        )}
      >
        {formatPoints(inst.commissionMarketTicks)}
      </td>
      <td className="px-2 py-1.5 text-right">{formatRub(inst.turnoverRub, true)}</td>
      <td className="px-2 py-1.5 text-right">{formatNumber(inst.trades)}</td>
      <td className="px-2 py-1.5 text-right">
        {inst.dayRangePct !== null ? `${inst.dayRangePct.toFixed(1)}%` : "—"}
      </td>
    </tr>
  );
}
