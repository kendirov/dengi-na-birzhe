"use client";

import { useState } from "react";
import type { QuickFilterId, ScreenerMode } from "@/lib/types/screener";
import {
  MAIN_SCREENER_MODES,
  PRIMARY_QUICK_FILTERS,
  SECONDARY_QUICK_FILTERS,
} from "@/lib/screener/filter-modes";
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
  filterCounts?: Partial<Record<QuickFilterId, number>>;
}

function FilterChip({
  id,
  label,
  tooltip,
  active,
  count,
  showCount,
  onToggle,
}: {
  id: QuickFilterId;
  label: string;
  tooltip: string;
  active: boolean;
  count?: number;
  showCount?: boolean;
  onToggle: (id: QuickFilterId) => void;
}) {
  const title =
    count !== undefined ? `${tooltip} (${count} инстр.)` : tooltip;

  return (
    <button
      key={id}
      type="button"
      title={title}
      onClick={() => onToggle(id)}
      className={cn(
        "rounded border px-2 py-0.5 text-[10px] font-medium transition-all",
        active
          ? "border-violet/40 bg-violet/10 text-violet"
          : "border-terminal-border/70 bg-transparent text-terminal-muted hover:border-terminal-border hover:text-terminal-text",
      )}
    >
      {showCount && count !== undefined ? `${label} · ${count}` : label}
    </button>
  );
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
  filterCounts,
}: ScreenerToolbarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
            className="w-full rounded border border-terminal-border/60 bg-[#080c11] px-3 py-1 font-mono text-xs text-terminal-text placeholder:text-terminal-muted focus:border-cyan/30 focus:outline-none sm:w-48"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-terminal-muted">
            {resultCount}
          </span>
        </div>
      </div>

      {totalCount !== undefined && (
        <p className="text-[11px] text-terminal-muted">
          Показано {resultCount} из {totalCount} по фильтрам
          {displayedCount !== undefined &&
            resultCount > displayedCount &&
            ` · в таблице ${displayedCount}`}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1">
        {PRIMARY_QUICK_FILTERS.map((f) => (
          <FilterChip
            key={f.id}
            id={f.id}
            label={f.label}
            tooltip={f.tooltip}
            active={quickFilters.includes(f.id)}
            count={filterCounts?.[f.id]}
            showCount={false}
            onToggle={onQuickFilterToggle}
          />
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={cn(
            "rounded border px-2 py-0.5 text-[10px] font-medium transition-all",
            moreOpen
              ? "border-terminal-border text-terminal-text"
              : "border-terminal-border/70 text-terminal-muted hover:text-terminal-text",
          )}
        >
          {moreOpen ? "Скрыть" : "Ещё фильтры"}
        </button>
      </div>

      {moreOpen ? (
        <div className="flex flex-wrap gap-1 border-l border-terminal-border/40 pl-2">
          {SECONDARY_QUICK_FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              id={f.id}
              label={f.label}
              tooltip={f.tooltip}
              active={quickFilters.includes(f.id)}
              count={filterCounts?.[f.id]}
              showCount
              onToggle={onQuickFilterToggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
