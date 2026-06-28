"use client";

import type { QuickFilterId, ScreenerMode } from "@/lib/types/screener";
import { SCREENER_MODES, QUICK_FILTERS } from "@/lib/screener/filter-modes";
import { cn } from "@/lib/utils/format";

interface ScreenerToolbarProps {
  mode: ScreenerMode;
  onModeChange: (mode: ScreenerMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  quickFilters: QuickFilterId[];
  onQuickFilterToggle: (filter: QuickFilterId) => void;
  resultCount: number;
  totalCount?: number;
  displayedCount?: number;
}

export function ScreenerToolbar({
  mode,
  onModeChange,
  search,
  onSearchChange,
  quickFilters,
  onQuickFilterToggle,
  resultCount,
  totalCount,
  displayedCount,
}: ScreenerToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {SCREENER_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              title={`${m.description}`}
              onClick={() => onModeChange(m.id)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left transition-all lg:text-sm",
                mode === m.id
                  ? "border-cyan/40 bg-cyan/10 text-cyan"
                  : "border-terminal-border bg-terminal-card text-terminal-muted hover:border-cyan/20 hover:text-terminal-text",
              )}
            >
              <span className="block text-xs font-medium">{m.shortLabel}</span>
              <span className="mt-0.5 hidden text-[10px] leading-snug opacity-80 xl:block">
                {m.taskHint}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по тикеру..."
            className="w-full rounded-lg border border-terminal-border bg-terminal-card px-4 py-2 font-mono text-sm text-terminal-text placeholder:text-terminal-muted focus:border-cyan/40 focus:outline-none focus:ring-1 focus:ring-cyan/20 lg:w-56"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-terminal-muted">
            {resultCount}
          </span>
        </div>
      </div>

      {displayedCount !== undefined &&
        totalCount !== undefined &&
        resultCount > displayedCount && (
          <p className="text-[11px] text-terminal-muted">
            Показано {displayedCount} из {resultCount}
            {resultCount !== totalCount && ` (всего ${totalCount})`}
          </p>
        )}

      <div className="flex flex-wrap gap-1.5">
        {QUICK_FILTERS.map((f) => {
          const active = quickFilters.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onQuickFilterToggle(f.id)}
              className={cn(
                "rounded border px-2.5 py-1 text-[11px] font-medium transition-all",
                active
                  ? "border-violet/40 bg-violet/10 text-violet"
                  : "border-terminal-border text-terminal-muted hover:border-terminal-muted hover:text-terminal-text",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
