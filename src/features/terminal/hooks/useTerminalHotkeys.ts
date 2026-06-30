"use client";

import { useEffect } from "react";
import { VOLUME_PRESETS } from "../data/mockMarket";
import type { DriveVolumeKey } from "../types";

interface HotkeyHandlers {
  onCancelAllLimits: () => void;
  onClosePosition: () => void;
  onCenterBook: () => void;
  onVolumeIndex: (index: number) => void;
  onMarketBuy: () => void;
  onMarketSell: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useTerminalHotkeys(handlers: HotkeyHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === "f" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handlers.onCancelAllLimits();
        return;
      }

      if (key === "d" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handlers.onClosePosition();
        return;
      }

      if (event.key === "Shift") {
        event.preventDefault();
        handlers.onCenterBook();
        return;
      }

      if (key === "t") {
        event.preventDefault();
        handlers.onMarketBuy();
        return;
      }

      if (key === "y") {
        event.preventDefault();
        handlers.onMarketSell();
        return;
      }

      const volIndex = Number(event.key);
      if (volIndex >= 1 && volIndex <= 5) {
        event.preventDefault();
        handlers.onVolumeIndex(volIndex - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, handlers]);
}

export function volumeKeyFromIndex(index: number): DriveVolumeKey {
  return VOLUME_PRESETS[Math.max(0, Math.min(index, VOLUME_PRESETS.length - 1))] ?? 100;
}
