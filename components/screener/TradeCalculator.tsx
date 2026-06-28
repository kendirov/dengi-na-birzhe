"use client";

import { useMemo, useState } from "react";
import type { EnrichedInstrument } from "@/lib/types/instrument";
import {
  DEFAULT_LIMIT_COMMISSION_RATE,
  DEFAULT_MARKET_COMMISSION_RATE,
} from "@/lib/screener/commission";
import { calculateTrade, type OrderType } from "@/lib/screener/calculator";
import { formatRub } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";

interface TradeCalculatorProps {
  instrument: EnrichedInstrument;
}

export function TradeCalculator({ instrument }: TradeCalculatorProps) {
  const [lots, setLots] = useState(1);
  const [pointsMove, setPointsMove] = useState(5);
  const [orderType, setOrderType] = useState<OrderType>("limit");

  const result = useMemo(
    () =>
      calculateTrade({
        tickValueRub: instrument.tickValueRub,
        lotValue: instrument.lotValue,
        spreadRub: instrument.spreadRub,
        lotSize: instrument.lotSize,
        lots,
        stepsMove: pointsMove,
        orderType,
        commissionLimitRate: instrument.commissionLimitRate,
        commissionMarketRate: instrument.commissionMarketRate,
      }),
    [instrument, lots, pointsMove, orderType],
  );

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-surface/50 p-4">
      <p className="mb-3 text-xs uppercase tracking-wider text-cyan">
        Калькулятор {result.isEstimate && "(оценка)"}
      </p>

      <div className="mb-3 flex gap-1 rounded border border-terminal-border p-0.5">
        <OrderToggle
          active={orderType === "limit"}
          onClick={() => setOrderType("limit")}
          label="Лимитка"
        />
        <OrderToggle
          active={orderType === "market"}
          onClick={() => setOrderType("market")}
          label="Рынок"
        />
      </div>

      <div className="space-y-3">
        <CalcField
          label="Лотов"
          value={lots}
          onChange={setLots}
          min={1}
          max={100}
          step={1}
        />
        <CalcField
          label="Движение, пунктов"
          hint="1 пункт = 1 минимальный шаг цены"
          value={pointsMove}
          onChange={setPointsMove}
          min={1}
          max={200}
          step={1}
        />
      </div>

      <div className="mt-4 space-y-2 border-t border-terminal-border pt-3 font-mono text-xs">
        <CalcRow
          label="Валовый результат"
          value={formatRub(result.grossPnl)}
          tone={result.grossPnl >= 0 ? "green" : "red"}
        />
        <CalcRow
          label="Комиссия"
          value={formatRub(result.commissionRub)}
          tone="amber"
        />
        {orderType === "market" && (
          <CalcRow
            label="Спред / издержка входа"
            value={formatRub(result.spreadCostRub)}
            tone="amber"
          />
        )}
        <CalcRow
          label="Чистая оценка"
          value={formatRub(result.netPnl)}
          tone={result.netPnl >= 0 ? "green" : "red"}
          highlight
        />
        <CalcRow
          label="Безубыток, пунктов"
          value={
            result.breakevenSteps !== null
              ? result.breakevenSteps.toFixed(2)
              : "—"
          }
          tone="cyan"
        />
      </div>

      {!result.hasTickValue && (
        <p className="mt-2 text-[10px] text-amber">
          Нет данных по шагу цены — PnL не считается
        </p>
      )}
      <p className="mt-2 text-[10px] text-terminal-muted">
        Лимит {DEFAULT_LIMIT_COMMISSION_RATE * 100}% · Рынок{" "}
        {DEFAULT_MARKET_COMMISSION_RATE * 100}% — измените в настройках проекта
      </p>
    </div>
  );
}

function OrderToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded px-2 py-1 text-[10px] font-medium transition-colors",
        active
          ? "bg-cyan/15 text-cyan"
          : "text-terminal-muted hover:text-terminal-text",
      )}
    >
      {label}
    </button>
  );
}

function CalcField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] text-terminal-muted">{label}</span>
      {hint && (
        <span className="mb-1 block text-[9px] text-terminal-muted/80">{hint}</span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border border-terminal-border bg-terminal-bg px-2 py-1.5 font-mono text-sm focus:border-cyan/40 focus:outline-none"
      />
    </label>
  );
}

function CalcRow({
  label,
  value,
  tone,
  highlight,
}: {
  label: string;
  value: string;
  tone?: "green" | "red" | "amber" | "cyan";
  highlight?: boolean;
}) {
  const color =
    tone === "green"
      ? "text-green"
      : tone === "red"
        ? "text-red"
        : tone === "amber"
          ? "text-amber"
          : tone === "cyan"
            ? "text-cyan"
            : "text-terminal-text";

  return (
    <div className="flex justify-between gap-2">
      <span className="text-terminal-muted">{label}</span>
      <span className={cn(color, highlight && "font-bold")}>{value}</span>
    </div>
  );
}
