"use client";

import type { ScreenerMode } from "@/lib/types/screener";
import { InstrumentCycleMap } from "@/components/screener/InstrumentCycleMap";

interface ScreenerIntroPanelProps {
  onModeSelect?: (mode: ScreenerMode) => void;
}

export function ScreenerIntroPanel({ onModeSelect }: ScreenerIntroPanelProps) {
  return (
    <section className="rounded-lg border border-terminal-border/70 bg-[#070B12] px-4 py-4 md:px-5">
      <h1 className="text-lg font-semibold tracking-tight md:text-xl">
        Отбор инструментов для торговли
      </h1>
      <p className="mt-2 max-w-4xl text-sm leading-relaxed text-terminal-muted">
        Инструмент сначала меняет состояние: стоит в боковике, ускоряется, уходит
        в тренд, корректируется, снова входит в диапазон или сжимается перед новым
        движением. Стратегия должна соответствовать состоянию инструмента.
      </p>

      <InstrumentCycleMap onModeSelect={onModeSelect} />
    </section>
  );
}
