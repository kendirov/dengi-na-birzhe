"use client";

import { BOTTOM_BARS } from "@/lib/stakan-lenta/cscalp-mock-data";
import { CSCALP } from "@/lib/stakan-lenta/cscalp-theme";

export function CScalpBottomBar() {
  return (
    <div
      className="flex shrink-0 flex-col"
      style={{
        height: 48,
        borderTop: `1px solid ${CSCALP.border}`,
        background: CSCALP.panel,
      }}
    >
      <div className="flex flex-1 items-end gap-px px-2 pb-1 pt-1">
        {BOTTOM_BARS.map((bar, i) => (
          <div
            key={i}
            className="w-2"
            style={{
              height: bar.h,
              background: bar.up ? CSCALP.bidBest : CSCALP.askBest,
              opacity: 0.75,
            }}
          />
        ))}
      </div>
      <div
        className="flex items-center gap-4 px-2 font-mono text-[9px]"
        style={{
          height: 18,
          background: CSCALP.symbolBar,
          borderTop: `1px solid ${CSCALP.border}`,
          color: CSCALP.textMuted,
        }}
      >
        <span className="cursor-default hover:text-white">Screener</span>
        <span style={{ color: CSCALP.text }}>Вкладка (1)</span>
      </div>
    </div>
  );
}
