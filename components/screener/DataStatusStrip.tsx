"use client";

import type { MarketDataStatus, DataDiagnostics } from "@/lib/data/types";
import { ClientTime } from "@/components/ui/ClientTime";
import { cn } from "@/lib/utils/format";

interface DataStatusStripProps {
  status: MarketDataStatus;
  diagnostics: DataDiagnostics;
  rowCount: number;
  isLoading?: boolean;
}

const SOURCE_CONFIG = {
  mock: {
    label: "Учебные данные",
    sublabel: "Не биржевой поток",
    tone: "amber" as const,
    pulse: false,
  },
  moex: {
    label: "MOEX ISS",
    sublabel: "Реальные данные · кэш 15 минут",
    tone: "green" as const,
    pulse: true,
  },
  fallback: {
    label: "Резервные данные",
    sublabel: "MOEX недоступен · показан учебный набор",
    tone: "amber" as const,
    pulse: false,
  },
  error: {
    label: "Ошибка данных",
    sublabel: "MOEX ISS не ответил",
    tone: "red" as const,
    pulse: false,
  },
};

const toneStyles = {
  amber: "border-amber/30 bg-amber/8 text-amber",
  green: "border-green/30 bg-green/8 text-green",
  red: "border-red/30 bg-red/8 text-red",
};

const CACHE_LABELS: Record<DataDiagnostics["cache"], string> = {
  hit: "из кэша",
  miss: "новый запрос",
  stale: "устаревший кэш",
  none: "",
};

function excludedFundsEtfs(diagnostics: DataDiagnostics): number {
  return (diagnostics.excludedFunds ?? 0) + (diagnostics.excludedEtfs ?? 0);
}

function rowCountLabel(status: MarketDataStatus, rowCount: number): string {
  if (status.source === "moex") {
    return `${rowCount} акций`;
  }
  return `${rowCount} инструментов`;
}

function universeTooltip(diagnostics: DataDiagnostics): string | undefined {
  const u = diagnostics.universe;
  if (!u) return undefined;
  return [
    `Сырых строк ISS: ${u.raw}`,
    `После парсинга: ${u.afterParse}`,
    `Акций в скринере: ${u.stocks}`,
    `Исключено фондов: ${u.funds}`,
    `Исключено ETF: ${u.etfs}`,
    `Неизвестных: ${u.unknown}`,
    `Без цены: ${u.noPrice}`,
    `Без BID/OFFER: ${u.noBidAsk}`,
  ].join(" · ");
}

export function DataStatusStrip({
  status,
  diagnostics,
  rowCount,
  isLoading = false,
}: DataStatusStripProps) {
  const cfg = isLoading
    ? {
        label: "Загрузка MOEX ISS",
        sublabel: "Запрос данных TQBR из браузера",
        tone: "green" as const,
        pulse: true,
      }
    : SOURCE_CONFIG[status.source];
  const cacheLabel = CACHE_LABELS[diagnostics.cache];
  const excluded = excludedFundsEtfs(diagnostics);
  const tooltip = universeTooltip(diagnostics);

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-xs",
        toneStyles[cfg.tone],
      )}
      role="status"
      aria-live="polite"
      title={tooltip}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {cfg.pulse && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
            </span>
          )}
          <div>
            <span className="font-semibold">{cfg.label}</span>
            <span className="mx-2 text-terminal-muted">·</span>
            <span className="text-terminal-text/80">{cfg.sublabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-terminal-muted">
          <span>{rowCountLabel(status, rowCount)}</span>
          <ClientTime iso={status.updatedAt} prefix="обновлено " />
          {diagnostics.fetchMs > 0 && <span>{diagnostics.fetchMs} мс</span>}
          {cacheLabel && <span>{cacheLabel}</span>}
        </div>
      </div>

      {status.source === "moex" && excluded > 0 && (
        <p className="mt-1.5 text-[10px] opacity-75">
          исключено {excluded} фондов/ETF
        </p>
      )}

      {status.fallbackReason && (
        <p className="mt-2 text-[11px] leading-relaxed opacity-90">
          {status.source === "error" ? "Ошибка: " : "Причина: "}
          {status.fallbackReason}
        </p>
      )}

      {status.source === "mock" && (
        <p className="mt-2 text-[10px] opacity-75">
          Учебный набор — не биржевой поток.
        </p>
      )}

      {status.source === "moex" && diagnostics.errors.length > 0 && (
        <p className="mt-2 text-[10px] opacity-75">
          {diagnostics.errors.join(" · ")}
        </p>
      )}
    </div>
  );
}

export function terminalStatusLabel(source: MarketDataStatus["source"]): string {
  switch (source) {
    case "moex":
      return "MOEX ISS";
    case "fallback":
      return "Резервные данные";
    case "error":
      return "Ошибка данных";
    default:
      return "Учебные данные";
  }
}
