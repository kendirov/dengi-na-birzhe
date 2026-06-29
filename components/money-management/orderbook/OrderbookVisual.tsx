"use client";

import { useMemo } from "react";
import type { InstrumentPreset } from "@/lib/money-management/instrument-presets";
import type { MoneyManagementResult } from "@/lib/money-management/types";
import { formatPrice, cn } from "@/lib/utils/format";
import {
  buildOrderbookLevels,
  findLevelIndex,
  priceMatches,
} from "./build-orderbook-levels";

const ROW_H = 28;

interface OrderbookVisualProps {
  preset: InstrumentPreset;
  entryPrice: number;
  stopPrice: number;
  slippagePoints: number;
  result: MoneyManagementResult;
}

export function OrderbookVisual({
  preset,
  entryPrice,
  stopPrice,
  slippagePoints,
  result,
}: OrderbookVisualProps) {
  const levels = useMemo(
    () => buildOrderbookLevels(preset, entryPrice),
    [preset, entryPrice],
  );

  const slipPrice = Math.max(
    preset.tickSize,
    stopPrice - slippagePoints * preset.tickSize,
  );

  const entryIdx = findLevelIndex(levels, entryPrice, preset.tickSize);
  const stopIdx = findLevelIndex(levels, stopPrice, preset.tickSize);
  const slipIdx =
    slippagePoints > 0
      ? findLevelIndex(levels, slipPrice, preset.tickSize)
      : -1;

  const bandTop = Math.min(entryIdx, stopIdx);
  const bandBottom = Math.max(entryIdx, stopIdx);
  const hasBand = entryIdx >= 0 && stopIdx >= 0 && bandTop !== bandBottom;

  const maxQty = useMemo(
    () =>
      Math.max(
        ...levels.flatMap((l) => [l.bidQty ?? 0, l.askQty ?? 0]),
        1,
      ),
    [levels],
  );

  return (
    <div className="relative overflow-hidden rounded-lg border border-terminal-border bg-terminal-bg/80">
      <div className="flex items-center justify-between border-b border-terminal-border bg-terminal-surface/70 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-terminal-muted">
          {preset.ticker} · стакан
        </span>
        <span className="font-mono text-[10px] text-terminal-muted">
          spread {formatPrice(preset.typicalSpreadRub ?? preset.spreadRub)} ₽
        </span>
      </div>

      <div className="relative flex">
        {/* Полоса расстояния вход → стоп */}
        {hasBand ? (
          <div
            className="relative w-10 shrink-0 border-r border-terminal-border/60 bg-terminal-surface/30"
            style={{ minHeight: levels.length * ROW_H }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <rect
                x={4}
                y={bandTop * ROW_H + 4}
                width={32}
                height={Math.max(ROW_H, (bandBottom - bandTop + 1) * ROW_H - 8)}
                rx={3}
                fill="rgba(248, 113, 113, 0.12)"
                stroke="rgba(248, 113, 113, 0.45)"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              {slipIdx >= 0 && slipIdx > stopIdx ? (
                <rect
                  x={4}
                  y={stopIdx * ROW_H + ROW_H - 2}
                  width={32}
                  height={Math.max(ROW_H, (slipIdx - stopIdx) * ROW_H)}
                  rx={2}
                  fill="rgba(251, 191, 36, 0.1)"
                  stroke="rgba(251, 191, 36, 0.35)"
                  strokeWidth={1}
                />
              ) : null}
            </svg>
            <div
              className="absolute left-0 right-0 flex -translate-y-1/2 flex-col items-center"
              style={{ top: ((entryIdx + stopIdx) / 2 + 0.5) * ROW_H }}
            >
              <span className="rounded bg-red/20 px-1 py-0.5 font-mono text-[9px] text-red">
                {result.stopDistancePoints.toFixed(0)} п.
              </span>
            </div>
          </div>
        ) : (
          <div className="w-10 shrink-0 border-r border-terminal-border/40" />
        )}

        {/* Стакан */}
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-[1fr_4.5rem_1fr] border-b border-terminal-border px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-terminal-muted">
            <span className="text-green">Bid · qty</span>
            <span className="text-center">Цена</span>
            <span className="text-right text-red">Ask · qty</span>
          </div>

          <div className="font-mono text-[11px]">
            {levels.map((level, idx) => {
              const isEntry = priceMatches(level.price, entryPrice, preset.tickSize);
              const isStop = priceMatches(level.price, stopPrice, preset.tickSize);
              const isSlip =
                slippagePoints > 0 &&
                priceMatches(level.price, slipPrice, preset.tickSize);
              const inStopBand =
                hasBand && idx >= bandBottom && idx <= bandTop && !isEntry;
              const isSpreadCenter =
                level.side === "spread" &&
                level.bidQty !== null &&
                level.askQty === null;

              return (
                <div key={`${level.price}-${idx}`}>
                  {isSpreadCenter ? (
                    <div className="flex items-center justify-center border-y border-cyan/15 bg-cyan/[0.04] py-0.5 font-mono text-[8px] uppercase tracking-widest text-cyan/70">
                      spread · лонг от ask
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      "relative grid grid-cols-[1fr_4.5rem_1fr] items-center px-2",
                      isEntry && "bg-cyan/12 ring-1 ring-inset ring-cyan/30",
                      isStop && "bg-red/12 ring-1 ring-inset ring-red/35",
                      isSlip && !isStop && "bg-amber/8",
                      inStopBand && !isStop && !isEntry && "bg-red/[0.04]",
                    )}
                    style={{ height: ROW_H }}
                  >
                  <QtyCell
                    qty={level.bidQty}
                    maxQty={maxQty}
                    tone="green"
                    align="left"
                  />

                  <div className="relative text-center">
                    {isEntry ? (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 rounded bg-cyan/25 px-0.5 text-[8px] text-cyan">
                        ▶
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "tabular-nums",
                        isEntry && "font-bold text-cyan",
                        isStop && "font-bold text-red",
                        isSlip && "text-amber",
                        !isEntry && !isStop && !isSlip && "text-terminal-text/90",
                        level.side === "ask" && !isEntry && "text-red/80",
                        level.side === "bid" && !isStop && "text-green/80",
                      )}
                    >
                      {formatPrice(level.price)}
                    </span>
                    {isStop ? (
                      <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 text-[8px] text-red">
                        ■
                      </span>
                    ) : null}
                  </div>

                  <QtyCell
                    qty={level.askQty}
                    maxQty={maxQty}
                    tone="red"
                    align="right"
                  />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-terminal-border bg-terminal-surface/40 px-3 py-1.5 font-mono text-[9px] text-terminal-muted">
        <Legend dot="bg-cyan" label="Вход" />
        <Legend dot="bg-red" label="Стоп" />
        <Legend dot="bg-amber" label="Slip" />
        <span className="ml-auto tabular-nums">
          {result.stopDistancePoints.toFixed(1)} п. до стопа
        </span>
      </div>
    </div>
  );
}

function QtyCell({
  qty,
  maxQty,
  tone,
  align,
}: {
  qty: number | null;
  maxQty: number;
  tone: "green" | "red";
  align: "left" | "right";
}) {
  if (qty === null) {
    return <span />;
  }

  const pct = Math.min(100, (qty / maxQty) * 100);
  const barColor = tone === "green" ? "bg-green/25" : "bg-red/25";
  const textColor = tone === "green" ? "text-green/90" : "text-red/90";

  return (
    <div
      className={cn(
        "relative flex items-center",
        align === "right" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn("absolute inset-y-1 rounded-sm opacity-80", barColor)}
        style={{
          width: `${pct}%`,
          ...(align === "right" ? { right: 0 } : { left: 0 }),
        }}
      />
      <span className={cn("relative z-10 tabular-nums", textColor)}>{qty}</span>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
