"use client";

import {
  PRACTICE_TASKS,
  getCurrentPracticeTask,
} from "../engine/practiceEngine";
import { useTerminalStore } from "../state/terminalStore";

export function PracticePanel() {
  const { state, dispatch } = useTerminalStore();
  const { practiceSession } = state;

  if (state.mode !== "practice" || !practiceSession.active) return null;
  if (state.lessonId === "first-trade") return null;

  const task = getCurrentPracticeTask(state);
  const total = PRACTICE_TASKS.length;
  const index = Math.min(practiceSession.taskIndex, total - 1);
  const progress = practiceSession.finished ? total : index + 1;
  const { score } = practiceSession;

  return (
    <aside className="cscalp-practice-panel" aria-label="Практика">
      <div className="cscalp-practice-panel__head">
        <span className="cscalp-practice-panel__title">Практика · механика</span>
        <span className="cscalp-practice-panel__progress">
          {practiceSession.finished ? total : progress}/{total}
        </span>
      </div>

      {practiceSession.finished ? (
        <div className="cscalp-practice-panel__done">
          <div className="cscalp-practice-panel__grade">
            Оценка: {score.finalGrade ?? "—"}
          </div>
          <div className="cscalp-practice-panel__stats">
            <span>Точность {score.accuracy}%</span>
            <span>Ошибок {score.errorCount}</span>
            <span>Market hits {score.wrongMarketHits}</span>
            <span>
              Время {Math.round(score.speedMs / 1000)}s
            </span>
          </div>
          <button
            type="button"
            className="cscalp-practice-panel__btn"
            onClick={() => dispatch({ type: "PRACTICE_RESET" })}
          >
            Заново
          </button>
        </div>
      ) : (
        <>
          {task && (
            <div className="cscalp-practice-panel__task">
              <div className="cscalp-practice-panel__instruction">{task.instruction}</div>
              {task.hintTarget.label && (
                <div className="cscalp-practice-panel__sub">{task.hintTarget.label}</div>
              )}
            </div>
          )}

          {practiceSession.lastMessage && (
            <div
              className={`cscalp-practice-panel__feedback cscalp-practice-panel__feedback--${practiceSession.lastMessageType ?? "info"}`}
            >
              {practiceSession.lastMessage}
            </div>
          )}

          {practiceSession.errors.length > 0 && (
            <div className="cscalp-practice-panel__errors">
              {practiceSession.errors.slice(-3).map((err, i) => (
                <div key={`${err}-${i}`} className="cscalp-practice-panel__error">
                  {err}
                </div>
              ))}
            </div>
          )}

          <div className="cscalp-practice-panel__score">
            <span>acc {score.accuracy}%</span>
            <span>✓ {score.completedTasks}</span>
            <span>⚡ {score.wrongMarketHits}</span>
          </div>

          <div className="cscalp-practice-panel__actions">
            <button
              type="button"
              className={`cscalp-practice-panel__btn${
                practiceSession.showCorrectClick ? " cscalp-practice-panel__btn--active" : ""
              }`}
              onClick={() => dispatch({ type: "PRACTICE_TOGGLE_HINT" })}
            >
              {practiceSession.showCorrectClick ? "Скрыть клик" : "Показать клик"}
            </button>
            {task?.expectedAction === "identify_absorption" && (
              <button
                type="button"
                className="cscalp-practice-panel__btn"
                onClick={() => dispatch({ type: "PRACTICE_CONFIRM_ABSORPTION" })}
              >
                Абсорбция
              </button>
            )}
            <button
              type="button"
              className="cscalp-practice-panel__btn cscalp-practice-panel__btn--muted"
              onClick={() => dispatch({ type: "PRACTICE_RESET" })}
            >
              Reset
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
