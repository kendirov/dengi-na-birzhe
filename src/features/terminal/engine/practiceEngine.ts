import {
  BEST_ASK,
  BEST_BID,
  PRICE_STEP,
  getBestAskFromLevels,
  getBestBidFromLevels,
} from "../data/mockMarket";
import { createInitialBookState, type BookAction } from "./orderEngine";
import type { DriveVolumeKey, PracticeEvalResult, PriceLevel, TerminalState, UserOrder } from "../types";

export type PracticeTaskId =
  | "limit-buy-below-bid"
  | "limit-sell-above-ask"
  | "cancel-limits-f"
  | "market-buy-50"
  | "close-position-d"
  | "find-bid-density"
  | "find-tape-acceleration"
  | "identify-absorption"
  | "limit-without-market"
  | "volume-200";

export type PracticeExpectedAction =
  | "limit_buy_tick_below_bid"
  | "limit_sell_tick_above_ask"
  | "cancel_all_f"
  | "market_buy_vol_50"
  | "close_position_d"
  | "find_bid_density"
  | "find_tape_acceleration"
  | "identify_absorption"
  | "limit_without_market"
  | "set_volume_200";

export interface PracticeHintTarget {
  type: "price" | "row" | "tape" | "volume" | "hotkey" | "density_bid";
  price?: number;
  volumeKey?: DriveVolumeKey;
  hotkey?: string;
  label?: string;
}

export interface PracticeTask {
  id: PracticeTaskId;
  instruction: string;
  expectedAction: PracticeExpectedAction;
  feedbackSuccess: string;
  hintTarget: PracticeHintTarget;
}

export interface PracticeScore {
  accuracy: number;
  speedMs: number;
  wrongMarketHits: number;
  cancelledOrders: number;
  completedTasks: number;
  errorCount: number;
  finalGrade: string | null;
}

export interface PracticeSession {
  active: boolean;
  taskIndex: number;
  taskStartedAt: number;
  sessionStartedAt: number;
  errors: string[];
  lastMessage: string | null;
  lastMessageType: "success" | "error" | "info" | null;
  showCorrectClick: boolean;
  score: PracticeScore;
  finished: boolean;
}

const BID_DENSITY_MIN = 800;

