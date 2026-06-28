"use client";

import type { EnrichedInstrument } from "@/lib/types/instrument";
import type { ScreenerMode } from "@/lib/types/screener";
import { InstrumentTagList } from "@/components/screener/InstrumentTag";
import { TradeCalculator } from "@/components/screener/TradeCalculator";
import {
  formatPct,
  formatPrice,
  formatRub,
  formatNumber,
  cn,
} from "@/lib/utils/format";

interface InstrumentInspectorProps {
  instrument: EnrichedInstrument | null;
  mode: ScreenerMode;
}

export function InstrumentInspector({ instrument }: InstrumentInspectorProps) {
  if (!instrument) {
    return (
      <div className="flex min-h-[480px] items-center justify-center rounded-lg border border-terminal-border bg-terminal-card p-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]">
        <p className="text-center text-sm text-terminal-muted">
          Выберите строку в таблице
          <br />
          для просмотра параметров и калькулятора
        </p>
      </div>
    );
  }

  const positive = (instrument.changePct ?? 0) >= 0;
  const expensiveSpread =
    instrument.spreadPct !== null && instrument.spreadPct >= 0.08;

  return (
    <div className="flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-lg border border-terminal-border bg-terminal-card lg:sticky lg:top-20">
      <div className="scrollbar-terminal overflow-y-auto p-4">
        {/* 1. Тикер + название + тип */}
        <div className="mb-4 border-b border-terminal-border pb-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-mono text-xl font-bold text-cyan">
                {instrument.ticker}
              </h3>
              <p className="text-xs text-terminal-muted">{instrument.name}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-bold">
                {formatPrice(instrument.price)} ₽
              </p>
              <p className={cn("font-mono text-xs", positive ? "text-green" : "text-red")}>
                {formatPct(instrument.changePct)}
              </p>
            </div>
          </div>
          <InstrumentTagList tags={instrument.visualTags} limit={4} />
          <p className="mt-2 text-[11px] text-terminal-muted">
            Тип: {instrument.typeLabels.join(" · ")}
          </p>
        </div>

        {/* 2. Главное */}
        <InspectorBlock title="Главное">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Metric label="Цена лота" value={formatRub(instrument.lotValue)} />
            <Metric
              label="Пункт/лот"
              value={formatRub(instrument.rubPerPointPerLot)}
              highlight
            />
            <Metric
              label="Цена шага"
              value={
                instrument.tickValueRub !== null
                  ? formatRub(instrument.tickValueRub)
                  : "—"
              }
            />
            <Metric
              label="Спред ₽"
              value={
                instrument.spreadRub !== null
                  ? `${instrument.spreadRub.toFixed(2)} ₽`
                  : "—"
              }
              tone={expensiveSpread ? "amber" : undefined}
            />
            <Metric
              label="Спред %"
              value={
                instrument.spreadPct !== null
                  ? `${instrument.spreadPct.toFixed(3)}%`
                  : "—"
              }
              tone={expensiveSpread ? "amber" : undefined}
            />
            <Metric
              label="Оборот"
              value={formatRub(instrument.turnoverRub, true)}
              tone="green"
            />
            <Metric
              label="Сделки"
              value={formatNumber(instrument.trades)}
              tone="green"
            />
          </div>
        </InspectorBlock>

        {/* 3. Почему подходит */}
        <InspectorBlock title="Почему подходит">
          <ul className="space-y-1.5 text-[11px] leading-relaxed text-terminal-text/85">
            {instrument.whyBullets.slice(0, 3).map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-cyan">·</span>
                {b}
              </li>
            ))}
          </ul>
        </InspectorBlock>

        {/* 4. Риск */}
        <InspectorBlock title="Риск">
          <ul className="space-y-1.5 text-[11px] leading-relaxed text-terminal-muted">
            {instrument.riskBullets.slice(0, 3).map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-red/80">!</span>
                {b}
              </li>
            ))}
          </ul>
        </InspectorBlock>

        {/* 5. Как использовать на занятии */}
        <InspectorBlock title="Как использовать на занятии">
          <ul className="space-y-1.5 text-[11px] leading-relaxed text-terminal-muted">
            {instrument.lessonTips.slice(0, 3).map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-violet">→</span>
                {t}
              </li>
            ))}
          </ul>
        </InspectorBlock>

        {/* 6. Калькулятор */}
        <div className="mt-2 border-t border-terminal-border pt-4">
          <TradeCalculator instrument={instrument} />
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "amber" | "green";
}) {
  const valueClass = highlight
    ? "text-cyan font-bold"
    : tone === "amber"
      ? "text-amber font-semibold"
      : tone === "green"
        ? "text-green"
        : "text-terminal-text";

  return (
    <div className="rounded border border-terminal-border/60 bg-terminal-surface/40 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-terminal-muted">
        {label}
      </p>
      <p className={`font-mono ${valueClass}`}>{value}</p>
    </div>
  );
}

function InspectorBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 border-t border-terminal-border pt-3 first:border-t-0 first:pt-0">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-terminal-muted">
        {title}
      </p>
      {children}
    </div>
  );
}
