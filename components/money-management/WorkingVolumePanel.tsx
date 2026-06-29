"use client";

import { formatMmLotsDisplay } from "@/lib/money-management/format";
import type { LearningScenario } from "@/lib/money-management/scenarios";
import { getLearningScenario } from "@/lib/money-management/scenarios";
import type { MoneyManagementResult } from "@/lib/money-management/types";
import { formatRub, cn } from "@/lib/utils/format";
import { TrainerToggle } from "@/components/trainer";

interface WorkingVolumePanelProps {
  result: MoneyManagementResult;
  lotValueRub: number;
  scenario: LearningScenario;
  marketConfirmed: boolean;
  onMarketConfirmedChange: (v: boolean) => void;
}

export function WorkingVolumePanel({
  result,
  lotValueRub,
  scenario,
  marketConfirmed,
  onMarketConfirmedChange,
}: WorkingVolumePanelProps) {
  const highlight = getLearningScenario(scenario).volumeHighlight;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <TrainerToggle
          active={marketConfirmed}
          onClick={() => onMarketConfirmedChange(!marketConfirmed)}
          label="Рынок в игре"
        />
      </div>

      <div className="grid gap-1.5 md:grid-cols-3">
        <VolumeCard
          title="Пониженный"
          lots={result.reducedVolumeLots}
          exposureRub={result.reducedVolumeLots * lotValueRub}
          tone="cyan"
          active={highlight === "reduced"}
        />
        <VolumeCard
          title="Базовый"
          lots={result.baseVolumeLots}
          exposureRub={result.baseVolumeLots * lotValueRub}
          tone="green"
          active={highlight === "base"}
        />
        <VolumeCard
          title="Повышенный"
          lots={result.increasedVolumeLots}
          exposureRub={result.increasedVolumeLots * lotValueRub}
          tone="amber"
          active={highlight === "increased"}
          dimmed={!marketConfirmed && highlight === "increased"}
        />
      </div>
    </div>
  );
}

function VolumeCard({
  title,
  lots,
  exposureRub,
  tone,
  active,
  dimmed,
}: {
  title: string;
  lots: number;
  exposureRub: number;
  tone: "cyan" | "green" | "amber";
  active?: boolean;
  dimmed?: boolean;
}) {
  const border = {
    cyan: "border-cyan/20",
    green: "border-green/25",
    amber: "border-amber/20",
  }[tone];

  const valueColor = {
    cyan: "text-cyan",
    green: "text-green",
    amber: "text-amber",
  }[tone];

  return (
    <article
      className={cn(
        "rounded-lg border bg-terminal-bg/50 px-2.5 py-2 transition-opacity",
        border,
        active && "ring-1 ring-green/40 glow-green",
        dimmed && "opacity-40",
      )}
    >
      <p className="text-[9px] uppercase tracking-wider text-terminal-muted">
        {title}
        {active ? " · рек." : ""}
      </p>
      <p className={cn("font-mono text-lg font-bold tabular-nums", valueColor)}>
        {formatMmLotsDisplay(lots)}
      </p>
      <p className="font-mono text-[10px] text-terminal-muted">
        {lots > 0 ? formatRub(exposureRub) : "—"}
      </p>
    </article>
  );
}
