"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { EnrichedInstrument } from "@/lib/types/instrument";
import type {
  MarketDataStatus,
  DataDiagnostics,
  MarketDataMode,
} from "@/lib/data/types";
import type { QuickFilterId, ScreenerMode, SortColumn, SortDirection } from "@/lib/types/screener";
import {
  filterInstruments,
  sortInstruments,
  buildTrainingSelection,
  trainingMetaMap,
  countQuickFilterMatches,
  QUICK_FILTERS,
  DEFAULT_SCREENER_QUICK_FILTERS,
  DEFAULT_SCREENER_SORT_COLUMN,
  DEFAULT_SCREENER_SORT_DIRECTION,
} from "@/lib/screener/filter-modes";
import type { LiveInvestCommission } from "@/lib/screener/liveinvest-commission";
import { ScreenerTable } from "@/components/ScreenerTable";
import { InstrumentInspector } from "@/components/InstrumentInspector";
import { ScreenerToolbar } from "@/components/screener/ScreenerToolbar";
import { CompactDataStatus } from "@/components/screener/CompactDataStatus";
import { ScreenerIntroPanel } from "@/components/screener/ScreenerIntroPanel";
import { CourseLessonsStrip } from "@/components/screener/CourseLessonsStrip";
import { useClientMoexFallback } from "@/lib/hooks/useClientMoexFallback";

const TABLE_DISPLAY_LIMIT = 200;

const VALID_QUICK_FILTERS = new Set<QuickFilterId>(
  QUICK_FILTERS.map((f) => f.id),
);

const LEGACY_FILTER_ALIASES: Record<string, QuickFilterId> = {
  "cheap-lot": "cheap-step-lot",
};

function readInitialQuickFilters(): QuickFilterId[] {
  if (typeof window === "undefined") return [...DEFAULT_SCREENER_QUICK_FILTERS];
  const params = new URLSearchParams(window.location.search);
  const filterParam = params.get("filter");
  if (filterParam) {
    const ids = filterParam
      .split(",")
      .map((s) => s.trim())
      .map((id) => LEGACY_FILTER_ALIASES[id] ?? id)
      .filter((id): id is QuickFilterId =>
        VALID_QUICK_FILTERS.has(id as QuickFilterId),
      );
    if (ids.length > 0) return ids;
  }
  return [...DEFAULT_SCREENER_QUICK_FILTERS];
}

