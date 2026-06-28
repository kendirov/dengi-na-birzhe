"use client";

import type { ScreenerMode } from "@/lib/types/screener";
import { InstrumentCycleScene } from "@/components/screener/InstrumentCycleScene";

interface ScreenerIntroPanelProps {
  mode?: ScreenerMode;
  onModeSelect?: (mode: ScreenerMode) => void;
}

export function ScreenerIntroPanel({ mode, onModeSelect }: ScreenerIntroPanelProps) {
  return (
    <section className="rounded-lg border border-terminal-border/70 bg-[#05070D] px-4 py-4 md:px-5">
      <h1 className="text-lg font-semibold tracking-tight md:text-xl">
        Отбор инструментов для торговли
      </h1>
      <p className="mt-2 max-w-4xl text-sm leading-relaxed text-terminal-muted">
        Сначала определяем состояние инструмента: стоит, ускоряется, трендит,
        корректируется, входит в диапазон или делает вынос. Под каждое состояние
        нужна своя стратегия.
      </p>

      <InstrumentCycleScene activeMode={mode} onSelectMode={onModeSelect} />
    </section>
  );
}
