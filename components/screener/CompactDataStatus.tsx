"use client";

import type { ReactNode } from "react";
import type { MarketDataStatus, DataDiagnostics } from "@/lib/data/types";
import { ClientTime } from "@/components/ui/ClientTime";
import { cn } from "@/lib/utils/format";
import { pluralizeStocks } from "@/lib/utils/pluralize";

interface CompactDataStatusProps {
  status: MarketDataStatus;
  diagnostics: DataDiagnostics;
  rowCount: number;
  isLoading?: boolean;
}

type DotTone = "green" | "amber" | "red" | "muted";

const DOT_CLASS: Record<DotTone, string> = {
  green: "bg-green",
  amber: "bg-amber",
  red: "bg-red",
  muted: "bg-terminal-muted",
};

const CACHE_TOOLTIP: Record<DataDiagnostics["cache"], string> = {
  hit: "из кэша",
  miss: "новый запрос",
  stale: "устаревший кэш",
  none: "нет",
};

function excludedCount(diagnostics: DataDiagnostics): number {
  return (diagnostics.excludedFunds ?? 0) + (diagnostics.excludedEtfs ?? 0);
}

function buildTooltip(
  status: MarketDataStatus,
  diagnostics: DataDiagnostics,
  rowCount: number,
): string {
  const parts = [
    `source: ${status.source}`,
    `updatedAt: ${status.updatedAt}`,
    `rows: ${rowCount}`,
    `cache: ${CACHE_TOOLTIP[diagnostics.cache]}`,
  ];

  const noBidAsk = diagnostics.universe?.noBidAsk;
  if (noBidAsk !== undefined) parts.push(`noBidAsk: ${noBidAsk}`);

  const excluded = excludedCount(diagnostics);
  if (excluded > 0) parts.push(`excluded: ${excluded}`);

  if (status.fallbackReason) parts.push(`fallbackReason: ${status.fallbackReason}`);
  if (diagnostics.fetchMs > 0) parts.push(`fetchMs: ${diagnostics.fetchMs}`);
  if (diagnostics.errors.length > 0) parts.push(...diagnostics.errors);

  return parts.join("\n");
}

function statusDisplay(
  status: MarketDataStatus,
  rowCount: number,
  isLoading: boolean,
): { line: ReactNode; dot: DotTone } {
  if (isLoading) {
    return { line: "Загрузка…", dot: "muted" };
  }

  switch (status.source) {
    case "moex":
      return {
        dot: "green",
        line: (
          <>
            MOEX ISS · {pluralizeStocks(rowCount)} · <ClientTime iso={status.updatedAt} />
          </>
        ),
      };
    case "mock":
      return {
        dot: "amber",
        line: `Учебные данные · ${rowCount} инструментов`,
      };
    case "fallback":
      return {
        dot: "amber",
        line: `Резерв · ${rowCount} инструментов`,
      };
    case "error":
      return {
        dot: "red",
        line: "Ошибка данных",
      };
    default:
      return {
        dot: "muted",
        line: `Данные · ${rowCount}`,
      };
  }
}

/** Однострочный статус MOEX — правый верх панели скринера. */
export function CompactDataStatus({
  status,
  diagnostics,
  rowCount,
  isLoading = false,
}: CompactDataStatusProps) {
  const { line, dot } = statusDisplay(status, rowCount, isLoading);
  const tooltip = buildTooltip(status, diagnostics, rowCount);

  return (
    <div
      className="flex items-center gap-1.5 font-mono text-[10px] text-terminal-muted"
      role="status"
      aria-live="polite"
      title={tooltip}
    >
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASS[dot])}
        aria-hidden
      />
      <span className="whitespace-nowrap">{line}</span>
    </div>
  );
}
