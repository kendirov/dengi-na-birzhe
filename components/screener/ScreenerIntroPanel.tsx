"use client";

import type { ReactNode } from "react";

const CARDS = [
  {
    title: "Техничные",
    text: "Хорошо двигаются по графику.",
    accent: "cyan" as const,
  },
  {
    title: "Для стакана",
    text: "Отрабатывают плотности, айсберги и bid/ask.",
    accent: "amber" as const,
  },
] as const;

const accentBorder = {
  cyan: "border-cyan/20",
  amber: "border-amber/20",
};

const accentTitle = {
  cyan: "text-cyan/90",
  amber: "text-amber/90",
};

interface ScreenerIntroPanelProps {
  statusSlot?: ReactNode;
}

export function ScreenerIntroPanel({ statusSlot }: ScreenerIntroPanelProps) {
  return (
    <section className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold tracking-tight md:text-base">
            Отбор инструментов для торговли
          </h1>
          <p className="mt-px text-[11px] text-terminal-muted md:text-xs">
            Сначала выбираем инструмент. Потом ищем сделку.
          </p>
        </div>
        {statusSlot ? (
          <div className="shrink-0 pt-0.5">{statusSlot}</div>
        ) : null}
      </div>

      <div className="mt-1 grid gap-1.5 md:grid-cols-2">
        {CARDS.map((card) => (
          <article
            key={card.title}
            className={`rounded border bg-[#06080c] px-2.5 py-1.5 ${accentBorder[card.accent]}`}
          >
            <h2 className={`text-[11px] font-semibold ${accentTitle[card.accent]}`}>
              {card.title}
            </h2>
            <p className="mt-px text-[11px] leading-snug text-terminal-text/80">
              {card.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
