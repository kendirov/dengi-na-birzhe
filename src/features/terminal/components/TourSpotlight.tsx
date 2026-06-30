"use client";

import { useLayoutEffect, useState } from "react";
import {
  CSCALP_DESIGN_HEIGHT,
  CSCALP_DESIGN_WIDTH,
} from "../constants/referenceLayout";
import type { CalloutPosition, HighlightType } from "../types";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourSpotlightProps {
  targetSelector: string;
  highlightType: HighlightType;
  calloutPosition: CalloutPosition;
  title: string;
  shortText: string;
  actionHint?: string;
  hidden?: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
}

function findTarget(container: HTMLElement, selector: string): HTMLElement | null {
  return container.querySelector<HTMLElement>(`[data-tour-id="${selector}"]`);
}

function computeCalloutStyle(
  rect: TargetRect,
  position: CalloutPosition,
  containerW: number,
  containerH: number,
): React.CSSProperties {
  const pad = 12;
  const calloutW = 220;
  const calloutH = 88;

  let top = rect.top + rect.height + pad;
  let left = rect.left;

  switch (position) {
    case "top":
      top = rect.top - calloutH - pad;
      left = rect.left + rect.width / 2 - calloutW / 2;
      break;
    case "bottom":
      top = rect.top + rect.height + pad;
      left = rect.left + rect.width / 2 - calloutW / 2;
      break;
    case "left":
      top = rect.top + rect.height / 2 - calloutH / 2;
      left = rect.left - calloutW - pad;
      break;
    case "right":
      top = rect.top + rect.height / 2 - calloutH / 2;
      left = rect.left + rect.width + pad;
      break;
    case "top-left":
      top = rect.top - calloutH - pad;
      left = rect.left;
      break;
    case "top-right":
      top = rect.top - calloutH - pad;
      left = rect.left + rect.width - calloutW;
      break;
    case "bottom-left":
      top = rect.top + rect.height + pad;
      left = rect.left;
      break;
    case "bottom-right":
      top = rect.top + rect.height + pad;
      left = rect.left + rect.width - calloutW;
      break;
    default:
      break;
  }

  left = Math.max(8, Math.min(left, containerW - calloutW - 8));
  top = Math.max(8, Math.min(top, containerH - calloutH - 8));

  return { top, left, width: calloutW };
}

export function TourSpotlight({
  targetSelector,
  highlightType,
  calloutPosition,
  title,
  shortText,
  actionHint,
  hidden = false,
  containerRef,
}: TourSpotlightProps) {
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [containerSize, setContainerSize] = useState({
    w: CSCALP_DESIGN_WIDTH,
    h: CSCALP_DESIGN_HEIGHT,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const containerBox = container.getBoundingClientRect();
      setContainerSize({ w: containerBox.width, h: containerBox.height });

      const target = findTarget(container, targetSelector);
      if (!target) {
        setRect(null);
        return;
      }

      const box = target.getBoundingClientRect();
      setRect({
        top: box.top - containerBox.top,
        left: box.left - containerBox.left,
        width: box.width,
        height: box.height,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    const scrollEl = container.querySelector(".cscalp-book__scroll");
    scrollEl?.addEventListener("scroll", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      scrollEl?.removeEventListener("scroll", measure);
    };
  }, [targetSelector, containerRef]);

  if (!rect) return null;

  const pad = 4;
  const hole = {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };

  const highlightClass = `cscalp-tour-highlight cscalp-tour-highlight--${highlightType}`;
  const calloutStyle = computeCalloutStyle(
    rect,
    calloutPosition,
    containerSize.w,
    containerSize.h,
  );

  return (
    <div className="cscalp-tour-layer" aria-hidden={hidden}>
      {highlightType === "dimRest" && (
        <>
          <div
            className="cscalp-tour-dim"
            style={{ top: 0, left: 0, right: 0, height: Math.max(0, hole.top) }}
          />
          <div
            className="cscalp-tour-dim"
            style={{
              top: hole.top,
              left: 0,
              width: Math.max(0, hole.left),
              height: hole.height,
            }}
          />
          <div
            className="cscalp-tour-dim"
            style={{
              top: hole.top,
              left: hole.left + hole.width,
              right: 0,
              height: hole.height,
            }}
          />
          <div
            className="cscalp-tour-dim"
            style={{
              top: hole.top + hole.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </>
      )}

      <div
        className={highlightClass}
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
        }}
      />

      {highlightType === "arrow" && (
        <div
          className="cscalp-tour-arrow"
          style={{
            top: rect.top + rect.height / 2 - 6,
            left: rect.left - 18,
          }}
        />
      )}

      {!hidden && (
        <div className="cscalp-tour-callout" style={calloutStyle}>
          <div className="cscalp-tour-callout__title">{title}</div>
          <div className="cscalp-tour-callout__text">{shortText}</div>
          {actionHint && (
            <div className="cscalp-tour-callout__hint">{actionHint}</div>
          )}
        </div>
      )}
    </div>
  );
}
