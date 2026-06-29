"use client";

import { formatMmLotsDisplay } from "@/lib/money-management/format";
import type { DailyPlanUiResult, MoneyManagementResult } from "@/lib/money-management/types";
import { formatRub } from "@/lib/utils/format";
import { TrainerHeroBar, TrainerInsightBanner } from "@/components/trainer";

interface MmHeroSummaryProps {
  depositRub: number;
  dailyPlan: DailyPlanUiResult;
  result: MoneyManagementResult;
}

export function MmHeroSummary({
  depositRub,
  dailyPlan,
  result,
}: MmHeroSummaryProps) {
  return (
    <div className="space-y-2">
      <TrainerHeroBar
        chips={[
          { label: "Депозит", value: formatRub(depositRub) },
          {
            label: "Просадка",
            value: formatRub(dailyPlan.dailyDrawdownRub),
            tone: "red",
          },
          {
            label: "Цель",
            value: formatRub(dailyPlan.targetRub),
            tone: "green",
          },
          {
            label: "Риск / сделку",
            value: formatRub(result.baseRiskPerTradeRub),
            tone: "cyan",
          },
          {
            label: "Объём",
            value: formatMmLotsDisplay(result.maxPositionLots),
            tone: "accent",
            highlight: true,
            className: "col-span-2 sm:col-span-1",
          },
        ]}
      />

      <TrainerInsightBanner
        text="Объём позиции считается не от желания, а от риска."
        trailing={
          <>
            {formatMmLotsDisplay(result.maxPositionLots)} ={" "}
            {formatRub(result.baseRiskPerTradeRub)} /{" "}
            {formatRub(result.totalRiskPerLotRub)}
          </>
        }
      />
    </div>
  );
}
