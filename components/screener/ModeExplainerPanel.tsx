"use client";

import type { ScreenerMode } from "@/lib/types/screener";
import { cn } from "@/lib/utils/format";

const MODE_TEXT: Partial<Record<ScreenerMode, { title: string; description: string }>> = {
  all: {
    title: "Все",
    description: "Все доступные акции.",
  },
  technical: {
    title: "Техничные",
    description: "Хорошо двигаются по графику.",
  },
  spread: {
    title: "Для стакана",
    description: "Отрабатывают плотности, айсберги и bid/ask.",
  },
};

interface ModeExplainerPanelProps {
  mode: ScreenerMode;
}

export function ModeExplainerPanel({ mode }: ModeExplainerPanelProps) {
  const config = MODE_TEXT[mode];
  if (!config) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-terminal-border/60 bg-terminal-surface/20 px-3 py-2",
        mode === "spread" && "border-amber/15",
        mode === "technical" && "border-cyan/15",
      )}
    >
      <h3 className="text-xs font-semibold text-terminal-text">{config.title}</h3>
      <p className="mt-0.5 text-[11px] text-terminal-muted">{config.description}</p>
    </div>
  );
}