export const PRACTICE_TASKS: PracticeTask[] = [
  {
    id: "limit-buy-below-bid",
    instruction: "Поставь лимитную покупку на 1 тик ниже bestBid",
    expectedAction: "limit_buy_tick_below_bid",
    feedbackSuccess: "Лимит BUY на bid −1 тик — без удара по рынку.",
    hintTarget: {
      type: "price",
      price: BEST_BID - PRICE_STEP,
      label: "ЛКМ по bid на 1 тик ниже",
    },
  },
  {
    id: "limit-sell-above-ask",
    instruction: "Поставь лимитную продажу на 1 тик выше bestAsk",
    expectedAction: "limit_sell_tick_above_ask",
    feedbackSuccess: "Лимит SELL на ask +1 тик — пассивная заявка.",
    hintTarget: {
      type: "price",
      price: BEST_ASK + PRICE_STEP,
      label: "ПКМ по ask на 1 тик выше",
    },
  },
  {
    id: "cancel-limits-f",
    instruction: "Сними все лимитные заявки клавишей F",
    expectedAction: "cancel_all_f",
    feedbackSuccess: "Лимиты сняты — стакан чистый.",
    hintTarget: { type: "hotkey", hotkey: "F", label: "Клавиша F" },
  },
  {
    id: "market-buy-50",
    instruction: "Купи по рынку объёмом 50",
    expectedAction: "market_buy_vol_50",
    feedbackSuccess: "Market BUY 50 — агрессия по ask.",
    hintTarget: { type: "volume", volumeKey: 50, label: "Объём 50, затем T или ЛКМ по ask" },
  },
  {
    id: "close-position-d",
    instruction: "Закрой позицию клавишей D",
    expectedAction: "close_position_d",
    feedbackSuccess: "Позиция закрыта — flat.",
    hintTarget: { type: "hotkey", hotkey: "D", label: "Клавиша D" },
  },
  {
    id: "find-bid-density",
    instruction: "Найди крупную плотность в bid",
    expectedAction: "find_bid_density",
    feedbackSuccess: "Плотность bid найдена — уровень с крупным объёмом.",
    hintTarget: { type: "density_bid", label: "Клик по bid ≥800 лотов" },
  },
  {
    id: "find-tape-acceleration",
    instruction: "Найди место, где лента ускорилась",
    expectedAction: "find_tape_acceleration",
    feedbackSuccess: "Ускорение ленты — частые принты, active режим.",
    hintTarget: { type: "tape", label: "Клик по ленте при active" },
  },
  {
    id: "identify-absorption",
    instruction: "Определи, была ли абсорбция",
    expectedAction: "identify_absorption",
    feedbackSuccess: "Абсорбция: объём есть, цена не проходит.",
    hintTarget: { type: "tape", label: "Подтверди наблюдение" },
  },
  {
    id: "limit-without-market",
    instruction: "Поставь заявку, но не бей по рынку",
    expectedAction: "limit_without_market",
    feedbackSuccess: "Лимит без market hit — правильная механика.",
    hintTarget: {
      type: "price",
      price: BEST_BID - PRICE_STEP,
      label: "Лимит в bid, не по ask",
    },
  },
  {
    id: "volume-200",
    instruction: "Переключи рабочий объём на 200",
    expectedAction: "set_volume_200",
    feedbackSuccess: "Рабочий объём 200 — готов к следующему клику.",
    hintTarget: { type: "volume", volumeKey: 200, label: "Клавиша 3 или кнопка 200" },
  },
];

export function createInitialPracticeSession(): PracticeSession {
  const now = Date.now();
  return {
    active: false,
    taskIndex: 0,
    taskStartedAt: now,
    sessionStartedAt: now,
    errors: [],
    lastMessage: null,
    lastMessageType: null,
    showCorrectClick: false,
    score: {
      accuracy: 100,
      speedMs: 0,
      wrongMarketHits: 0,
      cancelledOrders: 0,
      completedTasks: 0,
      errorCount: 0,
      finalGrade: null,
    },
    finished: false,
  };
}

export function getCurrentPracticeTask(state: TerminalState): PracticeTask | null {
  if (!state.practiceSession.active) return null;
  return PRACTICE_TASKS[state.practiceSession.taskIndex] ?? null;
}

function roundPrice(p: number): number {
  return Math.round(p * 100) / 100;
}

function targetLimitBuyPrice(market: PriceLevel[]): number {
  const bid = getBestBidFromLevels(market)?.price ?? BEST_BID;
  return roundPrice(bid - PRICE_STEP);
}

function targetLimitSellPrice(market: PriceLevel[]): number {
  const ask = getBestAskFromLevels(market)?.price ?? BEST_ASK;
  return roundPrice(ask + PRICE_STEP);
}

function isBidDensity(level: PriceLevel): boolean {
  return level.bidSize >= BID_DENSITY_MIN;
}

function recomputeAccuracy(score: PracticeScore): number {
  const total = PRACTICE_TASKS.length;
  const base = (score.completedTasks / total) * 100;
  const penalty = score.wrongMarketHits * 8 + score.errorCount * 4;
  return Math.max(0, Math.min(100, Math.round(base - penalty)));
}

function computeFinalGrade(score: PracticeScore): string {
  const a = recomputeAccuracy(score);
  if (a >= 92 && score.wrongMarketHits === 0) return "A";
  if (a >= 82) return "B";
  if (a >= 70) return "C";
  if (a >= 55) return "D";
  return "F";
}

function patchSession(
  session: PracticeSession,
  patch: Partial<PracticeSession>,
): PracticeSession {
  const next = { ...session, ...patch, score: { ...session.score, ...(patch.score ?? {}) } };
  next.score.accuracy = recomputeAccuracy(next.score);
  if (next.finished) next.score.finalGrade = computeFinalGrade(next.score);
  return next;
}

