"use client";

import type { EnrichedInstrument } from "@/lib/types/instrument";
import type { ScreenerMode } from "@/lib/types/screener";
import type { TrainingPickMeta } from "@/lib/screener/training-picks";
import { InstrumentTagList } from "@/components/screener/InstrumentTag";
import { TradeCalculator } from "@/components/screener/TradeCalculator";
import { buildBeginnerExplanation } from "@/lib/screener/insights";
import {
  buildErrorPriceSummary,
  DRIVE_CHECKLIST,
  ORDER_BOOK_CHECKLIST,
  getInstrumentDecision,
  type InstrumentDecisionStatus,
} from "@/lib/screener/instrument-decision";
import { isLowLiquidityWarning } from "@/lib/screener/liquidity-filters";
import {
  formatPct,
  formatPrice,
  formatCommissionRubDisplay,
  formatRub,
  formatNumber,
  cn,
} from "@/lib/utils/format";

interface InstrumentInspectorProps {
  instrument: EnrichedInstrument | null;
  mode: ScreenerMode;
  trainingMeta?: TrainingPickMeta;
}

function formatPoints(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return value.toFixed(digits);
}

const DECISION_STYLES: Record<
  InstrumentDecisionStatus,
  { dot: string; text: string; border: string }
> = {
  study: {
    dot: "bg-green",
    text: "text-green",
    border: "border-green/25 bg-green/[0.06]",
  },
  orderbook: {
    dot: "bg-amber",
    text: "text-amber",
    border: "border-amber/25 bg-amber/[0.06]",
  },
  skip: {
    dot: "bg-red",
    text: "text-red",
    border: "border-red/25 bg-red/[0.06]",
  },
};

