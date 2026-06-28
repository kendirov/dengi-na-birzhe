"use client";

import type { EnrichedInstrument } from "@/lib/types/instrument";
import type { ScreenerMode } from "@/lib/types/screener";
import { getModeScore } from "@/lib/types/screener";
import { InstrumentTagList } from "@/components/screener/InstrumentTag";
import { formatPct, formatRub, cn } from "@/lib/utils/format";

interface TopPickCardProps {
  rank: number;
  instrument: EnrichedInstrument;
  mode: ScreenerMode;
  onSelect: () => void;
  selected?: boolean;
}

export function TopPickCard({
  rank,
  instrument,
  mode,
  onSelect,
  selected,
}: TopPickCardProps) {
  const score = getModeScore(instrument, mode);
  const positive = (instrument.changePct ?? 0) >= 0;

  return (
    <button type="button" onClick={onSelect} className="w-full text-left">
      <div
        className={cn(
          "rounded-lg border bg-terminal-card p-3 transition-colors",
          selected
            ? "border-cyan/40 bg-cyan/5"
            : "border-terminal-border hover:border-cyan/20",
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-base font-bold text-cyan">
            #{rank} {instrument.ticker}
          </span>
          <span
            className={cn(
              "font-mono text-sm font-semibold",
              positive ? "text-green" : "text-red",
            )}
          >
            {formatPct(instrument.changePct)}
          </span>
        </div>

        <p className="mb-2 truncate text-xs text-terminal-muted">
          {instrument.name}
        </p>

        <div className="mb-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div>
            <span className="text-terminal-muted">Шаг/лот </span>
            <span className="font-mono font-bold text-cyan">
              {instrument.tickValueRub !== null
                ? formatRub(instrument.tickValueRub)
                : "—"}
            </span>
          </div>
          <div>
            <span className="text-terminal-muted">Спред </span>
            <span className="font-mono text-amber">
              {instrument.spreadTicks !== null
                ? `${instrument.spreadTicks.toFixed(0)} п.`
                : instrument.spreadRub !== null
                  ? `${instrument.spreadRub.toFixed(2)} ₽`
                  : "—"}
            </span>
          </div>
          <div>
            <span className="text-terminal-muted">Вход </span>
            <span className="font-mono">
              {instrument.entryCostRub !== null
                ? formatRub(instrument.entryCostRub)
                : "—"}
            </span>
          </div>
          <div>
            <span className="text-terminal-muted">Оценка </span>
            <span className="font-mono text-violet">{score}</span>
          </div>
        </div>

        <InstrumentTagList tags={instrument.visualTags} limit={3} />
      </div>
    </button>
  );
}
