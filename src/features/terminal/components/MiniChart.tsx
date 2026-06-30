"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CHART_H, REFERENCE_WIDTH, isChartDockForcedOpen } from "../constants/referenceLayout";
import { fmtPrice } from "../data/mockMarket";
import {
  CHART_TIME_AXIS,
  candleWidth,
  chartDisplayPrice,
  chartPriceExtents,
  indexToX,
  maxChartVolume,
  newDrawingId,
  priceToY,
  xToIndex,
  yToPrice,
} from "../engine/chartEngine";
import { useTerminalStore } from "../state/terminalStore";
import type { ChartDrawing, ChartDrawingTool, ChartPoint } from "../types";

const VIEW_W = REFERENCE_WIDTH;
const VIEW_H = CHART_H;

const PAD = { left: 4, right: 42, top: 6, vol: 20, time: 11, gap: 2 };

function renderCandle(
  p: ChartPoint,
  i: number,
  plotLeft: number,
  plotWidth: number,
  plotTop: number,
  plotHeight: number,
  min: number,
  max: number,
  barW: number,
) {
  const x = indexToX(i, plotLeft, plotWidth);
  const open = p.open ?? p.price;
  const close = p.price;
  const high = p.high ?? Math.max(open, close);
  const low = p.low ?? Math.min(open, close);
  const up = close >= open;
  const color = up ? "var(--cscalp-chart-candle-up)" : "var(--cscalp-chart-candle-down)";

  const yHigh = priceToY(high, min, max, plotTop, plotHeight);
  const yLow = priceToY(low, min, max, plotTop, plotHeight);
  const yOpen = priceToY(open, min, max, plotTop, plotHeight);
  const yClose = priceToY(close, min, max, plotTop, plotHeight);
  const bodyTop = Math.min(yOpen, yClose);
  const bodyH = Math.max(1, Math.abs(yClose - yOpen));

  return (
    <g key={`candle-${i}`}>
      <line
        x1={x}
        y1={yHigh}
        x2={x}
        y2={yLow}
        stroke={color}
        strokeWidth={1}
        shapeRendering="crispEdges"
      />
      <rect
        x={x - barW / 2}
        y={bodyTop}
        width={barW}
        height={bodyH}
        fill={color}
        shapeRendering="crispEdges"
      />
    </g>
  );
}

