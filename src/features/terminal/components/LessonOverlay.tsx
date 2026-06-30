"use client";

import {
  LESSON_IDS,
  LESSONS,
  TRAINER_MODES,
} from "../data/lessons";
import { MARKET_SCENARIOS } from "../data/scenarios";
import { isTourActive } from "../engine/lessonEngine";
import { ScenarioPresenter } from "./ScenarioPresenter";
import { useTerminalStore } from "../state/terminalStore";

export function LessonOverlay() {
  const {
    state,
    setMode,
    lessonNext,
    lessonPrev,
    currentLessonStep,
    lessonStepsTotal,
    dispatch,
  } = useTerminalStore();

  const tourActive = isTourActive(state);
  const showLessonBar = tourActive && state.lessonId;
  const showPracticeMechanics =
    state.mode === "practice" && state.practiceSession.active && !state.lessonId;
  const showScenarioBar = state.mode === "scenario";
  const showBar = showLessonBar || showPracticeMechanics || showScenarioBar;
  const showNav = showLessonBar;
  const showSpeakerNotes =
    state.mode === "presenter" && state.lessonId && currentLessonStep.speakerNotes;

  if (!showBar && !showSpeakerNotes) return null;

  return (
    <div className="cscalp-lesson-chrome">
      <div className="cscalp-lesson-chrome__main">
        <div className="cscalp-mode-bar">
          {TRAINER_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`cscalp-mode-btn${state.mode === m.id ? " cscalp-mode-btn--active" : ""}`}
              onClick={() => {
                if (m.id === "scenario") {
                  dispatch({
                    type: "SCENARIO_START",
                    id: state.scenarioId ?? MARKET_SCENARIOS[0]!.id,
                  });
                } else {
                  setMode(m.id);
                }
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {!showPracticeMechanics && !showScenarioBar && (
          <div className="cscalp-lesson-picker">
            {LESSON_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={`cscalp-lesson-picker__btn${
                  state.lessonId === id ? " cscalp-lesson-picker__btn--active" : ""
                }`}
                onClick={() => {
                  dispatch({ type: "SET_LESSON", lessonId: id });
                  if (state.mode === "terminal") setMode("explain");
                }}
              >
                {LESSONS[id].title}
              </button>
            ))}
          </div>
        )}

        {showPracticeMechanics && (
          <div className="cscalp-presenter-bar">
            <div className="cscalp-presenter-bar__body">
              Режим практики: 10 заданий на механику стакана. Панель справа — задача и
              обратная связь.
            </div>
          </div>
        )}

        {showScenarioBar && <ScenarioPresenter />}

        {showNav && (
          <div className="cscalp-presenter-bar">
            <div className="cscalp-presenter-bar__text">
              <div className="cscalp-presenter-bar__title">{currentLessonStep.title}</div>
              {!state.hintsHidden && (
                <div className="cscalp-presenter-bar__body">{currentLessonStep.shortText}</div>
              )}
              {!state.hintsHidden && currentLessonStep.actionHint && (
                <div
                  className="cscalp-presenter-bar__body cscalp-presenter-bar__hint"
                >
                  {currentLessonStep.actionHint}
                </div>
              )}
              {state.mode === "practice" && state.lessonId === "first-trade" && (
                <div className="cscalp-presenter-bar__body cscalp-presenter-bar__hint">
                  Практика: выполните действие — шаг переключится автоматически.
                </div>
              )}
            </div>

            <div className="cscalp-presenter-bar__controls">
              <button
                type="button"
                className="cscalp-nav-btn"
                onClick={() => dispatch({ type: "TOGGLE_HINTS" })}
              >
                {state.hintsHidden ? "Показать подсказки" : "Скрыть подсказки"}
              </button>
              <button
                type="button"
                className={`cscalp-nav-btn${
                  state.mode === "presenter" ? " cscalp-nav-btn--active" : ""
                }`}
                onClick={() =>
                  setMode(state.mode === "presenter" ? "explain" : "presenter")
                }
              >
                Режим преподавателя
              </button>
            </div>

            <div className="cscalp-presenter-bar__nav">
              <button
                type="button"
                className="cscalp-nav-btn"
                disabled={state.lessonStepIndex <= 0}
                onClick={lessonPrev}
              >
                Назад
              </button>
              <span className="cscalp-mono cscalp-presenter-bar__progress">
                {state.lessonStepIndex + 1}/{lessonStepsTotal}
              </span>
              <button
                type="button"
                className="cscalp-nav-btn"
                disabled={state.lessonStepIndex >= lessonStepsTotal - 1}
                onClick={lessonNext}
              >
                Далее
              </button>
            </div>
          </div>
        )}
      </div>

      {showSpeakerNotes && !state.hintsHidden && (
        <aside className="cscalp-speaker-notes" aria-label="Заметки преподавателя">
          <div className="cscalp-speaker-notes__title">Заметки</div>
          <div className="cscalp-speaker-notes__body">{currentLessonStep.speakerNotes}</div>
        </aside>
      )}
    </div>
  );
}
