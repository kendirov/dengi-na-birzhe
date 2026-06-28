"use client";

import { useMemo, useState, useCallback } from "react";
import type { EnrichedInstrument } from "@/lib/types/instrument";
import type { MarketDataStatus, DataDiagnostics } from "@/lib/data/types";
import type { QuickFilterId, ScreenerMode, SortColumn, SortDirection } from "@/lib/types/screener";
import {
  filterInstruments,
  getTopInstruments,
  sortInstruments,
} from "@/lib/screener/filter-modes";
import { ScreenerTable } from "@/components/ScreenerTable";
import { InstrumentInspector } from "@/components/InstrumentInspector";
import { ScreenerToolbar } from "@/components/screener/ScreenerToolbar";
import { TopPickCard } from "@/components/screener/TopPickCard";
import {
  DataStatusStrip,
  terminalStatusLabel,
} from "@/components/screener/DataStatusStrip";
import { ScreenerIntroPanel } from "@/components/screener/ScreenerIntroPanel";
import { TerminalPanel } from "@/components/ui/TerminalPanel";

const TABLE_DISPLAY_LIMIT = 200;

interface ScreenerClientProps {
  instruments: EnrichedInstrument[];
  status: MarketDataStatus;
  diagnostics: DataDiagnostics;
}

export function ScreenerClient({
  instruments,
  status,
  diagnostics,
}: ScreenerClientProps) {
  const [mode, setMode] = useState<ScreenerMode>("technical");
  const [search, setSearch] = useState("");
  const [quickFilters, setQuickFilters] = useState<QuickFilterId[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>("rubPerPointPerLot");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selected, setSelected] = useState<EnrichedInstrument | null>(
    instruments[0] ?? null,
  );

  const filtered = useMemo(
    () => filterInstruments(instruments, mode, search, quickFilters),
    [instruments, mode, search, quickFilters],
  );

  const sorted = useMemo(
    () => sortInstruments(filtered, sortColumn, sortDirection, mode),
    [filtered, sortColumn, sortDirection, mode],
  );

  const displayed = useMemo(
    () => sorted.slice(0, TABLE_DISPLAY_LIMIT),
    [sorted],
  );

  const topPicks = useMemo(
    () => getTopInstruments(instruments, mode, 3),
    [instruments, mode],
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
    <div className="space-y-4">
      <ScreenerIntroPanel />

      <DataStatusStrip
        status={status}
        diagnostics={diagnostics}
        rowCount={instruments.length}
      />

      <TerminalPanel
        title="Учебный терминал"
        status={terminalStatusLabel(status.source)}
        scanLine={false}
      >
        <div className="space-y-4 p-3 lg:p-4">
          {isErrorEmpty ? (
            <ErrorEmptyState reason={status.fallbackReason} />
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

              {topPicks.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-terminal-muted">
                    Подборка
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {topPicks.map((inst, i) => (
                      <TopPickCard
                        key={inst.ticker}
                        rank={i + 1}
                        instrument={inst}
                        mode={mode}
                        selected={selected?.ticker === inst.ticker}
                        onSelect={() => setSelected(inst)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                <ScreenerTable
                  instruments={displayed}
                  totalFiltered={sorted.length}
                  selectedTicker={selected?.ticker}
                  mode={mode}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onSelect={setSelected}
                />
                <InstrumentInspector instrument={selected} mode={mode} />
              </div>
            </>
          )}
        </div>
      </TerminalPanel>
    </div>
  );
}

function ErrorEmptyState({ reason }: { reason?: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-red/20 bg-red/5 p-6 text-center">
      <p className="mb-2 text-sm font-semibold text-red">MOEX ISS не ответил</p>
      <p className="mb-4 max-w-md text-sm text-terminal-muted">
        Режим <code className="text-red">MARKET_DATA_MODE=live</code> не
        подставляет учебные данные. Проверьте интернет/VPN или используйте{" "}
        <code>MARKET_DATA_MODE=fallback</code> для разработки.
      </p>
      {reason && (
        <p className="max-w-lg font-mono text-xs text-terminal-muted">{reason}</p>
      )}
      <p className="mt-4 text-xs text-terminal-muted">
        Для локальной работы: <code>MARKET_DATA_MODE=mock</code> или{" "}
        <code>MARKET_DATA_MODE=fallback</code>
      </p>
    </div>
  );
}