export function InstrumentInspector({ instrument, mode, trainingMeta }: InstrumentInspectorProps) {
  if (!instrument) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-terminal-border bg-terminal-card p-4 lg:sticky lg:top-14 lg:z-10 lg:max-h-[calc(100vh-3.75rem)]">
        <p className="text-center text-sm text-terminal-muted">
          Выберите строку в таблице
          <br />
          для просмотра параметров и калькулятора
        </p>
      </div>
    );
  }

  const positive = (instrument.changePct ?? 0) >= 0;
  const isTrainingMode = mode === "training" && trainingMeta;
  const isOrderBookMode = mode === "spread";
  const orderBookPick = isOrderBookMode && instrument.spreadTradable;
  const decision = orderBookPick
    ? {
        status: "orderbook" as InstrumentDecisionStatus,
        label: "Только через стакан",
        message: `Спред ${instrument.spreadTicks?.toFixed(0) ?? "—"} пунктов — проверить bid/ask, ленту и плотности перед входом.`,
      }
    : getInstrumentDecision(instrument);
  const decisionStyle = DECISION_STYLES[decision.status];
  const errorPrice = buildErrorPriceSummary(instrument);
  const whyBullets = isTrainingMode
    ? [trainingMeta.lesson]
    : buildBeginnerExplanation(
        instrument,
        isOrderBookMode ? "spread" : mode,
      );
  const checklist = isOrderBookMode ? ORDER_BOOK_CHECKLIST : DRIVE_CHECKLIST;
  const checklistTitle = isOrderBookMode
    ? "Чеклист для стакана"
    : "Что проверить в приводе";
  const lowLiquidity = isLowLiquidityWarning(instrument);

  return (
    <div className="flex max-h-[calc(100vh-3.75rem)] flex-col overflow-hidden rounded-lg border border-terminal-border bg-terminal-card lg:sticky lg:top-14 lg:z-10">
      <div className="scrollbar-terminal overflow-y-auto p-3">
        <div className="mb-3 border-b border-terminal-border pb-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-mono text-lg font-bold text-cyan">
                {instrument.ticker}
              </h3>
              <p className="text-[11px] text-terminal-muted">{instrument.name}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-base font-bold">
                {formatPrice(instrument.price)} ₽
              </p>
              <p className={cn("font-mono text-xs", positive ? "text-green" : "text-red")}>
                {formatPct(instrument.changePct)}
              </p>
            </div>
          </div>
          <InstrumentTagList tags={instrument.visualTags} limit={4} />
          {lowLiquidity ? (
            <p className="mt-2 rounded border border-amber/25 bg-amber/[0.06] px-2 py-1.5 text-[11px] text-amber">
              Осторожно: низкий оборот или мало сделок.
            </p>
          ) : null}
        </div>

        {isTrainingMode && (
          <div className="mb-4 rounded border border-violet/25 bg-violet/[0.06] px-2.5 py-2">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet">
                Учебный вывод
              </p>
              <span
                className={cn(
                  "rounded border px-1.5 py-0.5 text-[9px] font-medium",
                  trainingMeta.verdict === "yes" && "border-green/30 text-green",
                  trainingMeta.verdict === "caution" && "border-amber/30 text-amber",
                  trainingMeta.verdict === "no" && "border-red/30 text-red",
                )}
              >
                {trainingMeta.verdictLabel}
              </span>
              <span className="rounded border border-terminal-border/50 px-1.5 py-0.5 text-[9px] text-terminal-muted">
                {trainingMeta.roleLabel}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-terminal-text/90">
              {trainingMeta.lesson}
            </p>
          </div>
        )}

        <div
          className={cn(
            "mb-4 flex items-start gap-2 rounded border px-2.5 py-2",
            decisionStyle.border,
          )}
        >
          <span
            className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", decisionStyle.dot)}
            aria-hidden
          />
          <div className="min-w-0">
            <p className={cn("text-[10px] font-semibold uppercase tracking-wider", decisionStyle.text)}>
              Решение по инструменту: {decision.label}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-terminal-muted">
              {decision.message}
            </p>
          </div>
        </div>

        <InspectorBlock title="Цена ошибки">
          <div className="space-y-1.5 text-[11px]">
            <ErrorRow
              label="1 шаг против"
              value={
                errorPrice.oneStepRub !== null
                  ? `${formatRub(errorPrice.oneStepRub)} на 1 лот`
                  : "—"
              }
            />
            <ErrorRow
              label="Spread"
              value={
                errorPrice.spreadPoints !== null
                  ? `${formatPoints(errorPrice.spreadPoints, 0)} п. / ${errorPrice.spreadRub !== null ? `${errorPrice.spreadRub.toFixed(2)} ₽` : "—"}`
                  : "—"
              }
              tone="amber"
            />
            <ErrorRow
              label="Лимитка"
              value={`${formatPoints(errorPrice.limitEntryPoints)} п. комиссии`}
            />
            <ErrorRow
              label="Рынок"
              value={`${formatPoints(errorPrice.marketEntryPoints)} п. входа`}
              highlight={
                errorPrice.marketEntryPoints !== null &&
                errorPrice.marketEntryPoints >= 8
              }
            />
            <ErrorRow
              label="5 шагов против"
              value={
                errorPrice.fiveStepRub !== null
                  ? formatRub(errorPrice.fiveStepRub)
                  : "—"
              }
              highlight
            />
          </div>
        </InspectorBlock>

        <InspectorBlock title={checklistTitle}>
          <ul className="space-y-1 text-[10px] leading-snug text-terminal-muted">
            {checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 h-3 w-3 shrink-0 rounded border border-terminal-border/70 bg-[#080E18]" />
                {item}
              </li>
            ))}
          </ul>
        </InspectorBlock>

        <InspectorBlock title="Комиссия">
          <div className="space-y-1.5 text-[11px]">
            <CommissionRow
              label="Рынок"
              rub={instrument.commissionMarketRub}
              points={instrument.commissionMarketPoints}
            />
            <CommissionRow
              label="Лимит"
              rub={instrument.commissionLimitRub}
              points={instrument.commissionLimitPoints}
            />
            <CommissionRow
              label="Шаг/лот"
              rub={instrument.tickValueRub}
              points={null}
              rubOnly
            />
          </div>
          <p className="mt-2 text-[10px] text-terminal-muted">
            Пункты = комиссия ₽ / шаг/лот, округление вверх.
          </p>
          <p className="mt-1 text-[10px] text-terminal-muted/80">
            Источник:{" "}
            {instrument.commissionSource === "liveinvest"
              ? "LiveInvesting"
              : "расчёт"}
          </p>
        </InspectorBlock>

        <InspectorBlock title="Детали">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Metric label="Шаг цены" value={instrument.tickSize !== null ? String(instrument.tickSize) : "—"} />
            <Metric
              label="Спред, ₽"
              value={instrument.spreadRub !== null ? `${instrument.spreadRub.toFixed(2)} ₽` : "—"}
              tone="amber"
            />
            <Metric
              label="Bid"
              value={instrument.bid !== null ? formatPrice(instrument.bid) : "—"}
              tone="green"
            />
            <Metric
              label="Ask"
              value={instrument.ask !== null ? formatPrice(instrument.ask) : "—"}
              tone="amber"
            />
          </div>
          {instrument.spreadRub === null && (
            <p className="mt-2 text-[10px] text-amber/85">
              Спред недоступен: MOEX не отдал bid/ask.
            </p>
          )}
        </InspectorBlock>

        <InspectorBlock title="Главное">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Metric label="Цена лота" value={formatRub(instrument.lotValue)} />
            <Metric
              label="Шаг/лот"
              value={
                instrument.tickValueRub !== null
                  ? formatRub(instrument.tickValueRub)
                  : "—"
              }
              highlight
            />
            <p className="col-span-2 text-[10px] leading-snug text-terminal-muted">
              Стоимость одного минимального шага цены на 1 лот. ≤ 0,20 ₽ —
              удобнее контролировать риск и набирать объём.
            </p>
            <Metric
              label="Спред, п."
              value={formatPoints(instrument.spreadTicks, 0)}
              tone="amber"
            />
            <Metric
              label="Спред, %"
              value={
                instrument.spreadPct !== null
                  ? `${instrument.spreadPct.toFixed(3)}%`
                  : "—"
              }
              tone="amber"
            />
            <Metric
              label="Оборот"
              value={formatRub(instrument.turnoverRub, true)}
            />
            <Metric label="Сделки" value={formatNumber(instrument.trades)} />
            <Metric
              label="Диапазон"
              value={
                instrument.dayRangePct !== null
                  ? `${instrument.dayRangePct.toFixed(1)}%`
                  : "—"
              }
            />
          </div>
          {!instrument.hasHistoricalBaseline && (
            <p className="mt-2 text-[10px] text-terminal-muted">
              Исторической базы нет — оценка по текущим оборотам и сделкам.
            </p>
          )}
        </InspectorBlock>

        <InspectorBlock
          title={
            isTrainingMode
              ? "Сравнение"
              : isOrderBookMode
                ? "Почему для стакана"
                : mode === "technical"
                  ? "Почему техничный"
                  : "Почему в списке"
          }
        >
          <ul className="space-y-1.5 text-[11px] leading-relaxed text-terminal-text/85">
            {whyBullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-cyan">·</span>
                {b}
              </li>
            ))}
          </ul>
        </InspectorBlock>

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

        <div className="mt-2 border-t border-terminal-border pt-4">
          <TradeCalculator instrument={instrument} />
        </div>
      </div>
    </div>
  );
}

