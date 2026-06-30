"use client";

import { MARKET_SCENARIOS } from "../data/scenarios";
import { SCENARIO_SPEEDS } from "../engine/scenarioEngine";
import { useTerminalStore } from "../state/terminalStore";
import type { ScenarioSpeed } from "../types";

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${s}.${tenths}s`;
}

export function ScenarioPresenter() {
  const { state, dispatch, activeScenario } = useTerminalStore();

  if (state.mode !== "scenario" || !activeScenario) return null;

  const progress =
    activeScenario.durationMs > 0
      ? Math.min(100, (state.scenarioElapsedMs / activeScenario.durationMs) * 100)
      : 0;

  return (
    <div className="cscalp-scenario-presenter">
      <div className="cscalp-scenario-presenter__info">
        <div className="cscalp-scenario-presenter__title">{activeScenario.name}</div>
        <div className="cscalp-scenario-presenter__desc">{activeScenario.description}</div>
        <div className="cscalp-scenario-presenter__progress-bar">
          <div
            className="cscalp-scenario-presenter__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="cscalp-mono cscalp-scenario-presenter__time">
          {formatElapsed(state.scenarioElapsedMs)} /{" "}
          {formatElapsed(activeScenario.durationMs)}
        </div>
      </div>

      <div className="cscalp-scenario-presenter__controls">
        <label className="cscalp-scenario-presenter__select-wrap">
          <span className="cscalp-scenario-presenter__label">Сценарий</span>
          <select
            className="cscalp-scenario-presenter__select"
            value={state.scenarioId ?? ""}
            onChange={(e) =>
              dispatch({ type: "SCENARIO_SELECT", id: e.target.value })
            }
          >
            {MARKET_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <div className="cscalp-scenario-presenter__btn-row">
          <button
            type="button"
            className="cscalp-nav-btn"
            onClick={() => dispatch({ type: "SCENARIO_PLAY_PAUSE" })}
          >
            {state.scenarioPlaying ? "Пауза" : "Старт"}
          </button>
          <button
            type="button"
            className="cscalp-nav-btn"
            onClick={() => dispatch({ type: "SCENARIO_STEP" })}
          >
            Шаг
          </button>
          <button
            type="button"
            className="cscalp-nav-btn"
            onClick={() => dispatch({ type: "SCENARIO_RESTART" })}
          >
            Сначала
          </button>
        </div>

        <div className="cscalp-scenario-presenter__btn-row">
          <span className="cscalp-scenario-presenter__label">Скорость</span>
          {SCENARIO_SPEEDS.map((speed) => (
            <button
              key={speed}
              type="button"
              className={`cscalp-nav-btn${
                state.scenarioSpeed === speed ? " cscalp-nav-btn--active" : ""
              }`}
              onClick={() =>
                dispatch({ type: "SCENARIO_SET_SPEED", speed: speed as ScenarioSpeed })
              }
            >
              {speed}x
            </button>
          ))}
        </div>

        <button
          type="button"
          className="cscalp-nav-btn"
          onClick={() => dispatch({ type: "SCENARIO_TOGGLE_ANNOTATIONS" })}
        >
          {state.scenarioShowAnnotations ? "Скрыть пояснения" : "Показать пояснения"}
        </button>
      </div>
    </div>
  );
}