function readInitialSort(): { column: SortColumn; direction: SortDirection } {
  if (typeof window === "undefined") {
    return {
      column: DEFAULT_SCREENER_SORT_COLUMN,
      direction: DEFAULT_SCREENER_SORT_DIRECTION,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort");
  const dir = params.get("dir");
  if (sort === "trades" && (dir === "asc" || dir === "desc")) {
    return { column: "trades", direction: dir };
  }
  return {
    column: DEFAULT_SCREENER_SORT_COLUMN,
    direction: DEFAULT_SCREENER_SORT_DIRECTION,
  };
}

interface ScreenerClientProps {
  instruments: EnrichedInstrument[];
  status: MarketDataStatus;
  diagnostics: DataDiagnostics;
  dataMode: MarketDataMode;
  moexBaseUrl: string;
  moexTimeoutMs: number;
  liveInvestCommissions?: Record<string, LiveInvestCommission>;
}

export function ScreenerClient({
  instruments: initialInstruments,
  status: initialStatus,
  diagnostics: initialDiagnostics,
  dataMode,
  moexBaseUrl,
  moexTimeoutMs,
  liveInvestCommissions,
}: ScreenerClientProps) {
  const initialSort = useMemo(() => readInitialSort(), []);
  const initialQuickFilters = useMemo(() => readInitialQuickFilters(), []);

  const { instruments, status, diagnostics, isLoading } = useClientMoexFallback({
    dataMode,
    moexBaseUrl,
    moexTimeoutMs,
    liveInvestCommissions,
    initial: {
      instruments: initialInstruments,
      status: initialStatus,
      diagnostics: initialDiagnostics,
    },
  });

  const [mode, setMode] = useState<ScreenerMode>("all");
  const [search, setSearch] = useState("");
  const [quickFilters, setQuickFilters] =
    useState<QuickFilterId[]>(initialQuickFilters);
  const [sortColumn, setSortColumn] = useState<SortColumn>(initialSort.column);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialSort.direction,
  );
  const [selected, setSelected] = useState<EnrichedInstrument | null>(null);

  const trainingMeta = useMemo(
    () => trainingMetaMap(buildTrainingSelection(instruments)),
    [instruments],
  );

  const filterCounts = useMemo(() => {
    const counts: Partial<Record<QuickFilterId, number>> = {};
    for (const f of QUICK_FILTERS) {
      counts[f.id] = countQuickFilterMatches(instruments, f.id);
    }
    return counts;
  }, [instruments]);

  const filtered = useMemo(
    () => filterInstruments(instruments, mode, search, quickFilters),
    [instruments, mode, search, quickFilters],
  );

  const sorted = useMemo(() => {
    if (mode === "training") return filtered;
    return sortInstruments(filtered, sortColumn, sortDirection, mode);
  }, [filtered, sortColumn, sortDirection, mode]);

  const displayed = useMemo(
    () => sorted.slice(0, TABLE_DISPLAY_LIMIT),
    [sorted],
  );

  useEffect(() => {
    if (mode === "training" && filtered.length > 0) {
      const inList = filtered.some((i) => i.ticker === selected?.ticker);
      if (!inList) setSelected(filtered[0] ?? null);
      return;
    }
    if (sorted.length === 0) {
      setSelected(null);
      return;
    }
    const inList = selected && sorted.some((i) => i.ticker === selected.ticker);
    if (!inList) setSelected(sorted[0] ?? null);
  }, [sorted, selected, mode, filtered]);

  const handleSort = useCallback(
    (column: SortColumn) => {
      if (sortColumn === column) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortDirection("desc");
      }
    },
    [sortColumn],
  );

  const handleQuickFilterToggle = useCallback((filter: QuickFilterId) => {
    setQuickFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  }, []);

  const handleModeChange = useCallback((newMode: ScreenerMode) => {
    setMode(newMode);
    setSortColumn("score");
    setSortDirection("desc");
  }, []);

  const isErrorEmpty = status.source === "error" && instruments.length === 0;

  return (
    <div className="space-y-1.5">
      <div className="relative z-0 space-y-1">
        <ScreenerIntroPanel
          statusSlot={
            <CompactDataStatus
              status={status}
              diagnostics={diagnostics}
              rowCount={instruments.length}
              isLoading={isLoading}
            />
          }
        />
        <CourseLessonsStrip />
      </div>

      <div className="rounded-lg border border-terminal-border/50 bg-[#06080c]">
        <div className="space-y-2 p-2.5 lg:p-3">
          {isLoading ? (
            <LoadingState />
          ) : isErrorEmpty ? (
            <ErrorEmptyState />
          ) : (
            <>
              <ScreenerToolbar
                mode={mode}
                onModeChange={handleModeChange}
                search={search}
                onSearchChange={setSearch}
                quickFilters={quickFilters}
                onQuickFilterToggle={handleQuickFilterToggle}
                resultCount={sorted.length}
                totalCount={instruments.length}
                displayedCount={displayed.length}
                filterCounts={filterCounts}
              />

              <div className="grid min-w-0 items-start gap-2 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0">
                <ScreenerTable
                  instruments={displayed}
                  totalFiltered={sorted.length}
                  selectedTicker={selected?.ticker}
                  mode={mode}
                  trainingMeta={mode === "training" ? trainingMeta : undefined}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onSelect={setSelected}
                />
                </div>
                <div className="min-w-0 xl:max-w-[320px] 2xl:max-w-[340px]">
                  <InstrumentInspector
                    instrument={selected}
                    mode={mode}
                    trainingMeta={
                      mode === "training" && selected
                        ? trainingMeta.get(selected.ticker)
                        : undefined
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <p className="py-8 text-center text-sm text-terminal-muted">
      Загрузка MOEX ISS…
    </p>
  );
}

function ErrorEmptyState() {
  return (
    <p className="py-8 text-center text-sm text-red/90">
      MOEX ISS не ответил. Обновите страницу.
    </p>
  );
}
