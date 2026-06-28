"use client";

import type { MarketDataStatus, DataDiagnostics } from "@/lib/data/types";
import { cn } from "@/lib/utils/format";

interface DataStatusStripProps {
  status: MarketDataStatus;
  diagnostics: DataDiagnostics;
  rowCount: number;
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
  hit: "кэш hit",
  miss: "кэш miss",
  stale: "кэш stale",
  none: "",
};

export function DataStatusStrip({
  status,
  diagnostics,
  rowCount,
}: DataStatusStripProps) {
  const cfg = SOURCE_CONFIG[status.source];
  const updated = new Date(status.updatedAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const cacheLabel = CACHE_LABELS[diagnostics.cache];

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-xs",
        toneStyles[cfg.tone],
      )}
      role="status"
      aria-live="polite"
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
          <span>{rowCount} инструментов</span>
          <span>обновлено {updated}</span>
          {diagnostics.fetchMs > 0 && <span>{diagnostics.fetchMs} мс</span>}
          {cacheLabel && <span>{cacheLabel}</span>}
        </div>
      </div>

      {status.fallbackReason && (
        <p className="mt-2 text-[11px] leading-relaxed opacity-90">
          {status.source === "error" ? "Ошибка: " : "Причина: "}
          {status.fallbackReason}
        </p>
      )}

      {status.source === "mock" && (
        <p className="mt-2 text-[10px] opacity-75">
          Режим MARKET_DATA_MODE=mock. Это не live-рынок.
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
