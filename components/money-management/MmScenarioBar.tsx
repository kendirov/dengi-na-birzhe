"use client";

import {
  LEARNING_SCENARIOS,
  type LearningScenario,
} from "@/lib/money-management/scenarios";
import { TrainerPresetBar } from "@/components/trainer";

interface MmScenarioBarProps {
  active: LearningScenario;
  onChange: (scenario: LearningScenario) => void;
}

export function MmScenarioBar({ active, onChange }: MmScenarioBarProps) {
  return (
    <TrainerPresetBar
      options={LEARNING_SCENARIOS.map((s) => ({
        id: s.id,
        label: s.label,
        tooltip: s.tooltip,
        tone:
          s.id === "aggressive"
            ? "amber"
            : s.id === "cautious"
              ? "cyan"
              : "green",
      }))}
      active={active}
      onChange={onChange}
    />
  );
}
