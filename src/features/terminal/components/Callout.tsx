"use client";

import type { CalloutSpec } from "../types";

const ZONE_ANCHORS: Record<
  CalloutSpec["zone"],
  { top: string; left: string }
> = {
  stakan: { top: "35%", left: "78%" },
  lenta: { top: "40%", left: "48%" },
  klastera: { top: "38%", left: "18%" },
  "klastera-cell": { top: "42%", left: "14%" },
  "klastera-footer": { top: "58%", left: "18%" },
  chart: { top: "18%", left: "62%" },
  volume: { top: "45%", left: "68%" },
};

interface CalloutProps {
  spec: CalloutSpec;
}

export function Callout({ spec }: CalloutProps) {
  const pos = ZONE_ANCHORS[spec.zone];

  return (
    <div
      className="cscalp-callout"
      style={{ top: pos.top, left: pos.left }}
      role="note"
    >
      <div className="cscalp-callout__title">{spec.title}</div>
      <div className="cscalp-callout__body">{spec.body}</div>
    </div>
  );
}
