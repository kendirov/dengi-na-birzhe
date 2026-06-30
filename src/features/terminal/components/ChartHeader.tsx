"use client";

import { SYMBOL } from "../data/mockMarket";
import { CHART_INTERVAL_MIN } from "../engine/chartEngine";
import { isChartDockForcedOpen } from "../constants/referenceLayout";
import { useTerminalStore } from "../state/terminalStore";

export function ChartHeader() {
  const { state } = useTerminalStore();
  const visible = isChartDockForcedOpen(state.mode) || state.chartOpen;

  if (!visible) return null;

  return (
    <div className="cscalp-chart-header" data-tour-id="chart-header">
      <span className="cscalp-chart-header__brand">
        <span className="cscalp-chart-header__symbol-wrap">
          <span className="cscalp-chart-header__symbol">{SYMBOL}</span>
          <span className="cscalp-chart-header__symbol-line" aria-hidden />
        </span>
        <span className="cscalp-chart-header__suffix">, {CHART_INTERVAL_MIN}m</span>
      </span>
    </div>
  );
}
