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
  getTopInstruments,
  sortInstruments,
  countModeInstruments,
} from "@/lib/screener/filter-modes";
import { ScreenerTable } from "@/components/ScreenerTable";
import { InstrumentInspector } from "@/components/InstrumentInspector";
import { ScreenerToolbar } from "@/components/screener/ScreenerToolbar";
import {
  DataStatusStrip,
  terminalStatusLabel,
} from "@/components/screener/DataStatusStrip";
import { ScreenerIntroPanel } from "@/components/screener/ScreenerIntroPanel";
import { ReturnLogicPanel } from "@/components/screener/ReturnLogicPanel";
import { ScreenerUseGuide } from "@/components/screener/ScreenerUseGuide";
import { ModeExplainerPanel } from "@/components/screener/ModeExplainerPanel";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
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

  const [mode, setMode] = useState<ScreenerMode>("technical");
  const [search, setSearch] = useState("");
  const [quickFilters, setQuickFilters] = useState<QuickFilterId[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>("tickValueRub");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selected, setSelected] = useState<EnrichedInstrument | null>(
    instruments[0] ?? null,
  );

  useEffect(() => {
    if (!selected && instruments.length > 0) {
      setSelected(instruments[0] ?? null);
    }
  }, [instruments, selected]);

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

  const modeCount = useMemo(
    () => countModeInstruments(instruments, mode),
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
      <ScreenerIntroPanel mode={mode} onModeSelect={handleModeChange} />

      <ReturnLogicPanel />

      <ScreenerUseGuide />

      <DataStatusStrip
        status={status}
        diagnostics={diagnostics}
        rowCount={instruments.length}
        isLoading={isLoading}
      />

      <TerminalPanel
        title="Учебный терминал"
        status={isLoading ? "Загрузка MOEX ISS…" : terminalStatusLabel(status.source)}
        scanLine={false}
      >
        <div className="space-y-4 p-3 lg:p-4">
          {isLoading ? (
            <LoadingState />
          ) : isErrorEmpty ? (
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

              <ModeExplainerPanel
                mode={mode}
                topPicks={topPicks}
                modeCount={modeCount}
                selectedTicker={selected?.ticker}
                onSelect={setSelected}
              />

              <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                <ScreenerTable
                  instruments={displayed}
                  totalFiltered={sorted.length}
                  selectedTicker={selected?.ticker}
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

function LoadingState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-green/20 bg-green/5 p-6 text-center">
      <p className="mb-2 text-sm font-semibold text-green">Загрузка MOEX ISS…</p>
      <p className="max-w-md text-sm text-terminal-muted">
        Запрашиваем реальные данные TQBR с iss.moex.com через браузер.
      </p>
    </div>
  );
}

function ErrorEmptyState({ reason }: { reason?: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-red/20 bg-red/5 p-6 text-center">
      <p className="mb-2 text-sm font-semibold text-red">MOEX ISS не ответил</p>
      <p className="mb-4 max-w-md text-sm text-terminal-muted">
        Сервер Vercel не может достучаться до MOEX. Браузерная загрузка тоже не
        удалась. Проверьте интернет или используйте{" "}
        <code className="text-red">MARKET_DATA_MODE=fallback</code>.
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
