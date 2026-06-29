"use client";

import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import { formatRub } from "@/lib/money-management/format";
import { cn } from "@/lib/utils/format";

interface DriveVolumePresetsProps {
  row: VolumeRowResult | null;
  ticker: string;
}

const PRESETS = [
  {
    key: "beacon" as const,
    title: "Маячок",
    subtitle: "1 лот",
    hint: "Проверка входа",
    size: "sm" as const,
    tone: "neutral" as const,
  },
  {
    key: "quarter" as const,
    title: "Четверть",
    subtitle: "1/4 объёма",
    hint: "Осторожный вход",
    size: "md" as const,
    tone: "muted" as const,
  },
  {
    key: "half" as const,
    title: "Половина",
    subtitle: "1/2 объёма",
    hint: "Нормальный тест",
    size: "md" as const,
    tone: "cyan" as const,
  },
  {
    key: "full" as const,
    title: "Полный",
    subtitle: "Рабочий объём",
    hint: "Базовый вход",
    size: "lg" as const,
    tone: "green" as const,
    highlight: true,
  },
  {
    key: "double" as const,
    title: "Двойной",
    subtitle: "x2",
    hint: "Только при сильной уверенности",
    size: "md" as const,
    tone: "warning" as const,
  },
];

export function DriveVolumePresets({ row, ticker }: DriveVolumePresetsProps) {
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
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-terminal-text">
          5 рабочих объёмов для привода
        </h2>
        <p className="mt-0.5 text-xs text-terminal-muted">
          {ticker} · объём считается не от желания, а от риска
        </p>
      </div>

      {row?.highRisk ? (
        <div className="rounded-xl border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-amber">
          Риск высокий — полный объём меньше 1 лота. Можно взять маячок (1 лот) или
          уменьшить стоп / увеличить просадку.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {PRESETS.map((preset) => {
          const vol = volumes?.[preset.key] ?? 0;
          const unavailable =
            row?.highRisk && (preset.key === "full" || preset.key === "double");
          const { key, ...cardProps } = preset;

          return (
            <VolumeCard
              key={key}
              {...cardProps}
              lots={unavailable ? 0 : vol}
              unavailable={unavailable}
              riskPerLot={row?.riskPerLotRub}
            />
          );
        })}
      </div>

      <p className="text-center text-xs text-terminal-muted">
        Объём считается не от желания, а от риска.
      </p>
    </section>
  );
}

function VolumeCard({
  title,
  subtitle,
  hint,
  lots,
  size,
  tone,
  highlight,
  unavailable,
  riskPerLot,
}: {
  title: string;
  subtitle: string;
  hint: string;
  lots: number;
  size: "sm" | "md" | "lg";
  tone: "neutral" | "muted" | "cyan" | "green" | "warning";
  highlight?: boolean;
  unavailable?: boolean;
  riskPerLot?: number;
}) {
  const toneStyles = {
    neutral: "border-terminal-border/70 bg-terminal-card/50 text-terminal-text",
    muted: "border-slate-500/25 bg-slate-500/[0.06] text-slate-300",
    cyan: "border-cyan/25 bg-cyan/[0.06] text-cyan",
    green: "border-green/35 bg-green/[0.08] text-green",
    warning: unavailable
      ? "border-amber/35 bg-amber/[0.08] text-amber"
      : "border-amber/25 bg-amber/[0.05] text-amber",
  }[tone];

  const sizeStyles = {
    sm: "py-4",
    md: "py-5",
    lg: "py-6 scale-[1.02] shadow-[0_0_32px_rgba(52,211,153,0.08)]",
  }[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border text-center transition-transform",
        toneStyles,
        sizeStyles,
        highlight && "ring-1 ring-green/25",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
        {title}
      </p>
      <p
        className={cn(
          "mt-2 font-mono font-bold tabular-nums",
          highlight ? "text-4xl data-glow-green" : "text-3xl",
          unavailable && "text-amber",
        )}
      >
        {unavailable ? "—" : lots}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wide opacity-70">
        {subtitle}
      </p>
      <p className="mt-2 max-w-[140px] text-[11px] leading-snug text-terminal-muted">
        {hint}
      </p>
      {riskPerLot !== undefined && lots > 0 && !unavailable ? (
        <p className="mt-2 font-mono text-[10px] text-terminal-muted">
          ≈ {formatRub(lots * riskPerLot)}
        </p>
      ) : null}
    </div>
  );
}
