"use client";

import dynamic from "next/dynamic";
import type { DailyPlanUiInput, DailyPlanUiResult, OrderSide } from "@/lib/money-management/types";
import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import type { LearningScenario } from "@/lib/money-management/scenarios";
import { WorkingVolumeTable } from "./WorkingVolumeTable";
import { StopPresetPanel } from "./StopPresetPanel";
import { CommonMistakesPanel } from "./CommonMistakesPanel";
import { HowToUsePanel } from "./HowToUsePanel";
import { cn } from "@/lib/utils/format";

const DepositDynamicsPanel = dynamic(
  () =>
    import("./DepositDynamicsPanel").then((m) => m.DepositDynamicsPanel),
  { ssr: false },
);

interface MmExpandPanelProps {
  expanded: boolean;
  onToggle: () => void;
  planInput: DailyPlanUiInput;
  plan: DailyPlanUiResult;
  allRows: VolumeRowResult[];
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

export function MmExpandPanel({
  expanded,
  onToggle,
  planInput,
  plan,
  allRows,
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
}: MmExpandPanelProps) {
  return (
    <section className="border-t border-terminal-border/50 pt-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl border border-terminal-border/60 bg-terminal-card/30 px-4 py-3 text-left transition-colors hover:border-terminal-border"
      >
        <span className="text-sm font-medium text-terminal-text">
          Расширить / подробности
        </span>
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

          <HowToUsePanel />
          <CommonMistakesPanel />
        </div>
      ) : null}
    </section>
  );
}