function recordError(session: PracticeSession, message: string, wrongMarket = false): PracticeSession {
  return patchSession(session, {
    errors: [...session.errors, message],
    lastMessage: message,
    lastMessageType: "error",
    score: {
      ...session.score,
      errorCount: session.score.errorCount + 1,
      wrongMarketHits: session.score.wrongMarketHits + (wrongMarket ? 1 : 0),
    },
  });
}

function recordSuccess(session: PracticeSession, message: string, elapsedMs: number): PracticeSession {
  const completed = session.score.completedTasks + 1;
  return patchSession(session, {
    lastMessage: message,
    lastMessageType: "success",
    score: {
      ...session.score,
      completedTasks: completed,
      speedMs: session.score.speedMs + elapsedMs,
    },
  });
}

export function getPracticeHintPrice(state: TerminalState): number | null {
  const task = getCurrentPracticeTask(state);
  if (!task || !state.practiceSession.showCorrectClick) return null;
  const hint = task.hintTarget;
  if (hint.type === "price" && hint.price != null) return hint.price;
  if (hint.type === "density_bid") {
    const row = state.market.find((r) => isBidDensity(r));
    return row?.price ?? null;
  }
  if (task.expectedAction === "limit_buy_tick_below_bid" || task.expectedAction === "limit_without_market") {
    return targetLimitBuyPrice(state.market);
  }
  if (task.expectedAction === "limit_sell_tick_above_ask") {
    return targetLimitSellPrice(state.market);
  }
  return null;
}

export function evaluatePracticePointer(
  state: TerminalState,
  button: 0 | 2,
  level: PriceLevel,
): PracticeEvalResult {
  const task = getCurrentPracticeTask(state);
  if (!task) return { allow: true };

  const bestAsk = getBestAskFromLevels(state.market)?.price ?? BEST_ASK;
  const bestBid = getBestBidFromLevels(state.market)?.price ?? BEST_BID;
  const inAsk = level.price >= bestAsk && level.askSize > 0;
  const inBid = level.price <= bestBid && level.bidSize > 0;

  const limitExpected =
    task.expectedAction === "limit_buy_tick_below_bid" ||
    task.expectedAction === "limit_without_market";

  const sellLimitExpected = task.expectedAction === "limit_sell_tick_above_ask";

  if (limitExpected && button === 0 && inAsk) {
    return {
      allow: false,
      error: "Ты ударил по рынку, это market buy",
      wrongMarket: true,
    };
  }

  if (sellLimitExpected && button === 2 && inBid) {
    return {
      allow: false,
      error: "Ты продал по рынку",
      wrongMarket: true,
    };
  }

  if (task.expectedAction === "find_bid_density") {
    if (button === 0 && isBidDensity(level)) {
      return { allow: true, success: true, successMessage: task.feedbackSuccess, advance: true };
    }
    if (button === 0) {
      return { allow: true, error: "Это не крупная bid-плотность. Ищи ≥800 лотов." };
    }
    return { allow: true };
  }

  if (task.expectedAction === "limit_without_market") {
    if (button === 0 && inAsk) {
      return { allow: false, error: "Ты ударил по рынку, это market buy", wrongMarket: true };
    }
    if (button === 2 && inBid && level.price === bestBid) {
      return { allow: false, error: "Ты продал по рынку", wrongMarket: true };
    }
  }

  return { allow: true };
}

