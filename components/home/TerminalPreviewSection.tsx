"use client";

import { useEffect, useState } from "react";
import type { Instrument } from "@/lib/types/instrument";
import type { MarketSummary } from "@/lib/data/market-summary";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import {
  InstrumentMiniRow,
  InstrumentMiniRowHeader,
} from "@/components/ui/InstrumentMiniRow";
import { FadeInSection } from "@/components/ui/FadeInSection";
import { formatPct, formatRub } from "@/lib/utils/format";

interface TerminalPreviewSectionProps {
  summary: MarketSummary;
  rows: Instrument[];
}

export function TerminalPreviewSection({
  summary,
  rows,
}: TerminalPreviewSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % rows.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [rows.length]);

  const highlightedIndex = hoverIndex ?? activeIndex;
  const indexPositive = summary.indexChangePct >= 0;

  return (
    <FadeInSection delay={0.1}>
      <TerminalPanel title="TERMINAL PREVIEW" status="MOCK DATA">
        <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
          <div className="space-y-0 border-b border-terminal-border p-4 lg:border-b-0 lg:border-r">
            <MetricBlock
              label="Индекс МосБиржи"
              value={summary.indexValue.toFixed(2)}
              sub={formatPct(summary.indexChangePct)}
              positive={indexPositive}
              large
            />
            <MetricBlock
              label="Ликвидность"
              value={`${summary.liquidityScore}`}
              sub="score / 100"
              tone="cyan"
            />
            <MetricBlock
              label="Акции в игре"
              value={String(summary.inPlayCount)}
              sub="высокий оборот сегодня"
              tone="cyan"
            />
            <MetricBlock
              label="Волатильность"
              value={`${summary.avgVolatility}`}
              sub="средняя по watchlist"
              tone="amber"
            />
            <MetricBlock
              label="Топ оборота"
              value={summary.topTurnoverTicker}
              sub={formatRub(summary.topTurnoverRub, true)}
              tone="green"
            />
          </div>

          <div>
            <div className="border-b border-terminal-border px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-terminal-muted">
                {summary.sessionLabel} · топ по обороту
              </span>
            </div>
            <InstrumentMiniRowHeader />
            {rows.map((inst, i) => (
              <InstrumentMiniRow
                key={inst.ticker}
                rank={i + 1}
                ticker={inst.ticker}
                name={inst.name}
                price={inst.price}
                changePct={inst.changePct ?? 0}
                turnoverRub={inst.turnoverRub}
                highlighted={i === highlightedIndex}
                onHover={() => setHoverIndex(i)}
                onHoverEnd={() => setHoverIndex(null)}
              />
            ))}
          </div>
        </div>
      </TerminalPanel>
    </FadeInSection>
  );
}

function MetricBlock({
  label,
  value,
  sub,
  positive,
  large,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
  large?: boolean;
  tone?: "cyan" | "amber" | "green";
}) {
  const valueColor = positive !== undefined
    ? positive
      ? "text-green data-glow-green"
      : "text-red data-glow-red"
    : tone === "amber"
      ? "text-amber"
      : tone === "green"
        ? "text-green"
        : "text-cyan data-glow-cyan";

  return (
    <div className="border-b border-terminal-border/50 py-3 last:border-0">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-terminal-muted">
        {label}
      </p>
      <p
        className={`font-mono font-bold ${large ? "text-2xl" : "text-lg"} ${valueColor}`}
      >
        {value}
      </p>
      <p className="mt-0.5 font-mono text-[11px] text-terminal-muted">{sub}</p>
    </div>
  );
}
