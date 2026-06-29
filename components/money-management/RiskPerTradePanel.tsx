"use client";

import type { MoneyManagementResult, OrderSide } from "@/lib/money-management/types";
import { cn } from "@/lib/utils/format";
import { MmFormulaBar, MmInput, MmToggle } from "./ui";

interface RiskPerTradePanelProps {
  result: MoneyManagementResult;
  stopPoints: number;
  slippagePoints: number;
  entryOrderType: OrderSide;
  onStopPointsChange: (v: number) => void;
  onSlippageChange: (v: number) => void;
  onEntryTypeChange: (v: OrderSide) => void;
}

export function RiskPerTradePanel({
  result,
  stopPoints,
  slippagePoints,
  entryOrderType,
  onStopPointsChange,
  onSlippageChange,
  onEntryTypeChange,
}: RiskPerTradePanelProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 lg:grid-cols-[1fr_1fr_auto]">
        <MmInput
          label="Стоп"
          tooltip="Расстояние от входа до стопа в пунктах"
          value={stopPoints}
          onChange={onStopPointsChange}
          min={1}
          max={200}
          step={1}
          suffix="п."
          tone="red"
        />
        <MmInput
          label="Slip"
          tooltip="Запас на исполнение стопа рынком"
          value={slippagePoints}
          onChange={onSlippageChange}
          min={0}
          max={20}
          step={1}
          suffix="п."
          tone="amber"
        />
        <div>
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-terminal-muted">
            Вход
          </span>
          <div className="flex gap-1 rounded border border-terminal-border p-0.5">
            <MmToggle
              active={entryOrderType === "limit"}
              onClick={() => onEntryTypeChange("limit")}
              label="Лимит"
            />
            <MmToggle
              active={entryOrderType === "market"}
              onClick={() => onEntryTypeChange("market")}
              label="Рынок"
            />
          </div>
        </div>
      </div>

      {result.warnings.length > 0 ? (
        <div className="space-y-1">
          {result.warnings.map((w) => (
            <p
              key={w.code}
              className={cn(
                "rounded border px-2 py-1 text-[10px] leading-snug",
                w.code === "position_too_small"
                  ? "border-amber/30 bg-amber/5 text-amber"
                  : "border-red/30 bg-red/5 text-red",
              )}
            >
              {w.message}
            </p>
          ))}
        </div>
      ) : null}

      <MmFormulaBar
        parts={result.breakdown.map((p) => ({
          label: p.label.replace("Комиссия ", "Ком. ").replace("Стоп-лосс", "Стоп").replace("Проскальзывание", "Slip"),
          points: p.points,
          tone: p.tone,
        }))}
        totalPoints={result.riskPerLotPoints}
        totalRub={result.totalRiskPerLotRub}
      />
    </div>
  );
}
