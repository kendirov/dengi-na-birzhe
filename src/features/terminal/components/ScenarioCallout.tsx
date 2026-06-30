"use client";

import { useLayoutEffect, useState } from "react";
import {
  CSCALP_DESIGN_HEIGHT,
  CSCALP_DESIGN_WIDTH,
} from "../constants/referenceLayout";
import type { CalloutPosition, ScenarioCalloutState } from "../types";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ScenarioCalloutProps {
  callout: ScenarioCalloutState;
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
  const calloutW = 240;
  const calloutH = 96;

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

export function ScenarioCallout({ callout, hidden = false, containerRef }: ScenarioCalloutProps) {
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [containerSize, setContainerSize] = useState({
    w: CSCALP_DESIGN_WIDTH,
    h: CSCALP_DESIGN_HEIGHT,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || hidden) return;

    const measure = () => {
      const bounds = container.getBoundingClientRect();
      setContainerSize({ w: bounds.width, h: bounds.height });

      if (callout.targetSelector) {
        const target = findTarget(container, callout.targetSelector);
        if (target) {
          const t = target.getBoundingClientRect();
          setRect({
            top: t.top - bounds.top,
            left: t.left - bounds.left,
            width: t.width,
            height: t.height,
          });
          return;
        }
      }
      setRect(null);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [callout.targetSelector, containerRef, hidden]);

  if (hidden) return null;

  const position = callout.calloutPosition ?? "bottom";
  const calloutStyle = rect
    ? computeCalloutStyle(rect, position, containerSize.w, containerSize.h)
    : { top: 48, left: 48, width: 280 };

  return (
    <>
      {rect && (
        <div
          className="cscalp-scenario-spotlight"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
          aria-hidden
        />
      )}
      <div className="cscalp-scenario-callout" style={calloutStyle} role="note">
        {callout.title && (
          <div className="cscalp-scenario-callout__title">{callout.title}</div>
        )}
        <div className="cscalp-scenario-callout__body">{callout.text}</div>
      </div>
    </>
  );
}
