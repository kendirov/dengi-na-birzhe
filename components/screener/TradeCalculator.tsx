"use client";

import { useMemo, useState } from "react";
import type { EnrichedInstrument } from "@/lib/types/instrument";
import { DEFAULT_COMMISSION_RATE } from "@/lib/types/instrument";
import { calculateTrade } from "@/lib/screener/calculator";
import { formatRub } from "@/lib/utils/format";

interface TradeCalculatorProps {
  instrument: EnrichedInstrument;
}

export function TradeCalculator({ instrument }: TradeCalculatorProps) {
  const [lots, setLots] = useState(1);
  const [pointsMove, setPointsMove] = useState(5);
  const [commissionRate, setCommissionRate] = useState(
    instrument.defaultCommissionRate,
  );

  const result = useMemo(
    () =>
      calculateTrade({
        rubPerPointPerLot: instrument.rubPerPointPerLot,
        lotValue: instrument.lotValue,
        tickValueRub: instrument.tickValueRub ?? 0,
        lots,
        pointsMove,
        commissionRate,
      }),
    [instrument, lots, pointsMove, commissionRate],
  );

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-surface/50 p-4">
      <p className="mb-3 text-xs uppercase tracking-wider text-cyan">
        Калькулятор {result.isEstimate && "(оценка)"}
      </p>

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
          value={pointsMove}
          onChange={setPointsMove}
          min={1}
          max={200}
          step={1}
        />
        <CalcField
          label="Комиссия, %"
          value={+(commissionRate * 100).toFixed(4)}
          onChange={(v) => setCommissionRate(v / 100)}
          min={0.01}
          max={0.5}
          step={0.01}
        />
      </div>

      <div className="mt-4 space-y-2 border-t border-terminal-border pt-3 font-mono text-xs">
        <CalcRow
          label="PnL на движение"
          value={formatRub(result.grossPnl)}
          tone={result.grossPnl >= 0 ? "green" : "red"}
        />
        <CalcRow label="Стоимость шага" value={formatRub(result.tickCostTotal)} />
        <CalcRow
          label="Комиссия (оценка)"
          value={formatRub(result.commissionRub)}
          tone="amber"
        />
        <CalcRow
          label="Breakeven, пунктов"
          value={result.breakevenPoints.toFixed(2)}
          tone="cyan"
          highlight
        />
        <CalcRow
          label="Net PnL"
          value={formatRub(result.netPnl)}
          tone={result.netPnl >= 0 ? "green" : "red"}
        />
      </div>

      <p className="mt-2 text-[10px] text-terminal-muted">
        По умолчанию {DEFAULT_COMMISSION_RATE * 100}% — измените под свой тариф
      </p>
    </div>
  );
}

function CalcField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] text-terminal-muted">{label}</span>
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
            ? "text-cyan data-glow-cyan"
            : "text-terminal-text";

  return (
    <div className="flex justify-between gap-2">
      <span className="text-terminal-muted">{label}</span>
      <span className={`${color} ${highlight ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}
