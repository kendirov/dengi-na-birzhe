"use client";

import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import { VolumeKeyButton, type VolumeKeyVariant } from "./volume-key-ui";

interface DriveVolumeKeysProps {
  row: VolumeRowResult | null;
  ticker: string;
}

const KEYS: {
  key: VolumeKeyVariant;
  field: "beaconVolume" | "quarterVolume" | "halfVolume" | "baseVolume" | "doubleVolume";
  label: string;
  hint: string;
}[] = [
  { key: "beacon", field: "beaconVolume", label: "маячок", hint: "проверка входа" },
  { key: "quarter", field: "quarterVolume", label: "1/4", hint: "осторожно" },
  { key: "half", field: "halfVolume", label: "1/2", hint: "рабочий тест" },
  { key: "full", field: "baseVolume", label: "полный", hint: "базовый объём" },
  { key: "double", field: "doubleVolume", label: "x2", hint: "только лучшая ситуация" },
];

export function DriveVolumeKeys({ row, ticker }: DriveVolumeKeysProps) {
  return (
    <section aria-label="Кнопки объёма привода" className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-terminal-border/70 bg-terminal-bg/80">
          <DriveIcon />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-terminal-text">
            5 рабочих объёмов для кнопок в приводе
          </h2>
          <p className="font-mono text-[11px] text-cyan">{ticker}</p>
        </div>
      </div>

      {row?.highRisk ? (
        <div className="rounded-lg border border-amber/35 bg-amber/[0.07] px-3 py-2 text-xs text-amber">
          Стоп/комиссия больше допустимого риска — полный и x2 недоступны.
        </div>
      ) : null}

      <div className="rounded-xl border border-terminal-border/70 bg-[#060a12] p-3 shadow-[inset_0_2px_12px_rgba(0,0,0,0.4)]">
        <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-3">
          {KEYS.map(({ key, field, label, hint }) => {
            const unavailable =
              row?.highRisk && (field === "baseVolume" || field === "doubleVolume");
            const lots = row?.[field] ?? 0;

            return (
              <VolumeKeyButton
                key={key}
                variant={key}
                lots={lots}
                label={label}
                hint={hint}
                unavailable={unavailable}
              />
            );
          })}
        </div>
      </div>

      <p className="text-center text-[10px] text-terminal-muted">
        Эти 5 чисел перенесите в кнопки объёма в CScalp / приводе.
      </p>
    </section>
  );
}

function DriveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="text-terminal-muted">
      <rect x="2" y="4" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="4" y="7" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="8" y="7" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.7" />
      <rect x="12" y="7" width="3" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}
