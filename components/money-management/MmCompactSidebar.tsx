"use client";

import type { DailyPlanUiInput, DailyPlanUiResult } from "@/lib/money-management/types";
import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import type { LearningScenario } from "@/lib/money-management/scenarios";
import { getLearningScenario } from "@/lib/money-management/scenarios";
import {
  formatLots,
  formatPercent,
  formatPoints,
  formatRub,
} from "@/lib/money-management/format";
import { cn } from "@/lib/utils/format";

interface MmCompactSidebarProps {
  planInput: DailyPlanUiInput;
  plan: DailyPlanUiResult;
  selectedRow: VolumeRowResult | null;
  scenario: LearningScenario;
}

export function MmCompactSidebar({
  planInput,
  plan,
  selectedRow,
  scenario,
}: MmCompactSidebarProps) {
  const scenarioCfg = getLearningScenario(scenario);
  const displayVolume = selectedRow
    ? scenarioCfg.volumeHighlight === "reduced"
      ? selectedRow.reducedVolume
      : scenarioCfg.volumeHighlight === "increased"
        ? selectedRow.increasedVolume
        : selectedRow.baseVolume
    : 0;

  return (
    <aside className="space-y-2 lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-lg border border-terminal-border/70 bg-terminal-card/80 p-3">
        <p className="text-[9px] uppercase tracking-wider text-terminal-muted">
          Базовый объём
        </p>
        <p className="font-mono text-2xl font-bold tabular-nums text-cyan">
          {selectedRow ? formatLots(selectedRow.baseVolume) : "—"}
        </p>
        {selectedRow?.highRisk ? (
          <p className="mt-1 text-[10px] text-amber">Риск высокий — объём 0</p>
        ) : null}
        <div className="mt-2 space-y-1 border-t border-terminal-border/50 pt-2">
          <SummaryRow label="Риск на сделку" value={formatRub(plan.baseRiskPerTradeRub)} />
          <SummaryRow
            label="Риск на 1 лот"
            value={selectedRow ? formatRub(selectedRow.riskPerLotRub) : "—"}
          />
          {scenarioCfg.volumeHighlight !== "base" && selectedRow ? (
            <SummaryRow
              label={`Сценарий · ${scenarioCfg.label}`}
              value={formatLots(displayVolume)}
              tone={scenarioCfg.volumeHighlight === "increased" ? "amber" : "muted"}
            />
          ) : null}
          {scenarioCfg.warning && scenarioCfg.volumeHighlight === "increased" ? (
            <p className="text-[10px] text-amber/80">{scenarioCfg.warning}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-terminal-border/70 bg-terminal-card/60 p-2.5">
        <p className="mb-1.5 text-[9px] uppercase tracking-wider text-terminal-muted">
          План дня
        </p>
        <div className="space-y-1">
          <SummaryRow label="Депозит" value={formatRub(planInput.depositRub)} />
          <SummaryRow label="Просадка" value={formatRub(plan.dailyDrawdownRub)} tone="red" />
          <SummaryRow label="Цель" value={formatRub(plan.targetRub)} tone="green" />
          <SummaryRow label="Сделок" value={String(planInput.plannedTrades)} />
          <SummaryRow label="Цель %" value={formatPercent(planInput.dailyGoalPct)} />
        </div>
      </div>

      {selectedRow ? (
        <div className="rounded-lg border border-terminal-border/70 bg-terminal-card/60 p-2.5">
          <p className="mb-1.5 text-[9px] uppercase tracking-wider text-terminal-muted">
            {selectedRow.ticker}
          </p>
          <div className="space-y-1">
            <SummaryRow label="Полный риск" value={formatPoints(selectedRow.fullRiskPoints)} tone="amber" />
            <SummaryRow label="Стоп + slip" value={`${formatPoints(selectedRow.stopPoints + selectedRow.slipPoints)}`} />
            <SummaryRow
              label="Комиссии"
              value={`${formatPoints(selectedRow.entryCommissionPoints + selectedRow.exitCommissionPoints)}`}
              tone="amber"
            />
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "red" | "green" | "amber" | "muted";
}) {
  const color =
    tone === "red"
      ? "text-red"
      : tone === "green"
        ? "text-green"
        : tone === "amber"
          ? "text-amber"
          : tone === "muted"
            ? "text-terminal-muted"
            : "text-terminal-text";

  return (
    <div className="flex items-baseline justify-between gap-2 font-mono text-[11px]">
      <span className="text-terminal-muted">{label}</span>
      <span className={cn("tabular-nums", color)}>{value}</span>
    </div>
  );
}
