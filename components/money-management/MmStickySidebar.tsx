"use client";

import type { DailyPlanUiResult } from "@/lib/money-management/types";
import type { VolumeRowResult } from "@/lib/money-management/table-calculate";
import {
  formatLots,
  formatPoints,
  formatRub,
} from "@/lib/money-management/format";
import { cn } from "@/lib/utils/format";

interface MmStickySidebarProps {
  plan: DailyPlanUiResult;
  selectedRow: VolumeRowResult | null;
  slipPoints: number;
}

export function MmStickySidebar({
  plan,
  selectedRow,
  slipPoints,
}: MmStickySidebarProps) {
  return (
    <aside className="space-y-2 xl:sticky xl:top-20 xl:self-start">
      <div className="rounded-xl border border-cyan/25 bg-cyan/[0.04] p-3 glow-cyan">
        <p className="text-[9px] uppercase tracking-wider text-terminal-muted">
          Риск на сделку
        </p>
        <p className="font-mono text-2xl font-bold tabular-nums text-cyan data-glow-cyan">
          {formatRub(plan.baseRiskPerTradeRub)}
        </p>
      </div>

      {selectedRow ? (
        <>
          <div className="rounded-xl border border-terminal-border/70 bg-terminal-card/70 p-3">
            <p className="mb-2 text-[9px] uppercase tracking-wider text-terminal-muted">
              {selectedRow.ticker} · {selectedRow.name}
            </p>
            <div className="space-y-1.5">
              <SummaryRow
                label="Полный риск, п."
                value={formatPoints(selectedRow.fullRiskPoints)}
                tone="amber"
              />
              <SummaryRow
                label="Риск / 1 лот, ₽"
                value={formatRub(selectedRow.riskPerLotRub)}
                tone="cyan"
                large
              />
              <SummaryRow
                label="Базовый полный объём"
                value={
                  selectedRow.highRisk
                    ? "0 · риск высокий"
                    : formatLots(selectedRow.baseVolume)
                }
                tone={selectedRow.highRisk ? "amber" : "green"}
                large
              />
            </div>
          </div>

          <div className="rounded-xl border border-green/25 bg-green/[0.04] p-3">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-green/90">
              5 объёмов для привода
            </p>
            <div className="grid grid-cols-5 gap-1">
              <DriveChip label="1 лот" value={selectedRow.beaconVolume} tone="neutral" />
              <DriveChip label="1/4" value={selectedRow.quarterVolume} tone="quarter" />
              <DriveChip label="1/2" value={selectedRow.halfVolume} tone="half" />
              <DriveChip
                label="Полный"
                value={selectedRow.highRisk ? 0 : selectedRow.baseVolume}
                tone="full"
                warn={selectedRow.highRisk}
              />
              <DriveChip
                label="x2"
                value={selectedRow.highRisk ? 0 : selectedRow.doubleVolume}
                tone="double"
                warn={selectedRow.highRisk}
              />
            </div>
          </div>

          <div className="rounded-xl border border-terminal-border/60 bg-terminal-card/50 p-2.5">
            <div className="space-y-1">
              <SummaryRow label="Стоп" value={formatPoints(selectedRow.stopPoints)} tone="red" />
              <SummaryRow label="Slip" value={formatPoints(slipPoints)} />
              <SummaryRow
                label="Ком. вход"
                value={formatPoints(selectedRow.entryCommissionPoints)}
                tone="amber"
              />
              <SummaryRow
                label="Ком. выход"
                value={formatPoints(selectedRow.exitCommissionPoints)}
                tone="amber"
              />
            </div>
          </div>
        </>
      ) : null}
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  tone,
  large,
}: {
  label: string;
  value: string;
  tone?: "red" | "green" | "amber" | "cyan";
  large?: boolean;
}) {
  const color =
    tone === "red"
      ? "text-red"
      : tone === "green"
        ? "text-green"
        : tone === "amber"
          ? "text-amber"
          : tone === "cyan"
            ? "text-cyan"
            : "text-terminal-text";

  return (
    <div className="flex items-baseline justify-between gap-2 font-mono text-[11px]">
      <span className="text-terminal-muted">{label}</span>
      <span className={cn("tabular-nums font-semibold", color, large && "text-sm")}>
        {value}
      </span>
    </div>
  );
}

function DriveChip({
  label,
  value,
  tone,
  warn,
}: {
  label: string;
  value: number;
  tone: "neutral" | "quarter" | "half" | "full" | "double";
  warn?: boolean;
}) {
  const styles = {
    neutral: "border-terminal-border/60 bg-terminal-bg/60 text-terminal-text",
    quarter: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    half: "border-cyan/30 bg-cyan/10 text-cyan",
    full: "border-green/35 bg-green/12 text-green",
    double: warn
      ? "border-amber/35 bg-amber/10 text-amber"
      : "border-green/40 bg-green/15 text-green",
  }[tone];

  return (
    <div className={cn("rounded-lg border px-1 py-1.5 text-center", styles)}>
      <p className="text-[8px] uppercase tracking-wide text-terminal-muted">{label}</p>
      <p className="font-mono text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}
