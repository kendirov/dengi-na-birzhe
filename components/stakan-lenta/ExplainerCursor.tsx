"use client";

import { useCallback, useRef, type RefObject } from "react";
import { buildExplainerLines } from "@/lib/stakan-lenta/explainer-metrics";

const CURSOR_OFFSET = 15;
const ACTIVE_ROW_SHADOW =
  "inset 0 0 0 9999px rgba(34,211,238,0.1), inset 0 0 0 1px rgb(34,211,238)";

function CrosshairIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="-translate-x-1/2 -translate-y-1/2"
    >
      <line x1="10" y1="2" x2="10" y2="18" stroke="#94a3b8" strokeWidth="0.75" />
      <line x1="2" y1="10" x2="18" y2="10" stroke="#94a3b8" strokeWidth="0.75" />
      <circle cx="10" cy="10" r="1.5" fill="#94a3b8" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M1 9 L4 6 L6 7.5 L11 2"
        stroke="#94a3b8"
        strokeWidth="0.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExplainerCursorOverlay({
  crosshairRef,
  tooltipRef,
  line1Ref,
  line2Ref,
}: {
  crosshairRef: RefObject<HTMLDivElement | null>;
  tooltipRef: RefObject<HTMLDivElement | null>;
  line1Ref: RefObject<HTMLParagraphElement | null>;
  line2Ref: RefObject<HTMLParagraphElement | null>;
}) {
  return (
    <>
      <div
        ref={crosshairRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0"
        style={{ willChange: "transform" }}
        aria-hidden
      >
        <CrosshairIcon />
      </div>

      <div
        ref={tooltipRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] min-w-[210px] opacity-0"
        style={{ willChange: "transform" }}
        role="tooltip"
        aria-hidden
      >
        <div className="rounded-md border border-slate-800 bg-slate-950/70 px-2.5 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mb-1 flex items-center gap-1.5">
            <ChartIcon />
            <span className="text-[9px] uppercase tracking-wide text-slate-500">
              Explainer
            </span>
          </div>
          <p
            ref={line1Ref}
            className="font-mono text-[10px] leading-snug text-slate-300"
          >
            Pos: — | Stop: — | RR: —
          </p>
          <p
            ref={line2Ref}
            className="mt-0.5 font-mono text-[10px] leading-snug text-slate-400"
          >
            Risk: —
          </p>
        </div>
      </div>
    </>
  );
}

/** Zero-lag cursor: mutates DOM refs, no React state for x/y. */
export function useExplainerCursor() {
  const crosshairRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const activeRowRef = useRef<HTMLElement | null>(null);
  const activePriceRef = useRef<number | null>(null);

  const setVisible = useCallback((visible: boolean) => {
    const opacity = visible ? "1" : "0";
    crosshairRef.current?.style.setProperty("opacity", opacity);
    tooltipRef.current?.style.setProperty("opacity", opacity);
  }, []);

  const moveTo = useCallback((clientX: number, clientY: number) => {
    crosshairRef.current?.style.setProperty(
      "transform",
      `translate3d(${clientX}px, ${clientY}px, 0)`,
    );
    tooltipRef.current?.style.setProperty(
      "transform",
      `translate3d(${clientX + CURSOR_OFFSET}px, ${clientY + CURSOR_OFFSET}px, 0)`,
    );
  }, []);

  const setActiveRow = useCallback((row: HTMLElement | null, price: number | null) => {
    if (activeRowRef.current === row && activePriceRef.current === price) return;

    if (activeRowRef.current) {
      activeRowRef.current.style.removeProperty("box-shadow");
      activeRowRef.current = null;
      activePriceRef.current = null;
    }

    if (!row || price == null) return;

    row.style.setProperty("box-shadow", ACTIVE_ROW_SHADOW);
    activeRowRef.current = row;
    activePriceRef.current = price;

    const qty = Number(row.dataset.qty ?? 0);
    const { line1, line2 } = buildExplainerLines(price, qty);
    if (line1Ref.current) line1Ref.current.textContent = line1;
    if (line2Ref.current) line2Ref.current.textContent = line2;
  }, []);

  const handleGridMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      moveTo(event.clientX, event.clientY);
      setVisible(true);

      const row = (event.target as HTMLElement).closest<HTMLElement>("[data-price]");
      if (row) {
        const price = Number(row.dataset.price);
        setActiveRow(row, Number.isFinite(price) ? price : null);
      } else {
        setActiveRow(null, null);
      }
    },
    [moveTo, setVisible, setActiveRow],
  );

  const handleGridMouseLeave = useCallback(() => {
    setVisible(false);
    setActiveRow(null, null);
  }, [setVisible, setActiveRow]);

  return {
    crosshairRef,
    tooltipRef,
    line1Ref,
    line2Ref,
    handleGridMouseMove,
    handleGridMouseLeave,
  };
}
