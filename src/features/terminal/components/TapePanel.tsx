"use client";

import { useMemo, useState } from "react";
import { fmtPrice, fmtQty } from "../data/mockMarket";
import { printLabel, printRadius, tapeRowHeightPx } from "../engine/tapeEngine";
import { useTerminalStore } from "../state/terminalStore";

export function TapePanel() {
  const { priceLevels, state, zoneClass, reportLessonAction, dispatch } = useTerminalStore();
  const { tapePrints, ladderScrollTop } = state;
  const [tooltip, setTooltip] = useState<string | null>(null);
  const rowH = tapeRowHeightPx();

  const priceIndex = useMemo(
    () => new Map(priceLevels.map((l, i) => [l.price, i])),
    [priceLevels],
  );

  const printsWithLayout = useMemo(() => {
    const byPrice = new Map<number, number>();
    return tapePrints
      .map((p) => {
        const idx = priceIndex.get(p.price);
        if (idx === undefined) return null;

        const stack = byPrice.get(p.price) ?? 0;
        byPrice.set(p.price, stack + 1);

        const y = idx * rowH + rowH / 2;
        const r = printRadius(p.qty, p.isLarge);
        const laneX = Math.max(4, (p.laneX ?? 88) - stack * 2.2);

        return { print: p, y, r, laneX, stack };
      })
      .filter(Boolean) as Array<{
      print: (typeof tapePrints)[0];
      y: number;
      r: number;
      laneX: number;
      stack: number;
    }>;
  }, [tapePrints, priceIndex, rowH]);

  return (
    <section
      className={`cscalp-tape cscalp-zone cscalp-panel-border-r ${zoneClass("lenta")}`}
      aria-label="Лента сделок"
      data-tour-id="tape"
      onClick={() => {
        if (state.practiceSession.active && !state.lessonId) {
          dispatch({ type: "PRACTICE_TAPE_CLICK" });
          return;
        }
        if (state.mode === "practice" && state.lessonId === "first-trade") {
          reportLessonAction("observeTape");
        }
      }}
    >
      <div
        className="cscalp-tape__lane"
        style={{ transform: `translateY(-${ladderScrollTop}px)` }}
      >
        {printsWithLayout.map(({ print: p, y, r, laneX }) => (
          <div
            key={p.id}
            className={[
              "cscalp-tape__print",
              `cscalp-tape__print--${p.side === "buy" ? "buy" : "sell"}`,
              p.isLarge ? "cscalp-tape__print--large" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              top: y - r,
              left: `${laneX}%`,
              width: r * 2,
              height: r * 2,
              opacity: p.opacity,
              fontSize:
                r >= 18 ? "var(--cscalp-tape-bubble-font-lg)" : "var(--cscalp-tape-bubble-font)",
            }}
            onMouseEnter={() =>
              setTooltip(
                `${p.side === "buy" ? "Buy" : "Sell"} ${fmtQty(p.qty)} @ ${fmtPrice(p.price)}`,
              )
            }
            onMouseLeave={() => setTooltip(null)}
          >
            {printLabel(p.qty)}
          </div>
        ))}
      </div>

      {tooltip && <div className="cscalp-tape__tooltip">{tooltip}</div>}
    </section>
  );
}
