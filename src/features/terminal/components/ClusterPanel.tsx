"use client";

import { useMemo, useState } from "react";
import { fmtClusterVol, fmtQty } from "../data/mockMarket";
import { fmtClusterDelta, getCellFootprint } from "../engine/clusterEngine";
import { useDebugQuery } from "../hooks/useDebugQuery";
import { useTerminalStore } from "../state/terminalStore";
import type { ClusterLevel } from "../types";

const DEMO_POC_PRICE = 101.75;
const DEMO_POC_COL = 7;

function levelAt(
  candleIdx: number,
  price: number,
  candles: ReturnType<typeof useTerminalStore>["state"]["clusterCandles"],
) {
  return candles[candleIdx]?.levels.find((l) => l.price === price);
}

export function ClusterPanel() {
  const { clusterDebug } = useDebugQuery();
  const { priceLevels, zoneClass, state, dispatch, reportLessonAction } = useTerminalStore();
  const { clusterCandles, ladderScrollTop, hoveredLadderPrice, highlightZone } = state;
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    level: ClusterLevel;
  } | null>(null);

  const columnMaxByIdx = useMemo(
    () => clusterCandles.map((col) => Math.max(col.maxVol, 1)),
    [clusterCandles],
  );

  const panelClass = useMemo(() => {
    const base = `cscalp-clusters cscalp-zone cscalp-panel-border-r ${zoneClass("klastera")}`;
    if (clusterDebug) {
      return `${base} cscalp-clusters--debug`;
    }
    if (
      highlightZone === "klastera-cell" ||
      highlightZone === "klastera-footer"
    ) {
      return `${base} cscalp-clusters--sub-highlight`;
    }
    return base;
  }, [zoneClass, highlightZone, clusterDebug]);

  const bodyZoneClass =
    highlightZone === "klastera" || highlightZone === "klastera-cell"
      ? "cscalp-zone--active"
      : highlightZone === "klastera-footer"
        ? "cscalp-zone--dimmed"
        : zoneClass("klastera") === "cscalp-zone--dimmed"
          ? "cscalp-zone--dimmed"
          : "";

  const footerZoneClass =
    highlightZone === "klastera" || highlightZone === "klastera-footer"
      ? "cscalp-zone--active"
      : highlightZone === "klastera-cell"
        ? "cscalp-zone--dimmed"
        : zoneClass("klastera") === "cscalp-zone--dimmed"
          ? "cscalp-zone--dimmed"
          : "";

  const handleCellEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    level: ClusterLevel,
  ) => {
    dispatch({ type: "SET_HOVERED_LADDER_PRICE", price: level.price });
    setTooltip({ x: e.clientX, y: e.clientY, level });
  };

  const handleCellLeave = () => {
    dispatch({ type: "SET_HOVERED_LADDER_PRICE", price: null });
    setTooltip(null);
  };

  const handleCellClick = (level: ClusterLevel) => {
    if (state.mode === "practice" && state.lessonId === "first-trade") {
      reportLessonAction("observeCluster");
    }
    if (state.mode === "explain" || state.mode === "presenter") return;
    const msg = `Объём на уровне ${level.price.toFixed(2).replace(".", ",")}: buy ${fmtClusterVol(level.buyVol)}, sell ${fmtClusterVol(level.sellVol)}`;
    dispatch({ type: "SET_CLUSTER_HINT", hint: "Объём на уровне" });
    dispatch({ type: "SET_FEEDBACK", message: msg });
  };

  return (
    <section className={panelClass} aria-label="Кластера" data-tour-id="clusters">
      {clusterDebug && (
        <div className="cscalp-clusters__debug-badge" aria-hidden>
          clusterDebug · row-h: var(--cscalp-row-h)
        </div>
      )}

      <div className={`cscalp-clusters__body ${bodyZoneClass}`}>
        <div
          className="cscalp-clusters__scroll-inner"
          style={{ transform: `translateY(-${ladderScrollTop}px)` }}
        >
          {priceLevels.map((lv, rowIdx) => (
            <div key={lv.price} className="cscalp-row" data-cluster-row={rowIdx}>
              {clusterCandles.map((col, colIdx) => {
                const level = levelAt(colIdx, lv.price, clusterCandles);
                const empty = !level || level.totalVol <= 0;
                const visual = empty
                  ? null
                  : getCellFootprint(level, columnMaxByIdx[colIdx]!);

                if (empty || !visual) {
                  return (
                    <div
                      key={col.time}
                      className="cscalp-clusters__cell cscalp-clusters__cell--empty"
                      data-col-idx={colIdx}
                    />
                  );
                }

                const isDemoCell =
                  highlightZone === "klastera-cell" &&
                  lv.price === DEMO_POC_PRICE &&
                  colIdx === DEMO_POC_COL;
                const isHovered = hoveredLadderPrice === level.price;

                return (
                  <div
                    key={col.time}
                    role="gridcell"
                    data-col-idx={colIdx}
                    className={[
                      "cscalp-clusters__cell",
                      visual.isPoc ? "cscalp-clusters__cell--poc" : "",
                      isDemoCell ? "cscalp-clusters__cell--lesson-demo" : "",
                      isHovered ? "cscalp-clusters__cell--hover" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={(e) => handleCellEnter(e, level)}
                    onMouseLeave={handleCellLeave}
                    onClick={() => handleCellClick(level)}
                  >
                    {visual.fillTier !== "none" && (
                      <span
                        className={[
                          "cscalp-clusters__fill",
                          `cscalp-clusters__fill--${visual.fillTier}`,
                          `cscalp-clusters__fill--${visual.fillSide}`,
                        ].join(" ")}
                        style={{ width: `${visual.fillWidthPct}%` }}
                        aria-hidden
                      />
                    )}
                    <span
                      className={[
                        "cscalp-clusters__val",
                        `cscalp-clusters__val--${visual.textTone}`,
                      ].join(" ")}
                    >
                      {fmtClusterVol(level.totalVol)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className={`cscalp-clusters__footer ${footerZoneClass}`}>
        {clusterCandles.map((col, colIdx) => (
          <div
            key={col.time}
            className="cscalp-clusters__foot-col"
            data-col-idx={colIdx}
          >
            <div className="cscalp-clusters__foot-stat cscalp-clusters__foot-stat--time">
              {col.time}
            </div>
            <div className="cscalp-clusters__foot-stat" title="Общий объём">
              {fmtQty(col.totalVol)}
            </div>
            <div
              className={`cscalp-clusters__foot-stat${
                col.delta >= 0
                  ? " cscalp-clusters__foot-stat--buy"
                  : " cscalp-clusters__foot-stat--sell"
              }`}
              title="Delta"
            >
              {fmtClusterDelta(col.delta)}
            </div>
            <div
              className="cscalp-clusters__foot-stat cscalp-clusters__foot-stat--max"
              title="Max volume"
            >
              {fmtClusterVol(col.maxVol)}
            </div>
          </div>
        ))}
      </div>

      {tooltip && (
        <div
          className="cscalp-clusters__tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y + 8 }}
        >
          <div>{tooltip.level.price.toFixed(2).replace(".", ",")}</div>
          <div>Buy {fmtClusterVol(tooltip.level.buyVol)}</div>
          <div>Sell {fmtClusterVol(tooltip.level.sellVol)}</div>
          <div>Δ {fmtClusterDelta(tooltip.level.delta)}</div>
          <div>Σ {fmtClusterVol(tooltip.level.totalVol)}</div>
        </div>
      )}
    </section>
  );
}
