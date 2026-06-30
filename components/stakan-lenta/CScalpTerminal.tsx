"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildClusterMatrix,
  buildOrderBook,
  initialTapeBubbles,
  SYMBOL,
} from "@/lib/stakan-lenta/cscalp-mock-data";
import {
  applyMarketOrder,
  randomTapeBubble,
  seedLiveBubbles,
  updateClustersFromTrade,
  type LiveTapeBubble,
} from "@/lib/stakan-lenta/cscalp-sim";
import {
  CSCALP,
  TERMINAL_GRID,
  type DriveVolumeKey,
  type HighlightZone,
} from "@/lib/stakan-lenta/cscalp-theme";
import { CScalpBottomBar } from "./CScalpBottomBar";
import { CScalpClusters } from "./CScalpClusters";
import { CScalpControlRail } from "./CScalpControlRail";
import { CScalpOrderBook } from "./CScalpOrderBook";
import { CScalpTapeBubbles } from "./CScalpTapeBubbles";
import { CScalpTopBar } from "./CScalpTopBar";

const BUBBLE_TTL_MS = 3500;
const FADE_MS = 1200;

interface CScalpTerminalProps {
  highlight?: HighlightZone;
}

export function CScalpTerminal({ highlight = null }: CScalpTerminalProps) {
  const [levels, setLevels] = useState(() => buildOrderBook());
  const [clusters, setClusters] = useState(() => buildClusterMatrix(buildOrderBook()));
  const [bubbles, setBubbles] = useState<LiveTapeBubble[]>(() =>
    seedLiveBubbles(initialTapeBubbles()),
  );
  const [volumeKey, setVolumeKey] = useState<DriveVolumeKey>(100);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const levelsRef = useRef(levels);
  levelsRef.current = levels;

  const pushBubble = useCallback((b: LiveTapeBubble) => {
    setBubbles((prev) => [b, ...prev].slice(0, 36));
    setClusters((prev) => updateClustersFromTrade(prev, b.price, b.qty, b.side));
  }, []);

  const runMarket = useCallback(
    (side: "buy" | "sell") => {
      const { levels: next, price, filled } = applyMarketOrder(
        levelsRef.current,
        side,
        volumeKey,
      );
      if (filled <= 0) return;
      setLevels(next);
      pushBubble({
        id: `m-${Date.now()}`,
        price,
        qty: filled,
        side: side === "buy" ? "buy" : "sell",
        xPercent: 52 + (Math.random() - 0.5) * 24,
        createdAt: Date.now(),
        opacity: 1,
      });
    },
    [volumeKey, pushBubble],
  );

  useEffect(() => {
    if (paused) return;
    let timeoutId = 0;
    const schedule = () => {
      const delay = 800 + Math.random() * 700;
      timeoutId = window.setTimeout(() => {
        const bubble = randomTapeBubble(levelsRef.current);
        if (bubble) {
          const { levels: next, filled } = applyMarketOrder(
            levelsRef.current,
            bubble.side === "buy" ? "buy" : "sell",
            bubble.qty,
          );
          if (filled > 0) {
            setLevels(next);
            pushBubble({ ...bubble, qty: filled });
          }
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => window.clearTimeout(timeoutId);
  }, [paused, pushBubble]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setBubbles((prev) =>
        prev
          .map((b) => {
            const age = now - b.createdAt;
            if (age > BUBBLE_TTL_MS) return null;
            if (age > BUBBLE_TTL_MS - FADE_MS) {
              return { ...b, opacity: (BUBBLE_TTL_MS - age) / FADE_MS };
            }
            return b;
          })
          .filter((b): b is LiveTapeBubble => b !== null),
      );
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  const handleLevelClick = (lv: (typeof levels)[0]) => {
    setSelectedPrice(lv.price);
    if (lv.askQty > 0) runMarket("buy");
    else if (lv.bidQty > 0) runMarket("sell");
  };

  const mainH =
    CSCALP.terminalH - TERMINAL_GRID.topMenu - TERMINAL_GRID.symbolHeader - TERMINAL_GRID.bottom;

  return (
    <div
      className="mx-auto overflow-hidden rounded-sm border font-sans"
      style={{
        width: CSCALP.terminalW,
        maxWidth: CSCALP.terminalW,
        height: CSCALP.terminalH,
        background: CSCALP.bg,
        borderColor: CSCALP.border,
        color: CSCALP.text,
      }}
    >
      <CScalpTopBar />

      <div
        className="flex items-center gap-2 px-2 font-semibold tracking-wide"
        style={{
          height: TERMINAL_GRID.symbolHeader,
          background: CSCALP.symbolBar,
          borderBottom: `1px solid ${CSCALP.border}`,
        }}
      >
        <span className="text-[12px]">{SYMBOL}</span>
        <span
          className="h-0.5 w-8 rounded-full"
          style={{ background: CSCALP.bidBest }}
        />
      </div>

      <div
        className="grid min-h-0 overflow-hidden"
        style={{
          height: mainH,
          gridTemplateColumns: `${TERMINAL_GRID.clusters}px 1fr ${TERMINAL_GRID.controlRail}px ${TERMINAL_GRID.orderBook}px`,
        }}
      >
        <CScalpClusters levels={levels} columns={clusters} highlight={highlight} />
        <CScalpTapeBubbles
          levels={levels}
          bubbles={bubbles}
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
          highlight={highlight}
        />
        <CScalpControlRail volumeKey={volumeKey} onVolumeChange={setVolumeKey} />
        <CScalpOrderBook
          levels={levels}
          selectedPrice={selectedPrice}
          onLevelClick={handleLevelClick}
          highlight={highlight}
        />
      </div>

      <CScalpBottomBar />
    </div>
  );
}
