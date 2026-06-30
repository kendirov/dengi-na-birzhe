"use client";

import { useLayoutEffect, useState } from "react";
import { useDebugQuery } from "../hooks/useDebugQuery";
import { collectVisualQAMetrics, type VisualQACheck } from "../visual/visualQAMetrics";

export function VisualQAPanel({ terminalRef }: { terminalRef: React.RefObject<HTMLElement | null> }) {
  const { reference } = useDebugQuery();
  const [checks, setChecks] = useState<VisualQACheck[]>([]);

  useLayoutEffect(() => {
    if (!reference) return;

    const run = () => {
      const terminal = terminalRef.current?.querySelector<HTMLElement>(".cscalp-terminal");
      setChecks(collectVisualQAMetrics(terminal ?? null));
    };

    run();
    window.addEventListener("resize", run);
    const id = window.setInterval(run, 1500);
    return () => {
      window.removeEventListener("resize", run);
      window.clearInterval(id);
    };
  }, [reference, terminalRef]);

  if (!reference) return null;

  const passed = checks.filter((c) => c.pass).length;
  const total = checks.length;

  return (
    <aside className="cscalp-visual-qa" aria-label="Visual QA checklist">
      <div className="cscalp-visual-qa__head">
        <div className="cscalp-visual-qa__title">Visual QA</div>
        <div className="cscalp-visual-qa__meta">
          {passed}/{total} · ?debug=1&amp;reference=1
        </div>
      </div>
      <ul className="cscalp-visual-qa__list">
        {checks.map((item) => (
          <li
            key={item.id}
            className={`cscalp-visual-qa__item${
              item.pass ? " cscalp-visual-qa__item--pass" : " cscalp-visual-qa__item--fail"
            }`}
          >
            <span className="cscalp-visual-qa__status">{item.pass ? "✓" : "✗"}</span>
            <div className="cscalp-visual-qa__body">
              <div className="cscalp-visual-qa__label">{item.label}</div>
              <div className="cscalp-mono cscalp-visual-qa__values">
                <span title={item.token}>exp: {item.expected}</span>
                <span>act: {item.actual}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="cscalp-visual-qa__hint">
        Включите reference overlay (opacity 50%), подгоняйте CSS variables в{" "}
        <code>tokens.css</code>.
      </p>
    </aside>
  );
}
