"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { DailyPlanUiInput, DailyPlanUiResult, OrderSide } from "@/lib/money-management/types";
import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import type { LearningScenario } from "@/lib/money-management/scenarios";
import { WorkingVolumeTable } from "./WorkingVolumeTable";
import { StopPresetPanel } from "./StopPresetPanel";
import { CalcDebugPanel } from "./CalcDebugPanel";
import { RiskFormulaBar } from "./RiskFormulaBar";
import { cn } from "@/lib/utils/format";

const DepositDynamicsPanel = dynamic(
  () => import("./DepositDynamicsPanel").then((m) => m.DepositDynamicsPanel),
  { ssr: false },
);

interface RiskDetailsAccordionProps {
  expanded: boolean;
  onToggle: () => void;
  planInput: DailyPlanUiInput;
  plan: DailyPlanUiResult;
  allRows: VolumeRowResult[];
  selectedRow: VolumeRowResult | null;
  selectedId: string;
  onSelect: (id: string) => void;
  scenario: LearningScenario;
  stopPoints: number;
  slipPoints: number;
  entryOrderType: OrderSide;
  exitOrderType: OrderSide;
  onStopChange: (v: number) => void;
  onSlipChange: (v: number) => void;
  onEntryTypeChange: (v: OrderSide) => void;
  onExitTypeChange: (v: OrderSide) => void;
  onScenarioChange: (s: LearningScenario) => void;
  onInstrumentChange: (id: string) => void;
}

export function RiskDetailsAccordion({
  expanded,
  onToggle,
  planInput,
  plan,
  allRows,
  selectedRow,
  selectedId,
  onSelect,
  scenario,
  stopPoints,
  slipPoints,
  entryOrderType,
  exitOrderType,
  onStopChange,
  onSlipChange,
  onEntryTypeChange,
  onExitTypeChange,
  onScenarioChange,
  onInstrumentChange,
}: RiskDetailsAccordionProps) {
  const [debugOpen, setDebugOpen] = useState(false);

  return (
    <section className="border-t border-terminal-border/40 pt-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl border border-terminal-border/60 bg-terminal-card/20 px-4 py-3 text-left transition-colors hover:border-terminal-border hover:bg-terminal-card/30"
      >
        <span className="text-sm font-medium text-terminal-text">Подробнее</span>
        <span
          className={cn(
            "font-mono text-xs text-terminal-muted transition-transform",
            expanded && "rotate-180",
          )}
        >
          ▼
        </span>
      </button>

      {expanded ? (
        <div className="mt-3 space-y-4">
          {selectedRow ? (
            <RiskFormulaBar
              stopPoints={selectedRow.stopPoints}
              slipPoints={selectedRow.slipPoints}
              entryCommissionPoints={selectedRow.entryCommissionPoints}
              exitCommissionPoints={selectedRow.exitCommissionPoints}
              fullRiskPoints={selectedRow.fullRiskPoints}
              riskPerLotRub={selectedRow.riskPerLotRub}
              riskPerTradeRub={plan.baseRiskPerTradeRub}
              baseVolume={selectedRow.baseVolume}
            />
          ) : null}

          <StopPresetPanel
            selectedId={selectedId}
            scenario={scenario}
            stopPoints={stopPoints}
            slipPoints={slipPoints}
            entryOrderType={entryOrderType}
            exitOrderType={exitOrderType}
            onInstrumentChange={onInstrumentChange}
            onScenarioChange={onScenarioChange}
            onStopChange={onStopChange}
            onSlipChange={onSlipChange}
            onEntryTypeChange={onEntryTypeChange}
            onExitTypeChange={onExitTypeChange}
          />

          <WorkingVolumeTable
            rows={allRows}
            selectedId={selectedId}
            onSelect={onSelect}
          />

          <DepositDynamicsPanel planInput={planInput} plan={plan} />

          <CalcDebugPanel show={debugOpen} onToggle={() => setDebugOpen((v) => !v)} />
        </div>
      ) : null}
    </section>
  );
}
