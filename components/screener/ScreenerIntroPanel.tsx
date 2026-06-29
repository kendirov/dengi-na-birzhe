"use client";

import Link from "next/link";

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

export function ScreenerIntroPanel() {
  return (
    <section className="min-w-0 flex-1">
      <h1 className="text-base font-semibold tracking-tight md:text-lg">
        Отбор инструментов для торговли
      </h1>
      <p className="mt-0.5 text-xs text-terminal-muted md:text-sm">
        Сначала выбираем инструмент. Потом ищем сделку.{" "}
        <Link
          href="/lesson/orderbook"
          className="text-cyan/75 underline-offset-2 transition-colors hover:text-cyan hover:underline"
        >
          Что такое стакан?
        </Link>
      </p>

      <div className="mt-2.5 grid gap-2 md:grid-cols-2">
        {CARDS.map((card) => (
          <article
            key={card.title}
            className={`rounded border bg-[#06080c] px-3 py-2 ${accentBorder[card.accent]}`}
          >
            <h2 className={`text-xs font-semibold ${accentTitle[card.accent]}`}>
              {card.title}
            </h2>
            <p className="mt-0.5 text-[11px] leading-snug text-terminal-text/80">
              {card.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
