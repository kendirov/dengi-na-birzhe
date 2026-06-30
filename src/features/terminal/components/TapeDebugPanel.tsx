"use client";

import { useDebugQuery } from "../hooks/useDebugQuery";
import type { TapeScenarioMode } from "../types";
import { useTerminalStore } from "../state/terminalStore";

const MODES: TapeScenarioMode[] = [
  "referenceSnapshot",
  "normal",
  "active",
  "absorption",
  "breakoutAttempt",
];

export function TapeDebugPanel() {
  const { debug } = useDebugQuery();
  const { state, setTapeScenarioMode, addTapePrint, runTapeSimulation } = useTerminalStore();

  if (!debug) return null;

  return (
    <div className="cscalp-dev-bar cscalp-tape-debug">
      <span className="cscalp-dev-bar__label">Отладка ленты</span>
      <select
        className="cscalp-dev-bar__select"
        value={state.tapeScenarioMode}
        onChange={(e) => setTapeScenarioMode(e.target.value as TapeScenarioMode)}
      >
        {MODES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <button type="button" className="cscalp-dev-bar__btn" onClick={() => addTapePrint("buy")}>
        Принт buy
      </button>
      <button type="button" className="cscalp-dev-bar__btn" onClick={() => addTapePrint("sell")}>
        Принт sell
      </button>
      <button
        type="button"
        className="cscalp-dev-bar__btn"
        onClick={() => runTapeSimulation(10_000)}
        disabled={state.tapeSimUntil != null && state.tapeSimUntil > Date.now()}
      >
        Симуляция 10 с
      </button>
      {state.tapeSimUntil != null && state.tapeSimUntil > Date.now() && (
        <span className="cscalp-dev-bar__status">сим…</span>
      )}
    </div>
  );
}
