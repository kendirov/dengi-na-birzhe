"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  REFERENCE_HEIGHT,
  REFERENCE_IMAGE_PATH,
  REFERENCE_WIDTH,
} from "../constants/referenceLayout";
import { useDebugQuery } from "../hooks/useDebugQuery";

const STORAGE_VISIBLE = "cscalp-ref-visible";
const STORAGE_OPACITY = "cscalp-ref-opacity";
const STORAGE_DIFF = "cscalp-ref-diff";

interface ReferenceOverlayState {
  visible: boolean;
  opacity: number;
  differenceMode: boolean;
  imageOk: boolean;
  toggleVisible: () => void;
  setOpacity: (value: number) => void;
  toggleDifference: () => void;
}

const ReferenceOverlayContext = createContext<ReferenceOverlayState | null>(null);

function useReferenceOverlayState(debug: boolean): ReferenceOverlayState {
  const { capture } = useDebugQuery();
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(50);
  const [differenceMode, setDifferenceMode] = useState(false);
  const [imageOk, setImageOk] = useState(false);

  useEffect(() => {
    if (!debug || typeof window === "undefined") return;
    const v = window.localStorage.getItem(STORAGE_VISIBLE);
    const o = window.localStorage.getItem(STORAGE_OPACITY);
    const d = window.localStorage.getItem(STORAGE_DIFF);
    if (v != null) setVisible(v === "1");
    if (o != null) setOpacity(Math.min(100, Math.max(0, Number(o) || 50)));
    if (d != null) setDifferenceMode(d === "1");
  }, [debug]);

  useEffect(() => {
    if (!debug) return;
    fetch(REFERENCE_IMAGE_PATH, { method: "HEAD" })
      .then((res) => setImageOk(res.ok))
      .catch(() => setImageOk(false));
  }, [debug]);

  const persist = useCallback(
    (next: { visible?: boolean; opacity?: number; differenceMode?: boolean }) => {
      if (!debug || typeof window === "undefined") return;
      if (next.visible != null) {
        window.localStorage.setItem(STORAGE_VISIBLE, next.visible ? "1" : "0");
      }
      if (next.opacity != null) {
        window.localStorage.setItem(STORAGE_OPACITY, String(next.opacity));
      }
      if (next.differenceMode != null) {
        window.localStorage.setItem(STORAGE_DIFF, next.differenceMode ? "1" : "0");
      }
    },
    [debug],
  );

  const toggleVisible = useCallback(() => {
    setVisible((v) => {
      const next = !v;
      persist({ visible: next });
      return next;
    });
  }, [persist]);

  const setOpacityPersist = useCallback(
    (value: number) => {
      const clamped = Math.min(100, Math.max(0, value));
      setOpacity(clamped);
      persist({ opacity: clamped });
    },
    [persist],
  );

  const toggleDifference = useCallback(() => {
    setDifferenceMode((d) => {
      const next = !d;
      persist({ differenceMode: next });
      return next;
    });
  }, [persist]);

  const overlayVisible = debug && !capture && visible;

  return {
    visible: overlayVisible,
    opacity,
    differenceMode,
    imageOk,
    toggleVisible,
    setOpacity: setOpacityPersist,
    toggleDifference,
  };
}

export function ReferenceOverlayProvider({
  debug,
  children,
}: {
  debug: boolean;
  children: ReactNode;
}) {
  const value = useReferenceOverlayState(debug);
  if (!debug) return children;
  return (
    <ReferenceOverlayContext.Provider value={value}>{children}</ReferenceOverlayContext.Provider>
  );
}

export function useReferenceOverlay(): ReferenceOverlayState {
  const ctx = useContext(ReferenceOverlayContext);
  if (!ctx) {
    return {
      visible: false,
      opacity: 50,
      differenceMode: false,
      imageOk: false,
      toggleVisible: () => {},
      setOpacity: () => {},
      toggleDifference: () => {},
    };
  }
  return ctx;
}

interface ReferenceOverlayProps {
  visible: boolean;
  opacity: number;
  differenceMode: boolean;
}

export function ReferenceOverlay({
  visible,
  opacity,
  differenceMode,
}: ReferenceOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={`cscalp-reference-overlay${
        differenceMode ? " cscalp-reference-overlay--diff" : ""
      }`}
      style={{ opacity: opacity / 100 }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={REFERENCE_IMAGE_PATH}
        alt=""
        draggable={false}
        width={REFERENCE_WIDTH}
        height={REFERENCE_HEIGHT}
      />
    </div>
  );
}

export function ReferenceOverlayLayer() {
  const { visible, opacity, differenceMode, imageOk } = useReferenceOverlay();
  if (!imageOk) return null;
  return (
    <ReferenceOverlay
      visible={visible}
      opacity={opacity}
      differenceMode={differenceMode}
    />
  );
}
