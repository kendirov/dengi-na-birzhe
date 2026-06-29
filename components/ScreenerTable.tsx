"use client";



import type { ReactNode } from "react";

import type { EnrichedInstrument } from "@/lib/types/instrument";

import type { ScreenerMode, SortColumn, SortDirection } from "@/lib/types/screener";

import type { TrainingPickMeta } from "@/lib/screener/training-picks";

import {

  formatPct,

  formatPrice,

  formatRub,

  formatNumber,

  formatNullableRub,

  formatCommissionRubValue,

  cn,

} from "@/lib/utils/format";

import { TABLE_HEADER_TOOLTIPS, commissionTooltip } from "@/lib/screener/drive-basics-terms";



interface ScreenerTableProps {

  instruments: EnrichedInstrument[];

  totalFiltered?: number;

  selectedTicker?: string;

  mode?: ScreenerMode;

  trainingMeta?: Map<string, TrainingPickMeta>;

  sortColumn: SortColumn;

  sortDirection: SortDirection;

  onSort: (column: SortColumn) => void;

  onSelect: (instrument: EnrichedInstrument) => void;

}



type ColumnKey = SortColumn | "name";



type ColumnDef = {

  key: ColumnKey;

  label: string;

  tooltip?: string;

  sortable?: boolean;

  align?: "left" | "right";

  minW?: string;

  tone?: "cyan" | "amber" | "muted";

};



const TABLE_COLUMNS: ColumnDef[] = [

  {

    key: "ticker",

    label: "Тикер",

    sortable: true,

    tone: "cyan",

    minW: "52px",

    tooltip: TABLE_HEADER_TOOLTIPS.ticker,

  },

  {

    key: "name",

    label: "Инструмент",

    minW: "88px",

    tooltip: TABLE_HEADER_TOOLTIPS.name,

  },

  { key: "price", label: "Цена", sortable: true, align: "right", minW: "64px" },

  { key: "changePct", label: "%", sortable: true, align: "right", minW: "44px" },

  {

    key: "trades",

    label: "Сделки",

    sortable: true,

    align: "right",

    minW: "56px",

    tooltip: TABLE_HEADER_TOOLTIPS.trades,

  },

  {

    key: "turnoverRub",

    label: "Оборот",

    sortable: true,

    align: "right",

    minW: "68px",

    tooltip: TABLE_HEADER_TOOLTIPS.turnoverRub,

  },

  {

    key: "dayRangePct",

    label: "Диапазон",

    sortable: true,

    align: "right",

    minW: "56px",

    tooltip: TABLE_HEADER_TOOLTIPS.dayRangePct,

  },

  {

    key: "lotValue",

    label: "Цена лота",

    sortable: true,

    align: "right",

    minW: "76px",

    tooltip: TABLE_HEADER_TOOLTIPS.lotValue,

  },

  {

    key: "tickValueRub",

    label: "Шаг/лот",

    sortable: true,

    align: "right",

    tone: "cyan",

    minW: "64px",

    tooltip: TABLE_HEADER_TOOLTIPS.tickValueRub,

  },

  {

    key: "spreadTicks",

    label: "Спред, п.",

    sortable: true,

    align: "right",

    tone: "amber",

    minW: "64px",

    tooltip: TABLE_HEADER_TOOLTIPS.spreadTicks,

  },

  {

    key: "spreadPct",

    label: "Спред, %",

    sortable: true,

    align: "right",

    tone: "amber",

    minW: "56px",

  },

  {

    key: "commissionRub",

    label: "Комиссия, ₽",

    sortable: true,

    align: "right",

    minW: "88px",

    tooltip: TABLE_HEADER_TOOLTIPS.commissionRub,

  },

  {

    key: "commissionPoints",

    label: "Комиссия, п.",

    sortable: true,

    align: "right",

    tone: "amber",

    minW: "72px",

    tooltip: TABLE_HEADER_TOOLTIPS.commissionPoints,

  },

];



const TECHNICAL_EMPHASIS: ColumnKey[] = [

  "trades",

  "turnoverRub",

  "dayRangePct",

  "changePct",

];



const SPREAD_EMPHASIS: ColumnKey[] = [

  "trades",

  "spreadTicks",

  "tickValueRub",

  "commissionPoints",

];



const HEADER_TH =

  "bg-[#0a0f14] px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider border-b border-terminal-border/70";



function emphasisClass(col: ColumnKey, mode?: ScreenerMode): string {

  if (mode === "technical" && TECHNICAL_EMPHASIS.includes(col)) {

    return "font-semibold text-terminal-text";

  }

  if (mode === "spread" && SPREAD_EMPHASIS.includes(col)) {

    return col === "trades"

      ? "font-semibold text-terminal-text"

      : "font-semibold text-amber";

  }

  return "";

}



function CommissionRubCell({ inst }: { inst: EnrichedInstrument }) {
  return (
    <span
      className="text-terminal-text/90"
      title={commissionTooltip(inst.commissionSource, "rub")}
    >
      {formatCommissionRubValue(inst.commissionMarketRub)}
      <span className="text-terminal-muted/65">
        {" "}
        ({formatCommissionRubValue(inst.commissionLimitRub)})
      </span>
    </span>
  );
}