export function ChartPanel() {
  const { state, zoneClass, dispatch } = useTerminalStore();
  const {
    chartOpen,
    chartPoints,
    chartDrawings,
    chartDrawingTool,
    chartHoverIndex,
    mode,
  } = state;

  const svgRef = useRef<SVGSVGElement>(null);
  const [rectDraft, setRectDraft] = useState<{
    indexStart: number;
    priceTop: number;
    indexEnd: number;
    priceBottom: number;
  } | null>(null);
  const [arrowDraft, setArrowDraft] = useState<{
    indexFrom: number;
    priceFrom: number;
  } | null>(null);

  const showTools = mode === "explain" || mode === "presenter";

  const plotTop = PAD.top;
  const plotBottom = VIEW_H - PAD.vol - PAD.time - PAD.gap;
  const plotHeight = plotBottom - plotTop;
  const plotLeft = PAD.left;
  const plotWidth = VIEW_W - PAD.left - PAD.right;
  const volTop = plotBottom + PAD.gap;
  const volHeight = PAD.vol;
  const timeY = VIEW_H - 3;

  const { min, max } = useMemo(() => chartPriceExtents(chartPoints), [chartPoints]);
  const maxVol = useMemo(() => maxChartVolume(chartPoints), [chartPoints]);
  const barW = candleWidth(plotWidth);
  const displayPrice = chartDisplayPrice(chartPoints);
  const currentY = priceToY(displayPrice, min, max, plotTop, plotHeight);

  const clientToChart = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const scaleX = VIEW_W / rect.width;
      const scaleY = VIEW_H / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const pointerInPlot = (y: number) => y >= plotTop && y <= plotBottom;

  const handlePointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const pt = clientToChart(e.clientX, e.clientY);
    if (!pt || !pointerInPlot(pt.y)) {
      dispatch({ type: "SET_CHART_HOVER", index: null });
      return;
    }
    const index = xToIndex(pt.x, plotLeft, plotWidth);
    dispatch({ type: "SET_CHART_HOVER", index });

    if (rectDraft && chartDrawingTool === "rectangle") {
      const price = yToPrice(pt.y, min, max, plotTop, plotHeight);
      setRectDraft({
        ...rectDraft,
        indexEnd: index,
        priceBottom: price,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGRectElement>) => {
    const pt = clientToChart(e.clientX, e.clientY);
    if (!pt || !pointerInPlot(pt.y)) return;

    const index = xToIndex(pt.x, plotLeft, plotWidth);
    const price = yToPrice(pt.y, min, max, plotTop, plotHeight);

    if (chartDrawingTool === "horizontal") {
      dispatch({
        type: "ADD_CHART_DRAWING",
        drawing: { id: newDrawingId(), type: "horizontal", price },
      });
      return;
    }

    if (chartDrawingTool === "rectangle") {
      setRectDraft({
        indexStart: index,
        indexEnd: index,
        priceTop: price,
        priceBottom: price,
      });
      return;
    }

    if (chartDrawingTool === "arrow") {
      if (!arrowDraft) {
        setArrowDraft({ indexFrom: index, priceFrom: price });
      } else {
        dispatch({
          type: "ADD_CHART_DRAWING",
          drawing: {
            id: newDrawingId(),
            type: "arrow",
            indexFrom: arrowDraft.indexFrom,
            priceFrom: arrowDraft.priceFrom,
            indexTo: index,
            priceTo: price,
          },
        });
        setArrowDraft(null);
      }
    }
  };

  const handlePointerUp = () => {
    if (rectDraft && chartDrawingTool === "rectangle") {
      const top = Math.max(rectDraft.priceTop, rectDraft.priceBottom);
      const bottom = Math.min(rectDraft.priceTop, rectDraft.priceBottom);
      const start = Math.min(rectDraft.indexStart, rectDraft.indexEnd);
      const end = Math.max(rectDraft.indexStart, rectDraft.indexEnd);
      if (end > start || top - bottom > 0.005) {
        dispatch({
          type: "ADD_CHART_DRAWING",
          drawing: {
            id: newDrawingId(),
            type: "rectangle",
            priceTop: top,
            priceBottom: bottom,
            indexStart: start,
            indexEnd: end,
          },
        });
      }
      setRectDraft(null);
    }
  };

  const setTool = (tool: ChartDrawingTool) => {
    dispatch({ type: "SET_CHART_DRAWING_TOOL", tool });
    setArrowDraft(null);
    setRectDraft(null);
  };

  if (!isChartDockForcedOpen(mode) && !chartOpen) return null;

  const hoverPoint =
    chartHoverIndex != null ? chartPoints[chartHoverIndex] : null;
  const hoverX =
    chartHoverIndex != null
      ? indexToX(chartHoverIndex, plotLeft, plotWidth)
      : null;

  const renderDrawing = (d: ChartDrawing) => {
    if (d.type === "horizontal" && d.price != null) {
      const y = priceToY(d.price, min, max, plotTop, plotHeight);
      return (
        <line
          key={d.id}
          x1={plotLeft}
          y1={y}
          x2={plotLeft + plotWidth}
          y2={y}
          stroke="var(--cscalp-highlight-ring)"
          strokeWidth={1}
          strokeDasharray="4 3"
          shapeRendering="crispEdges"
        />
      );
    }
    if (
      d.type === "rectangle" &&
      d.priceTop != null &&
      d.priceBottom != null &&
      d.indexStart != null &&
      d.indexEnd != null
    ) {
      const x = indexToX(d.indexStart, plotLeft, plotWidth);
      const w = indexToX(d.indexEnd, plotLeft, plotWidth) - x;
      const y = priceToY(d.priceTop, min, max, plotTop, plotHeight);
      const h = priceToY(d.priceBottom, min, max, plotTop, plotHeight) - y;
      return (
        <rect
          key={d.id}
          x={x}
          y={y}
          width={Math.max(2, w)}
          height={Math.max(2, Math.abs(h))}
          fill="rgba(34, 211, 238, 0.08)"
          stroke="var(--cscalp-highlight-ring)"
          strokeWidth={1}
        />
      );
    }
    if (
      d.type === "arrow" &&
      d.indexFrom != null &&
      d.priceFrom != null &&
      d.indexTo != null &&
      d.priceTo != null
    ) {
      const x1 = indexToX(d.indexFrom, plotLeft, plotWidth);
      const y1 = priceToY(d.priceFrom, min, max, plotTop, plotHeight);
      const x2 = indexToX(d.indexTo, plotLeft, plotWidth);
      const y2 = priceToY(d.priceTo, min, max, plotTop, plotHeight);
      return (
        <g key={d.id}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--cscalp-highlight-ring)"
            strokeWidth={1.5}
            markerEnd="url(#cscalp-chart-arrowhead)"
          />
        </g>
      );
    }
    return null;
  };

  const priceTagW = 38;
  const priceTagH = 13;
  const priceTagX = VIEW_W - PAD.right + 2;
  const priceTagY = currentY - priceTagH / 2;

  return (
    <section
      className={`cscalp-chart cscalp-chart--embedded cscalp-zone ${zoneClass("chart")}`}
      aria-label="График GAZP"
      data-tour-id="chart-panel"
    >
      {showTools && (
        <div className="cscalp-chart__tools">
          {(
            [
              ["horizontal", "— lvl"],
              ["rectangle", "▭ zone"],
              ["arrow", "→"],
            ] as const
          ).map(([tool, label]) => (
            <button
              key={tool}
              type="button"
              className={`cscalp-chart__tool${
                chartDrawingTool === tool ? " cscalp-chart__tool--active" : ""
              }`}
              onClick={() => setTool(chartDrawingTool === tool ? null : tool)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className="cscalp-chart__tool"
            onClick={() => dispatch({ type: "CLEAR_CHART_DRAWINGS" })}
          >
            ✕ all
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        className="cscalp-chart__svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        role="img"
      >
        <defs>
          <marker
            id="cscalp-chart-arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--cscalp-highlight-ring)" />
          </marker>
        </defs>

        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="var(--cscalp-chart-bg)" />

        {Array.from({ length: 5 }, (_, i) => {
          const y = plotTop + (plotHeight / 4) * i;
          return (
            <line
              key={`gh-${i}`}
              x1={plotLeft}
              y1={y}
              x2={plotLeft + plotWidth}
              y2={y}
              stroke="var(--cscalp-chart-grid)"
              strokeWidth={1}
              shapeRendering="crispEdges"
              opacity={0.75}
            />
          );
        })}

        {CHART_TIME_AXIS.map(({ index }) => {
          const x = indexToX(index, plotLeft, plotWidth);
          return (
            <line
              key={`gv-${index}`}
              x1={x}
              y1={plotTop}
              x2={x}
              y2={plotBottom}
              stroke="var(--cscalp-chart-grid)"
              strokeWidth={1}
              shapeRendering="crispEdges"
              opacity={0.28}
            />
          );
        })}

        {chartPoints.map((p, i) =>
          renderCandle(p, i, plotLeft, plotWidth, plotTop, plotHeight, min, max, barW),
        )}

        {chartPoints.map((p, i) => {
          const x = indexToX(i, plotLeft, plotWidth);
          const barH = (p.volume / maxVol) * volHeight;
          return (
            <rect
              key={`vol-${i}`}
              x={x - 1.5}
              y={volTop + volHeight - barH}
              width={3}
              height={Math.max(1, barH)}
              fill={p.up ? "var(--cscalp-chart-candle-up)" : "var(--cscalp-chart-candle-down)"}
              opacity={0.5}
            />
          );
        })}

        {chartDrawings.map(renderDrawing)}
        {rectDraft && (
          <rect
            x={indexToX(
              Math.min(rectDraft.indexStart, rectDraft.indexEnd),
              plotLeft,
              plotWidth,
            )}
            y={priceToY(
              Math.max(rectDraft.priceTop, rectDraft.priceBottom),
              min,
              max,
              plotTop,
              plotHeight,
            )}
            width={Math.max(
              2,
              Math.abs(
                indexToX(rectDraft.indexEnd, plotLeft, plotWidth) -
                  indexToX(rectDraft.indexStart, plotLeft, plotWidth),
              ),
            )}
            height={Math.max(
              2,
              Math.abs(
                priceToY(rectDraft.priceTop, min, max, plotTop, plotHeight) -
                  priceToY(rectDraft.priceBottom, min, max, plotTop, plotHeight),
              ),
            )}
            fill="rgba(34, 211, 238, 0.12)"
            stroke="var(--cscalp-highlight-ring)"
            strokeDasharray="3 2"
            strokeWidth={1}
          />
        )}

        <line
          x1={plotLeft}
          y1={currentY}
          x2={plotLeft + plotWidth}
          y2={currentY}
          stroke="var(--cscalp-chart-price-line)"
          strokeWidth={1}
          shapeRendering="crispEdges"
          opacity={0.95}
        />

        <rect
          x={priceTagX}
          y={priceTagY}
          width={priceTagW}
          height={priceTagH}
          fill="var(--cscalp-chart-price-tag-bg)"
          rx={1}
        />
        <text
          x={priceTagX + priceTagW / 2}
          y={priceTagY + priceTagH - 3}
          textAnchor="middle"
          fill="var(--cscalp-chart-price-tag-text)"
          fontSize="var(--cscalp-chart-price-tag-font)"
          fontFamily="var(--cscalp-font-mono)"
          fontWeight={700}
        >
          {fmtPrice(displayPrice)}
        </text>

        {hoverX != null && hoverPoint && (
          <>
            <line
              x1={hoverX}
              y1={plotTop}
              x2={hoverX}
              y2={plotBottom}
              stroke="var(--cscalp-text-secondary)"
              strokeWidth={1}
              opacity={0.45}
              shapeRendering="crispEdges"
            />
          </>
        )}

        <rect
          x={plotLeft}
          y={plotTop}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => dispatch({ type: "SET_CHART_HOVER", index: null })}
        />

        {[min, max].map((price, i) => (
          <text
            key={`axis-${i}`}
            x={VIEW_W - PAD.right + 2}
            y={priceToY(price, min, max, plotTop, plotHeight) + 3}
            fill="var(--cscalp-text-secondary)"
            fontSize="var(--cscalp-chart-axis-font)"
            fontFamily="var(--cscalp-font-mono)"
          >
            {fmtPrice(price)}
          </text>
        ))}

        {CHART_TIME_AXIS.map(({ index, label }) => (
          <text
            key={`time-${label}`}
            x={indexToX(index, plotLeft, plotWidth)}
            y={timeY}
            textAnchor="middle"
            fill="var(--cscalp-chart-time-color)"
            fontSize="var(--cscalp-chart-time-font)"
            fontFamily="var(--cscalp-font-mono)"
          >
            {label}
          </text>
        ))}

        {hoverPoint && hoverX != null && (
          <g className="cscalp-chart__hover-label">
            <rect
              x={Math.min(hoverX + 6, VIEW_W - 88)}
              y={plotTop + 2}
              width={82}
              height={26}
              rx={2}
              fill="rgba(10, 11, 16, 0.92)"
              stroke="var(--cscalp-grid-line)"
            />
            <text
              x={Math.min(hoverX + 12, VIEW_W - 82)}
              y={plotTop + 14}
              fill="var(--cscalp-text-primary)"
              fontSize={9}
              fontFamily="var(--cscalp-font-mono)"
            >
              {hoverPoint.time}
            </text>
            <text
              x={Math.min(hoverX + 12, VIEW_W - 82)}
              y={plotTop + 24}
              fill="var(--cscalp-chart-candle-up)"
              fontSize={9}
              fontFamily="var(--cscalp-font-mono)"
            >
              {fmtPrice(hoverPoint.price)}
            </text>
          </g>
        )}
      </svg>
    </section>
  );
}

/** @deprecated alias */
export const MiniChart = ChartPanel;
