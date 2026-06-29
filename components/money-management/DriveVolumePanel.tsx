"use client";

import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import { formatLots, formatRub } from "@/lib/money-management/format";
import { cn } from "@/lib/utils/format";

interface DriveVolumePanelProps {
  row: VolumeRowResult | null;
  ticker: string;
  riskPerTradeRub: number;
}

const LEVELS = [
  {
    key: "beacon" as const,
    label: "Маячок",
    ratio: "1 лот",
    hint: "Проверка входа",
    scale: 0.55,
    tone: "neutral" as const,
  },
  {
    key: "quarter" as const,
    label: "1/4",
    ratio: "¼ объёма",
    hint: "Осторожный вход",
    scale: 0.72,
    tone: "cyan" as const,
  },
  {
    key: "half" as const,
    label: "1/2",
    ratio: "½ объёма",
    hint: "Рабочий тест",
    scale: 0.85,
    tone: "cyan" as const,
  },
  {
    key: "full" as const,
    label: "Полный",
    ratio: "Базовый объём",
    hint: "Базовый объём",
    scale: 1,
    tone: "green" as const,
    center: true,
  },
  {
    key: "double" as const,
    label: "x2",
    ratio: "×2 от полного",
    hint: "Только лучшая ситуация",
    scale: 0.78,
    tone: "warning" as const,
  },
];

export function DriveVolumePanel({
  row,
  ticker,
  riskPerTradeRub,
}: DriveVolumePanelProps) {
  const volumes = row
    ? {
        beacon: row.beaconVolume,
        quarter: row.quarterVolume,
        half: row.halfVolume,
        full: row.baseVolume,
        double: row.doubleVolume,
      }
    : null;

  return (
    <section aria-label="Объёмы для привода" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-terminal-text">
            Объёмы для привода
          </h2>
          <p className="mt-0.5 font-mono text-xs text-cyan">
            {ticker}
            {row ? (
              <>
                {" "}
                · риск/лот {formatRub(row.riskPerLotRub)} · стоп{" "}
                {row.stopPoints} п.
              </>
            ) : null}
          </p>
        </div>
        <p className="font-mono text-[10px] text-terminal-muted">
          Риск/сделку {formatRub(riskPerTradeRub)}
        </p>
      </div>

      {row?.highRisk ? (
        <div className="rounded-xl border border-amber/40 bg-amber/[0.08] px-4 py-3 text-sm text-amber">
          Стоп/комиссия больше допустимого риска. Полный объём недоступен — можно
          взять маячок (1 лот) или уменьшить стоп / увеличить просадку.
        </div>
      ) : null}

      <div className="relative mx-auto flex max-w-lg flex-col items-center gap-1.5 py-2">
        {LEVELS.map((level) => {
          const lots = volumes?.[level.key] ?? 0;
          const unavailable =
            row?.highRisk && (level.key === "full" || level.key === "double");
          const displayLots = unavailable ? 0 : lots;
          const { key, ...stepProps } = level;

          return (
            <VolumeLadderStep
              key={key}
              {...stepProps}
              lots={displayLots}
              unavailable={unavailable}
              riskPerLot={row?.riskPerLotRub}
            />
          );
        })}
      </div>

      <p className="text-center text-[11px] text-terminal-muted">
        Эти 5 чисел можно перенести в кнопки объёма в приводе.
      </p>
    </section>
  );
}

function VolumeLadderStep({
  label,
  ratio,
  hint,
  lots,
  scale,
  tone,
  center,
  unavailable,
  riskPerLot,
}: {
  label: string;
  ratio: string;
  hint: string;
  lots: number;
  scale: number;
  tone: "neutral" | "cyan" | "green" | "warning";
  center?: boolean;
  unavailable?: boolean;
  riskPerLot?: number;
}) {
  const widthPct = Math.round(scale * 100);

  const toneStyles = {
    neutral:
      "border-terminal-border/60 bg-terminal-card/40 text-terminal-text hover:border-terminal-border",
    cyan: "border-cyan/30 bg-gradient-to-r from-cyan/[0.04] to-cyan/[0.1] text-cyan hover:border-cyan/45",
    green:
      "border-green/45 bg-gradient-to-r from-green/[0.08] to-green/[0.14] text-green shadow-[0_0_40px_rgba(52,211,153,0.12)] ring-1 ring-green/20 hover:border-green/55",
    warning: unavailable
      ? "border-amber/50 bg-amber/[0.1] text-amber"
      : "border-amber/35 bg-amber/[0.06] text-amber hover:border-amber/50",
  }[tone];

  return (
    <div
      style={{ width: `${widthPct}%` }}
      className={cn(
        "group relative flex min-h-[52px] items-center gap-3 rounded-xl border px-4 py-2.5 transition-all duration-300",
        toneStyles,
        center && "min-h-[68px] py-3.5",
        unavailable && "opacity-90",
      )}
    >
      <div className="min-w-[52px] shrink-0">
        <p
          className={cn(
            "font-mono font-bold uppercase tracking-wide",
            center ? "text-sm" : "text-[11px]",
          )}
        >
          {label}
        </p>
        <p className="text-[9px] text-terminal-muted opacity-80">{ratio}</p>
      </div>

      <div className="flex flex-1 items-baseline justify-center gap-2">
        <span
          className={cn(
            "font-mono font-bold tabular-nums transition-transform duration-300 group-hover:scale-105",
            center ? "text-4xl data-glow-green" : "text-2xl",
            unavailable && "text-amber",
          )}
        >
          {unavailable ? "—" : lots}
        </span>
        {!unavailable && lots > 0 ? (
          <span className="font-mono text-[10px] text-terminal-muted">
            {formatLots(lots)}
          </span>
        ) : null}
      </div>

      <div className="hidden min-w-[100px] text-right sm:block">
        <p className="text-[10px] leading-snug text-terminal-muted">{hint}</p>
        {riskPerLot !== undefined && lots > 0 && !unavailable ? (
          <p className="mt-0.5 font-mono text-[9px] text-terminal-muted">
            ≈ {formatRub(lots * riskPerLot)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