export function evaluatePracticeBookAction(
  state: TerminalState,
  action: BookAction,
  beforeOrders: UserOrder[],
): PracticeEvalResult {
  const task = getCurrentPracticeTask(state);
  if (!task) return { allow: true };

  if (task.expectedAction === "cancel_all_f" && action.type === "cancel_all_limits") {
    if (beforeOrders.length === 0) {
      return { allow: false, error: "Нечего отменять" };
    }
  }

  if (task.expectedAction === "close_position_d" && action.type === "close_position") {
    if (state.position.side === "flat") {
      return { allow: false, error: "Позиции нет" };
    }
  }

  if (task.expectedAction === "market_buy_vol_50" && action.type === "market_buy") {
    if (state.volumeKey !== 50) {
      return { allow: false, error: "Сначала выбери рабочий объём" };
    }
  }

  if (
    (task.expectedAction === "limit_buy_tick_below_bid" ||
      task.expectedAction === "limit_sell_tick_above_ask" ||
      task.expectedAction === "limit_without_market") &&
    (action.type === "market_buy" || action.type === "market_sell")
  ) {
    return {
      allow: false,
      error:
        action.type === "market_buy"
          ? "Ты ударил по рынку, это market buy"
          : "Ты продал по рынку",
      wrongMarket: true,
    };
  }

  return { allow: true };
}

export function evaluatePracticeAfterBookAction(
  state: TerminalState,
  action: BookAction,
): PracticeEvalResult {
  const task = getCurrentPracticeTask(state);
  if (!task) return { allow: true };

  if (task.expectedAction === "market_buy_vol_50" && action.type === "market_buy") {
    return { allow: true, success: true, successMessage: task.feedbackSuccess, advance: true };
  }

  if (task.expectedAction === "limit_buy_tick_below_bid" && action.type === "limit_buy") {
    const target = targetLimitBuyPrice(state.market);
    if (roundPrice(action.price) === target) {
      return { allow: true, success: true, successMessage: task.feedbackSuccess, advance: true };
    }
    return { allow: true, error: `Нужна цена ${target.toFixed(2).replace(".", ",")} (bid −1 тик)` };
  }

  if (task.expectedAction === "limit_sell_tick_above_ask" && action.type === "limit_sell") {
    const target = targetLimitSellPrice(state.market);
    if (roundPrice(action.price) === target) {
      return { allow: true, success: true, successMessage: task.feedbackSuccess, advance: true };
    }
    return { allow: true, error: `Нужна цена ${target.toFixed(2).replace(".", ",")} (ask +1 тик)` };
  }

  if (task.expectedAction === "cancel_all_f" && action.type === "cancel_all_limits") {
    return {
      allow: true,
      success: true,
      successMessage: task.feedbackSuccess,
      advance: true,
    };
  }

  if (task.expectedAction === "close_position_d" && action.type === "close_position") {
    return { allow: true, success: true, successMessage: task.feedbackSuccess, advance: true };
  }

  if (task.expectedAction === "limit_without_market") {
    if (action.type === "limit_buy" || action.type === "limit_sell") {
      return { allow: true, success: true, successMessage: task.feedbackSuccess, advance: true };
    }
  }

  return { allow: true };
}

export function evaluatePracticeVolumeKey(
  state: TerminalState,
  key: DriveVolumeKey,
): PracticeEvalResult {
  const task = getCurrentPracticeTask(state);
  if (!task) return { allow: true };

  if (task.expectedAction === "set_volume_200" && key === 200) {
    return { allow: true, success: true, successMessage: task.feedbackSuccess, advance: true };
  }

  if (task.expectedAction === "market_buy_vol_50" && key !== 50) {
    return { allow: true, error: "Сначала выбери рабочий объём 50" };
  }

  return { allow: true };
}

export function evaluatePracticeTapeClick(state: TerminalState): PracticeEvalResult {
  const task = getCurrentPracticeTask(state);
  if (!task) return { allow: true };

  if (task.expectedAction === "find_tape_acceleration" && state.tapeScenarioMode === "active") {
    return { allow: true, success: true, successMessage: task.feedbackSuccess, advance: true };
  }

  if (task.expectedAction === "find_tape_acceleration") {
    return { allow: true, error: "Лента ещё не в active — дождись ускорения." };
  }

  return { allow: true };
}

