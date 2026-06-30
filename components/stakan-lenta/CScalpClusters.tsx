"use client";

import type { ClusterColumn, OrderBookLevel } from "@/lib/stakan-lenta/cscalp-mock-data";
import { CSCALP, type HighlightZone, zoneHighlightClass } from "@/lib/stakan-lenta/cscalp-theme";
import { fmtClusterVol, fmtQty } from "@/lib/stakan-lenta/cscalp-sim";

interface CScalpClustersProps {
  levels: OrderBookLevel[];
  columns: ClusterColumn[];
  highlight: HighlightZone;
}

export function CScalpClusters({ levels, columns, highlight }: CScalpClustersProps) {
  const colW = Math.floor(390 / Math.max(columns.length, 1));

  return (
    <div
      className={`relative flex min-h-0 flex-col overflow-hidden transition-all duration-200 ${zoneHighlightClass("klastera", highlight)}`}
      style={{ borderRight: `1px solid ${CSCALP.border}` }}
    >
      <div className="flex shrink-0" style={{ background: CSCALP.panel }}>
        {columns.map((col) => (
          <div
            key={col.time}
            className="text-center font-mono text-[8px]"
            style={{
              width: colW,
              color: CSCALP.textMuted,
              borderRight: `1px solid ${CSCALP.border}`,
              padding: "3px 0",
            }}
          >
            {col.time}
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {levels.map((lv) => (
          <div key={lv.price} className="flex" style={{ height: CSCALP.rowH }}>
            {columns.map((col) => {
              const cell = col.cells.get(lv.price);
              if (!cell || (cell.buy === 0 && cell.sell === 0)) {
                return (
                  <div
                    key={col.time}
                    style={{
                      width: colW,
                      height: CSCALP.rowH,
                      borderRight: `1px solid ${CSCALP.border}`,
                    }}
                  />
                );
              }

              const showBuy = cell.buy >= cell.sell;
              const vol = showBuy ? cell.buy : cell.sell;
              let color: string = showBuy ? CSCALP.clusterBuy : CSCALP.clusterSell;
              if (vol < 15) color = CSCALP.clusterNeutral;

              let boxShadow: string | undefined;
              if (cell.poc === "white") boxShadow = `inset 0 0 0 1px ${CSCALP.clusterPocWhite}`;
              if (cell.poc === "red") boxShadow = `inset 0 0 0 1px ${CSCALP.clusterPocRed}`;
              if (cell.poc === "green") boxShadow = `inset 0 0 0 1px ${CSCALP.clusterPocGreen}`;

              return (
                <div
                  key={col.time}
                  className="flex items-center justify-center font-mono text-[8px] tabular-nums"
                  style={{
                    width: colW,
                    height: CSCALP.rowH,
                    borderRight: `1px solid ${CSCALP.border}`,
                    color,
                    boxShadow,
                  }}
                >
                  {fmtClusterVol(vol)}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div
        className="shrink-0"
        style={{ borderTop: `1px solid ${CSCALP.border}`, background: CSCALP.panel }}
      >
        <div className="flex font-mono text-[8px]">
          {columns.map((col) => (
            <div
              key={`b-${col.time}`}
              className="text-center tabular-nums"
              style={{
                width: colW,
                padding: "2px 0",
                color: CSCALP.clusterBuy,
                borderRight: `1px solid ${CSCALP.border}`,
              }}
            >
              {fmtQty(col.totalBuy)}
            </div>
          ))}
        </div>
        <div className="flex font-mono text-[8px]">
          {columns.map((col) => (
            <div
              key={`s-${col.time}`}
              className="text-center tabular-nums"
              style={{
                width: colW,
                padding: "2px 0",
                color: CSCALP.clusterSell,
                borderRight: `1px solid ${CSCALP.border}`,
              }}
            >
              {fmtQty(col.totalSell)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
