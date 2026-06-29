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
} from "@/lib/screener/filter-modes";
import { ScreenerTable } from "@/components/ScreenerTable";
import { InstrumentInspector } from "@/components/InstrumentInspector";
import { ScreenerToolbar } from "@/components/screener/ScreenerToolbar";
import { CompactDataStatus } from "@/components/screener/CompactDataStatus";
import { ScreenerIntroPanel } from "@/components/screener/ScreenerIntroPanel";
import { useClientMoexFallback } from "@/lib/hooks/useClientMoexFallback";

const TABLE_DISPLAY_LIMIT = 200;

interface ScreenerClientProps {
  instruments: EnrichedInstrument[];
  status: MarketDataStatus;
  diagnostics: DataDiagnostics;
  dataMode: MarketDataMode;
  moexBaseUrl: string;
  moexTimeoutMs: number;
}

export function ScreenerClient({
  instruments: initialInstruments,
  status: initialStatus,
  diagnostics: initialDiagnostics,
  dataMode,
  moexBaseUrl,
  moexTimeoutMs,
}: ScreenerClientProps) {
  const { instruments, status, diagnostics, isLoading } = useClientMoexFallback({
    dataMode,
    moexBaseUrl,
    moexTimeoutMs,
    initial: {
      instruments: initialInstruments,
      status: initialStatus,
      diagnostics: initialDiagnostics,
    },
  });

  const [mode, setMode] = useState<ScreenerMode>("all");
  const [search, setSearch] = useState("");
  const [quickFilters, setQuickFilters] = useState<QuickFilterId[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>("tickValueRub");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selected, setSelected] = useState<EnrichedInstrument | null>(
    instruments[0] ?? null,
  );

  const trainingMeta = useMemo(
    () => trainingMetaMap(buildTrainingSelection(instruments)),
    [instruments],
  );

  const filtered = useMemo(
    () => filterInstruments(instruments, mode, search, quickFilters),
    [instruments, mode, search, quickFilters],
  );

  useEffect(() => {
    if (mode === "training" && filtered.length > 0) {
      const inList = filtered.some((i) => i.ticker === selected?.ticker);
      if (!inList) setSelected(filtered[0] ?? null);
    } else if (!selected && instruments.length > 0) {
      setSelected(instruments[0] ?? null);
    }
  }, [instruments, selected, mode, filtered]);

  const sorted = useMemo(() => {
    if (mode === "training") return filtered;
    return sortInstruments(filtered, sortColumn, sortDirection, mode);
  }, [filtered, sortColumn, sortDirection, mode]);

  const displayed = useMemo(
    () => sorted.slice(0, TABLE_DISPLAY_LIMIT),
    [sorted],
  );

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
    <div className="space-y-3">
      <ScreenerIntroPanel />

      <div className="rounded-lg border border-terminal-border/50 bg-[#06080c]">
        <div className="flex justify-end border-b border-terminal-border/40 px-3 py-1.5">
          <CompactDataStatus
            status={status}
            diagnostics={diagnostics}
            rowCount={instruments.length}
            isLoading={isLoading}
          />
        </div>
        <div className="space-y-3 p-3 lg:p-4">
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
              />

              <div className="grid gap-3 xl:grid-cols-[1fr_340px]">
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
