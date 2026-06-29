"use client";

import { useState } from "react";
import type { QuickFilterId, ScreenerMode } from "@/lib/types/screener";
import { MAIN_SCREENER_MODES, QUICK_FILTERS } from "@/lib/screener/filter-modes";
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {MAIN_SCREENER_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={cn(
                "rounded border px-2.5 py-1 text-xs font-medium transition-all",
                mode === m.id
                  ? "border-cyan/30 bg-cyan/8 text-cyan"
                  : "border-terminal-border/60 bg-transparent text-terminal-muted hover:border-terminal-border hover:text-terminal-text",
              )}
            >
              {m.shortLabel}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по тикеру..."
            className="w-full rounded border border-terminal-border/60 bg-[#080c11] px-3 py-1.5 font-mono text-sm text-terminal-text placeholder:text-terminal-muted focus:border-cyan/30 focus:outline-none sm:w-52"
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

      <div>
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[11px] font-medium text-terminal-muted transition-colors hover:text-terminal-text"
          aria-expanded={filtersOpen}
        >
          <span
            className={cn(
              "inline-block text-[9px] transition-transform",
              filtersOpen && "rotate-90",
            )}
          >
            ▶
          </span>
          Фильтры
          {quickFilters.length > 0 && (
            <span className="rounded bg-violet/15 px-1.5 py-0.5 text-[10px] text-violet">
              {quickFilters.length}
            </span>
          )}
        </button>

        {filtersOpen && (
          <div className="mt-2 flex flex-wrap gap-1.5">
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
        )}
      </div>
    </div>
  );
}