function CommissionRow({
  label,
  rub,
  points,
  rubOnly,
}: {
  label: string;
  rub: number | null;
  points: number | null;
  rubOnly?: boolean;
}) {
  const rubText =
    rub !== null
      ? rubOnly
        ? formatRub(rub)
        : `${formatCommissionRubDisplay(rub)} ₽`
      : "—";
  const pointsText =
    points !== null ? `${points} п.` : rubOnly ? null : "— п.";

  return (
    <div className="flex justify-between gap-2 rounded border border-terminal-border/50 bg-terminal-surface/30 px-2 py-1.5">
      <span className="text-terminal-muted">{label}</span>
      <span className="font-mono text-right text-terminal-text">
        {rubOnly ? (
          rubText
        ) : (
          <>
            {rubText}
            {pointsText !== null && (
              <span className="text-amber/90"> / {pointsText}</span>
            )}
          </>
        )}
      </span>
    </div>
  );
}

function ErrorRow({
  label,
  value,
  tone,
  highlight,
}: {
  label: string;
  value: string;
  tone?: "amber";
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2 rounded border border-terminal-border/50 bg-terminal-surface/30 px-2 py-1.5">
      <span className="text-terminal-muted">{label}</span>
      <span
        className={cn(
          "font-mono text-right",
          highlight ? "font-semibold text-cyan" : tone === "amber" ? "text-amber" : "text-terminal-text",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
  title,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  title?: string;
  highlight?: boolean;
  tone?: "green" | "amber";
}) {
  const valueClass = highlight
    ? "text-cyan font-bold"
    : tone === "green"
      ? "text-green"
      : tone === "amber"
        ? "text-amber"
        : "text-terminal-text";

  return (
    <div
      className="rounded border border-terminal-border/60 bg-terminal-surface/40 px-2 py-1.5"
      title={title}
    >
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
