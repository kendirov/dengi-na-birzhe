"use client";

import { INSTRUMENT_META } from "../data/mockMarket";
import { useTerminalStore } from "../state/terminalStore";
import { UiIcon } from "./UiIcon";

export function InstrumentHeader() {
  const { state, toggleChart } = useTerminalStore();
  const meta = INSTRUMENT_META;
  const { position, lastFeedback, volumeKey, currentPrice, chartOpen } = state;

  const posLabel =
    position.side === "flat"
      ? "flat"
      : `${position.side} ${position.qty} @ ${position.avgPrice.toFixed(2)}`;

  const chromeOnly = state.mode === "terminal" || state.mode === "scenario";

  return (
    <div className="cscalp-instrument" data-tour-id="instrument-header">
      <span className="cscalp-instrument__symbol-wrap">
        <span className="cscalp-instrument__symbol">{meta.symbol}</span>
        <span className="cscalp-instrument__symbol-line" aria-hidden />
      </span>

      {!chromeOnly && (
        <button
          type="button"
          className={`cscalp-instrument__icon cscalp-instrument__chart-btn${
            chartOpen ? " cscalp-instrument__chart-btn--active" : ""
          }`}
          onClick={toggleChart}
          title={chartOpen ? "Скрыть график" : "Открыть график"}
          aria-pressed={chartOpen}
          aria-label="Open chart"
        >
          <UiIcon variant="chart" />
        </button>
      )}

      {!chromeOnly && (
        <span
          className="cscalp-instrument__pos cscalp-mono"
          title="Позиция"
          style={{
            fontSize: 10,
            color:
              position.side === "long"
                ? "var(--cscalp-cluster-green)"
                : position.side === "short"
                  ? "var(--cscalp-cluster-red)"
                  : "var(--cscalp-text-secondary)",
          }}
        >
          {posLabel}
          {position.side !== "flat" && (
            <span style={{ marginLeft: 6, color: "var(--cscalp-text-secondary)" }}>
              PnL {position.pnlPoints >= 0 ? "+" : ""}
              {position.pnlPoints.toFixed(2)}
            </span>
          )}
        </span>
      )}

      <span className={`cscalp-instrument__stat${chromeOnly ? " cscalp-instrument__stat--terminal" : ""}`}>
        <span title="Last">{currentPrice.toFixed(2).replace(".", ",")}</span>
        <span title="Vol">{volumeKey}L</span>
        {!chromeOnly && (
          <span
            title="Feedback"
            data-tour-id="pre-entry"
            className="cscalp-instrument__feedback"
          >
            {state.clusterHint || lastFeedback || "—"}
          </span>
        )}
      </span>
    </div>
  );
}
