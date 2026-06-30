import type { ExpectedAction, LessonStep, TerminalState } from "../types";
import { getLessonSteps } from "../data/lessons";

export function getCurrentLessonStep(state: TerminalState): LessonStep {
  return getLessonSteps(state.lessonId)[state.lessonStepIndex]!;
}

export function lessonStepCount(state: TerminalState): number {
  return getLessonSteps(state.lessonId).length;
}

export function isTourActive(state: TerminalState): boolean {
  return (
    state.mode === "explain" ||
    state.mode === "presenter" ||
    state.mode === "practice"
  );
}

export function tryAdvanceOnAction(
  state: TerminalState,
  action: ExpectedAction,
): TerminalState {
  if (state.mode !== "practice") return state;
  const step = getCurrentLessonStep(state);
  if (!step.nextOnAction || step.expectedAction !== action) return state;
  const total = lessonStepCount(state);
  if (state.lessonStepIndex >= total - 1) return state;
  return { ...state, lessonStepIndex: state.lessonStepIndex + 1 };
}

export function targetSelectorToZone(
  selector: string,
): import("../types").HighlightZone {
  const map: Record<string, import("../types").HighlightZone> = {
    clusters: "klastera",
    tape: "lenta",
    orderbook: "stakan",
    "ask-zone": "stakan",
    "bid-zone": "stakan",
    spread: "stakan",
    "limit-buy": "stakan",
    "limit-sell": "stakan",
    "market-buy": "stakan",
    "market-sell": "stakan",
    "volume-rail": "volume",
    "working-volume": "volume",
    hotkeys: "volume",
    chart: "chart",
  };
  return map[selector] ?? null;
}
