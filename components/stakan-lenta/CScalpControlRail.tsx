"use client";

import { useState } from "react";
import {
  CSCALP,
  DRIVE_VOLUME_KEYS,
  type DriveVolumeKey,
} from "@/lib/stakan-lenta/cscalp-theme";

interface CScalpControlRailProps {
  volumeKey: DriveVolumeKey;
  onVolumeChange: (v: DriveVolumeKey) => void;
}

export function CScalpControlRail({ volumeKey, onVolumeChange }: CScalpControlRailProps) {
  const [modeL, setModeL] = useState(true);
  const [modeD, setModeD] = useState(false);

  return (
    <div
      className="flex shrink-0 flex-col items-center gap-0.5 py-1"
      style={{
        width: 44,
        background: CSCALP.panel,
        borderRight: `1px solid ${CSCALP.border}`,
      }}
    >
      <span
        className="flex h-4 w-4 items-center justify-center text-[8px]"
        style={{ color: CSCALP.textMuted }}
      >
        ⚙
      </span>
      <RailToggle active={modeL} onClick={() => setModeL((v) => !v)}>
        L
      </RailToggle>
      <RailToggle active={modeD} onClick={() => setModeD((v) => !v)}>
        D
      </RailToggle>
      <span className="mt-0.5 font-mono text-[8px]" style={{ color: CSCALP.textMuted }}>
        x1
      </span>
      <span className="font-mono text-[8px]" style={{ color: CSCALP.clusterBuy }}>
        +0,02%
      </span>
      <div className="mt-auto flex w-full flex-col gap-0.5 px-1 pb-1">
        {DRIVE_VOLUME_KEYS.map((v) => {
          const active = volumeKey === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onVolumeChange(v)}
              className="font-mono text-[10px] font-bold tabular-nums transition-colors"
              style={{
                padding: "3px 0",
                background: active ? CSCALP.volumeKeyActiveBg : CSCALP.volumeKey,
                color: active ? "#fff" : CSCALP.text,
                border: active
                  ? `1px solid ${CSCALP.volumeKeyActive}`
                  : `1px solid ${CSCALP.volumeKeyBorder}`,
              }}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RailToggle({
  children,
  active,
  onClick,
}: {
  children: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-4 w-4 items-center justify-center font-mono text-[9px]"
      style={{
        border: `1px solid ${active ? CSCALP.textMuted : CSCALP.border}`,
        color: active ? CSCALP.text : CSCALP.textMuted,
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}
