"use client";

import { useDebugQuery } from "../hooks/useDebugQuery";
import { REFERENCE_IMAGE_PATH } from "../visual/visualQAMetrics";
import { useReferenceOverlay } from "./ReferenceOverlay";

export function ReferenceDebugControls() {
  const { debug, capture } = useDebugQuery();
  const {
    visible,
    opacity,
    differenceMode,
    imageOk,
    toggleVisible,
    setOpacity,
    toggleDifference,
  } = useReferenceOverlay();

  if (!debug || capture) return null;

  return (
    <div className="cscalp-dev-bar cscalp-ref-debug">
      <span className="cscalp-dev-bar__label">Референс overlay</span>
      {!imageOk ? (
        <span className="cscalp-ref-debug__hint">
          Положите скрин в{" "}
          <code className="cscalp-mono">public/reference/cscalp-reference.png</code>
        </span>
      ) : (
        <>
          <button type="button" className="cscalp-dev-bar__btn" onClick={toggleVisible}>
            {visible ? "Скрыть" : "Показать"}
          </button>
          <label className="cscalp-ref-debug__slider-wrap">
            <span className="cscalp-ref-debug__slider-label">Прозрачность {opacity}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              className="cscalp-ref-debug__slider"
              onChange={(e) => setOpacity(Number(e.target.value))}
              disabled={!visible}
            />
          </label>
          <button
            type="button"
            className={`cscalp-dev-bar__btn${
              differenceMode ? " cscalp-dev-bar__btn--active" : ""
            }`}
            onClick={toggleDifference}
            disabled={!visible}
            title="mix-blend-mode: difference"
          >
            Difference (разница)
          </button>
          <span className="cscalp-ref-debug__path cscalp-mono">{REFERENCE_IMAGE_PATH}</span>
        </>
      )}
    </div>
  );
}
