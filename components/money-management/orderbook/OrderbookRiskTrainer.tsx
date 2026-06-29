"use client";

import type { InstrumentPreset } from "@/lib/money-management/instrument-presets";
import type { MoneyManagementResult } from "@/lib/money-management/types";
import { OrderbookControls } from "./OrderbookControls";
import { OrderbookVisual } from "./OrderbookVisual";

interface OrderbookRiskTrainerProps {
  preset: InstrumentPreset;
  instrumentId: string;
  entryPrice: number;
  stopPrice: number;
  slippagePoints: number;
  entryCommissionRub: number;
  exitCommissionRub: number;
  result: MoneyManagementResult;
  onInstrumentChange: (id: string) => void;
  onEntryChange: (v: number) => void;
  onStopChange: (v: number) => void;
  onEntryCommissionChange: (v: number) => void;
  onExitCommissionChange: (v: number) => void;
  onResetCommissions: () => void;
}

export function OrderbookRiskTrainer(props: OrderbookRiskTrainerProps) {
  const { preset, result, slippagePoints } = props;

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
      <OrderbookVisual
        preset={preset}
        entryPrice={props.entryPrice}
        stopPrice={props.stopPrice}
        slippagePoints={slippagePoints}
        result={result}
      />

      <OrderbookControls
        preset={preset}
        instrumentId={props.instrumentId}
        entryPrice={props.entryPrice}
        stopPrice={props.stopPrice}
        entryCommissionRub={props.entryCommissionRub}
        exitCommissionRub={props.exitCommissionRub}
        onInstrumentChange={props.onInstrumentChange}
        onEntryChange={props.onEntryChange}
        onStopChange={props.onStopChange}
        onEntryCommissionChange={props.onEntryCommissionChange}
        onExitCommissionChange={props.onExitCommissionChange}
        onResetCommissions={props.onResetCommissions}
      />
    </div>
  );
}