function CommissionPointsCell({ inst }: { inst: EnrichedInstrument }) {
  const market = inst.commissionMarketPoints;
  const limit = inst.commissionLimitPoints;
  if (market === null && limit === null) return <span>—</span>;

  return (
    <span
      className="text-amber/90"
      title={commissionTooltip(inst.commissionSource, "points")}
    >
      {market !== null ? String(market) : "—"}
      {limit !== null && (
        <span className="text-amber/55"> ({limit})</span>
      )}
    </span>
  );
}



export function ScreenerTable({

  instruments,

  totalFiltered,

  selectedTicker,

  mode,

  trainingMeta,

  sortColumn,

  sortDirection,

  onSort,

  onSelect,

}: ScreenerTableProps) {

  return (

    <div className="min-w-0 space-y-2">

      {totalFiltered !== undefined && totalFiltered > instruments.length && (

        <p className="text-[10px] text-terminal-muted">

          Показано {instruments.length} из {totalFiltered} по фильтрам

        </p>

      )}

      {mode === "training" && (

        <p className="text-[10px] text-violet/90">

          Учебная выборка: 12 примеров.

        </p>

      )}

      <div className="overflow-x-auto rounded-lg border border-terminal-border/80 bg-[#070b10] scrollbar-terminal">

        <table className="screener-table w-full min-w-[1080px] border-separate border-spacing-0 text-left">

          <thead>

            <tr>

              {TABLE_COLUMNS.map((col) => (

                <th

                  key={col.key}

                  title={col.tooltip}

                  className={cn(

                    HEADER_TH,

                    "whitespace-nowrap",

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

                  colSpan={TABLE_COLUMNS.length}

                  className="px-4 py-10 text-center text-terminal-muted"

                >

                  <p>Нет инструментов по текущим фильтрам.</p>

                  <p className="mt-1 text-[11px] text-terminal-muted/80">

                    Попробуйте отключить часть фильтров.

                  </p>

                </td>

              </tr>

            ) : (

              instruments.map((inst) => (

                <InstrumentRow

                  key={inst.ticker}

                  inst={inst}

                  mode={mode}

                  trainingMeta={trainingMeta?.get(inst.ticker)}

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



function formatSpreadPoints(value: number | null, digits = 0): string {

  if (value === null) return "—";

  return value.toFixed(digits);

}



const TRAINING_BADGE_TONE: Record<

  TrainingPickMeta["verdict"],

  string

> = {

  yes: "border-green/30 bg-green/10 text-green",

  caution: "border-amber/30 bg-amber/10 text-amber",

  no: "border-red/30 bg-red/10 text-red",

};



function InstrumentRow({

  inst,

  mode,

  trainingMeta,

  selected,

  onSelect,

}: {

  inst: EnrichedInstrument;

  mode?: ScreenerMode;

  trainingMeta?: TrainingPickMeta;

  selected: boolean;

  onSelect: () => void;

}) {

  const positive = (inst.changePct ?? 0) >= 0;



  const cellRenderers: Record<ColumnKey, ReactNode> = {

    ticker: <span className="font-bold text-cyan">{inst.ticker}</span>,

    name: (

      <div className="max-w-[120px]">

        <span className="block truncate text-terminal-muted/90">{inst.name}</span>

        {trainingMeta && (

          <span

            className={cn(

              "mt-0.5 inline-block rounded border px-1 py-px text-[8px] font-medium leading-tight",

              TRAINING_BADGE_TONE[trainingMeta.verdict],

            )}

          >

            {trainingMeta.roleLabel}

          </span>

        )}

      </div>

    ),

    price: <span className="font-medium text-terminal-text">{formatPrice(inst.price)}</span>,

    changePct: (

      <span className={positive ? "text-green" : "text-red"}>

        {formatPct(inst.changePct)}

      </span>

    ),

    trades: (

      <span className="text-terminal-text/90">{formatNumber(inst.trades)}</span>

    ),

    turnoverRub: (

      <span className="text-terminal-text/85">{formatRub(inst.turnoverRub, true)}</span>

    ),

    dayRangePct:

      inst.dayRangePct !== null ? `${inst.dayRangePct.toFixed(1)}%` : "—",

    lotValue: formatRub(inst.lotValue),

    tickValueRub: formatNullableRub(inst.tickValueRub),

    spreadTicks: formatSpreadPoints(inst.spreadTicks, 0),

    spreadPct:

      inst.spreadPct !== null ? `${inst.spreadPct.toFixed(3)}%` : "—",

    commissionRub: <CommissionRubCell inst={inst} />,

    commissionPoints: <CommissionPointsCell inst={inst} />,

    tickSize: null,

    spreadRub: null,

    score: null,

    entryCostRub: null,

    rubPerPointPerLot: null,

  };



  return (

    <tr

      onClick={onSelect}

      className={cn(

        "border-b border-terminal-border/25 font-mono transition-colors",

        selected

          ? "bg-cyan/15 ring-1 ring-inset ring-cyan/45"

          : "bg-[#080c11] hover:bg-[#0c1218]",

      )}

    >

      {TABLE_COLUMNS.map((col) => (

        <td

          key={col.key}

          className={cn(

            "px-2 py-1 leading-tight",

            col.align === "right" && "text-right",

            col.tone === "amber" && !emphasisClass(col.key, mode) && "text-amber/90",

            col.tone === "cyan" && "text-cyan/90",

            col.key === "commissionRub" && "text-terminal-text/90",

            emphasisClass(col.key, mode),

          )}

        >

          {cellRenderers[col.key]}

        </td>

      ))}

    </tr>

  );

}

