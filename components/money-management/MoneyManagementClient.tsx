"use client";

import { useCallback, useMemo, useState } from "react";
import { calculateVolumeTable } from "@/lib/money-management";
import {
  DEFAULT_DAILY_PLAN,
  DEFAULT_INSTRUMENT_ID,
  DEFAULT_SLIPPAGE_POINTS,
  STOCK_PRESETS,
} from "@/lib/money-management/defaults";
import {
  computeDailyPlan,
  computeFeaturedMatrix,
} from "@/lib/money-management/risk-engine";
import {
  DEFAULT_LEARNING_SCENARIO,
  getLearningScenario,
  type LearningScenario,
} from "@/lib/money-management/scenarios";
import {
  resolveStopPoints,
  type StopMode,
} from "@/lib/money-management/stop-mode";
import type { DailyPlanUiInput, OrderSide } from "@/lib/money-management/types";
import { DepositScenario } from "./DepositScenario";
import { DetailsAccordion } from "./DetailsAccordion";
import { DriveVolumeKeys } from "./DriveVolumeKeys";
import { InstrumentVolumeTable } from "./InstrumentVolumeTable";
import { PlanDayStrip, type ValueMode } from "./PlanDayStrip";
import { RiskFormulaScene } from "./RiskFormulaScene";
import { RiskToVolumeBridge } from "./RiskToVolumeBridge";
import { StopPresetPanel as StopPresetPanelCompact } from "./StopPresetPanelCompact";

export function MoneyManagementClient() {
  const [planInput, setPlanInput] = useState<DailyPlanUiInput>(DEFAULT_DAILY_PLAN);
  const [drawdownMode, setDrawdownMode] = useState<ValueMode>("rub");
  const [goalMode, setGoalMode] = useState<ValueMode>("pct");
  const [selectedId, setSelectedId] = useState(DEFAULT_INSTRUMENT_ID);
  const [stopMode, setStopMode] = useState<StopMode>("normal");
  const [customStopPoints, setCustomStopPoints] = useState(20);
  const [expanded, setExpanded] = useState(false);

  const [slipPoints, setSlipPoints] = useState(DEFAULT_SLIPPAGE_POINTS);
  const [entryOrderType, setEntryOrderType] = useState<OrderSide>("limit");
  const [exitOrderType, setExitOrderType] = useState<OrderSide>("market");
  const [expandScenario, setExpandScenario] =
    useState<LearningScenario>(DEFAULT_LEARNING_SCENARIO);
  const [expandStopOverride, setExpandStopOverride] = useState<number | null>(null);

  const plan = useMemo(() => computeDailyPlan(planInput), [planInput]);

  const calcParams = useMemo(
    () => ({
      slipPoints,
      entryOrderType,
      exitOrderType,
      riskPerTradeRub: plan.baseRiskPerTradeRub,
    }),
    [slipPoints, entryOrderType, exitOrderType, plan.baseRiskPerTradeRub],
  );

  const featuredRows = useMemo(
    () =>
      computeFeaturedMatrix({
        stopMode,
        customStopPoints,
        ...calcParams,
      }),
    [stopMode, customStopPoints, calcParams],
  );

  const selectedRow = useMemo(
    () => featuredRows.find((r) => r.id === selectedId) ?? featuredRows[0] ?? null,
    [featuredRows, selectedId],
  );

  const allRows = useMemo(() => {
    const expandStop =
      expandStopOverride ??
      resolveStopPoints(selectedId, expandScenario, customStopPoints);
    const stops: Record<string, number> = {};
    for (const p of STOCK_PRESETS) {
      stops[p.id] =
        p.id === selectedId
          ? expandStop
          : resolveStopPoints(p.id, expandScenario, customStopPoints);
    }
    return calculateVolumeTable({
      presets: STOCK_PRESETS,
      stopPointsById: stops,
      ...calcParams,
    });
  }, [
    expandStopOverride,
    expandScenario,
    selectedId,
    customStopPoints,
    calcParams,
  ]);

  const expandStopPoints =
    expandStopOverride ??
    resolveStopPoints(selectedId, expandScenario, customStopPoints);

  const applyExpandScenario = useCallback((next: LearningScenario) => {
    const cfg = getLearningScenario(next);
    setExpandScenario(next);
    setSlipPoints(cfg.slippagePoints);
    setExpandStopOverride(null);
  }, []);

  const patchPlan = (patch: Partial<DailyPlanUiInput>) => {
    setPlanInput((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 pb-8">
      <PlanDayStrip
        input={planInput}
        plan={plan}
        drawdownMode={drawdownMode}
        goalMode={goalMode}
        onDrawdownModeChange={setDrawdownMode}
        onGoalModeChange={setGoalMode}
        onChange={patchPlan}
      />

      <RiskFormulaScene
        drawdownRub={planInput.drawdownRub}
        plannedTrades={planInput.plannedTrades}
        riskPerTradeRub={plan.baseRiskPerTradeRub}
        row={selectedRow}
      />

      <RiskToVolumeBridge
        riskPerTradeRub={plan.baseRiskPerTradeRub}
        riskPerLotRub={selectedRow?.riskPerLotRub ?? 0}
        fullVolume={selectedRow?.baseVolume ?? 0}
        highRisk={selectedRow?.highRisk ?? false}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <DriveVolumeKeys row={selectedRow} ticker={selectedRow?.ticker ?? "—"} />

        <div className="rounded-xl border border-terminal-border/60 bg-terminal-card/20 px-4 py-4">
          <StopPresetPanelCompact
            instrumentId={selectedId}
            ticker={selectedRow?.ticker ?? "—"}
            stopMode={stopMode}
            customStopPoints={customStopPoints}
            onStopModeChange={setStopMode}
            onCustomStopChange={setCustomStopPoints}
          />
        </div>
      </div>

      <InstrumentVolumeTable
        rows={featuredRows}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <DepositScenario planInput={planInput} plan={plan} />

      <DetailsAccordion
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        planInput={planInput}
        plan={plan}
        allRows={allRows}
        selectedRow={selectedRow}
        selectedId={selectedId}
        onSelect={setSelectedId}
        scenario={expandScenario}
        stopPoints={expandStopPoints}
        slipPoints={slipPoints}
        entryOrderType={entryOrderType}
        exitOrderType={exitOrderType}
        onStopChange={setExpandStopOverride}
        onSlipChange={setSlipPoints}
        onEntryTypeChange={setEntryOrderType}
        onExitTypeChange={setExitOrderType}
        onScenarioChange={applyExpandScenario}
        onInstrumentChange={setSelectedId}
      />

      <p className="text-center text-[10px] text-terminal-muted">
        Рабочий объём · LI-комиссии · не инвестрекомендация
      </p>
    </div>
  );
}