export function evaluatePracticeAbsorptionConfirm(state: TerminalState): PracticeEvalResult {
  const task = getCurrentPracticeTask(state);
  if (!task || task.expectedAction !== "identify_absorption") return { allow: true };

  if (state.tapeScenarioMode === "absorption") {
    return { allow: true, success: true, successMessage: task.feedbackSuccess, advance: true };
  }

  return { allow: true, error: "Включён не absorption-режим — перечитай ленту." };
}

export function applyPracticeEval(
  state: TerminalState,
  evalResult: PracticeEvalResult,
): TerminalState {
  if (!state.practiceSession.active) return state;

  let session = state.practiceSession;
  const now = Date.now();

  if (evalResult.error) {
    session = recordError(session, evalResult.error, evalResult.wrongMarket);
    return { ...state, practiceSession: session, lastFeedback: evalResult.error };
  }

  if (evalResult.success && evalResult.advance) {
    const elapsed = now - session.taskStartedAt;
    session = recordSuccess(
      session,
      evalResult.successMessage ?? "Задача выполнена",
      elapsed,
    );

    if (actionIncrementsCancel(evalResult)) {
      session = patchSession(session, {
        score: { ...session.score, cancelledOrders: session.score.cancelledOrders + 1 },
      });
    }

    const nextIndex = session.taskIndex + 1;
    if (nextIndex >= PRACTICE_TASKS.length) {
      session = patchSession(session, {
        taskIndex: nextIndex,
        finished: true,
        lastMessage: "Сессия завершена",
        lastMessageType: "info",
      });
      return {
        ...state,
        practiceSession: session,
        lastFeedback: evalResult.successMessage ?? "",
      };
    }

    const setup = taskSetupForIndex(nextIndex);
    session = patchSession(session, {
      taskIndex: nextIndex,
      taskStartedAt: now,
    });

    return {
      ...state,
      practiceSession: session,
      lastFeedback: evalResult.successMessage ?? "",
      ...setup,
    };
  }

  return state;
}

function actionIncrementsCancel(evalResult: PracticeEvalResult): boolean {
  return evalResult.successMessage?.includes("сняты") === true;
}

function taskSetupForIndex(index: number): Partial<TerminalState> {
  const task = PRACTICE_TASKS[index];
  if (!task) return {};
  if (task.expectedAction === "find_tape_acceleration") {
    return { tapeScenarioMode: "active" };
  }
  if (task.expectedAction === "identify_absorption") {
    return { tapeScenarioMode: "absorption" };
  }
  return {};
}

export function startPracticeSession(state: TerminalState): TerminalState {
  const book = createInitialBookState();
  const now = Date.now();
  return {
    ...state,
    mode: "practice",
    lessonId: null,
    market: book.market,
    userOrders: book.userOrders,
    position: book.position,
    currentPrice: book.currentPrice,
    volumeKey: 100,
    tapeScenarioMode: "normal",
    practiceSession: {
      ...createInitialPracticeSession(),
      active: true,
      taskStartedAt: now,
      sessionStartedAt: now,
    },
    lastFeedback: "",
  };
}

export function resetPracticeSession(state: TerminalState): TerminalState {
  const book = createInitialBookState();
  const now = Date.now();
  return {
    ...state,
    market: book.market,
    userOrders: book.userOrders,
    position: book.position,
    currentPrice: book.currentPrice,
    volumeKey: 100,
    tapeScenarioMode: "normal",
    practiceSession: {
      ...createInitialPracticeSession(),
      active: true,
      taskStartedAt: now,
      sessionStartedAt: now,
    },
    lastFeedback: "Практика сброшена",
  };
}

export function togglePracticeHint(state: TerminalState): TerminalState {
  return {
    ...state,
    practiceSession: {
      ...state.practiceSession,
      showCorrectClick: !state.practiceSession.showCorrectClick,
    },
  };
}

export function stopPracticeSession(state: TerminalState): TerminalState {
  return {
    ...state,
    practiceSession: { ...state.practiceSession, active: false },
  };
}
