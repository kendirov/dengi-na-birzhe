"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  BEST_ASK,
  BEST_BID,
  getBestAskFromLevels,
  getBestBidFromLevels,
  applyMarketOrderToLadder,
} from "../data/mockMarket";
import { buildClusterCandles, updateLastCandleFromTrade } from "../engine/clusterEngine";
import {
  buildInitialChartPoints,
  syncChartTail,
} from "../engine/chartEngine";
import {
  DEFAULT_LESSON_ID,
  getLessonStepByIndex,
} from "../data/lessons";
import {
  getActiveMarketScenario,
  processScenarioStep,
  processScenarioTick,
  restartScenario,
  startScenario,
  stopScenario,
} from "../engine/scenarioEngine";
import {
  applyPracticeEval,
  createInitialPracticeSession,
  evaluatePracticeAbsorptionConfirm,
  evaluatePracticeAfterBookAction,
  evaluatePracticeBookAction,
  evaluatePracticePointer,
  evaluatePracticeTapeClick,
  evaluatePracticeVolumeKey,
  getCurrentPracticeTask,
  getPracticeHintPrice,
  resetPracticeSession,
  startPracticeSession,
  togglePracticeHint,
} from "../engine/practiceEngine";
import {
  getCurrentLessonStep,
  lessonStepCount,
  targetSelectorToZone,
  tryAdvanceOnAction,
} from "../engine/lessonEngine";
import {
  applyBookAction,
  createInitialBookState,
  mergeBookView,
  type BookAction,
} from "../engine/orderEngine";
import {
  applyBreakoutShift,
  generateScenarioPrint,
  referenceSnapshotPrints,
  scheduleDelay,
  tapePrintFromTrade,
  tickTapePrints,
} from "../engine/tapeEngine";
import { useTerminalHotkeys, volumeKeyFromIndex } from "../hooks/useTerminalHotkeys";
import type {
  ChartPoint,
  DriveVolumeKey,
  ExpectedAction,
  HighlightZone,
  LessonStep,
  MarketScenario,
  PriceLevel,
  TapePrint,
  TapeScenarioMode,
  TerminalAction,
  TerminalState,
  TradeSide,
  TrainerMode,
} from "../types";

import {
  CSCALP_FULLSCREEN_PAD_X,
  CSCALP_FULLSCREEN_PAD_Y,
  CSCALP_VIEWPORT_PAD_X,
  CSCALP_VIEWPORT_PAD_Y,
  type TrainerChromeMode,
} from "../constants/layout";
import {
  CSCALP_DESIGN_HEIGHT,
  CSCALP_DESIGN_WIDTH,
} from "../constants/referenceLayout";

function createInitialState(): TerminalState {
  const book = createInitialBookState();
  const now = Date.now();
  return {
    mode: "terminal",
    paused: false,
    volumeKey: 200,
    priceMode: "L",
    selectedPrice: null,
    highlightZone: null,
    lessonId: null,
    lessonStepIndex: 0,
    hintsHidden: false,
    scenarioId: null,
    scenarioElapsedMs: 0,
    scenarioPlaying: false,
    scenarioSpeed: 1,
    scenarioFiredEvents: [],
    scenarioCallout: null,
    scenarioShowAnnotations: true,
    scenarioBaseline: null,
    scale: 1,
    market: book.market,
    userOrders: book.userOrders,
    position: book.position,
    currentPrice: book.currentPrice,
    bookCenterTick: now,
    lastFeedback: "",
    clusterCandles: buildClusterCandles(),
    ladderScrollTop: 0,
    hoveredLadderPrice: null,
    clusterHint: null,
    tapePrints: referenceSnapshotPrints(now),
    tapeScenarioMode: "referenceSnapshot",
    tapeSimUntil: null,
    chartOpen: true,
    chartPoints: buildInitialChartPoints(),
    chartDrawings: [],
    chartDrawingTool: null,
    chartHoverIndex: null,
    practiceSession: createInitialPracticeSession(),
  };
}

function withLessonIndex(state: TerminalState, index: number): TerminalState {
  const total = lessonStepCount(state);
  const clamped = Math.max(0, Math.min(index, total - 1));
  const step = getLessonStepByIndex(state.lessonId, clamped);
  return {
    ...state,
    lessonStepIndex: clamped,
    highlightZone: targetSelectorToZone(step.targetSelector),
  };
}

function applyLessonAction(state: TerminalState, action: ExpectedAction): TerminalState {
  return tryAdvanceOnAction(state, action);
}

function appendPrint(prints: TapePrint[], print: TapePrint): TapePrint[] {
  return [print, ...prints].slice(0, 48);
}

function syncChartState(
  state: TerminalState,
  market: PriceLevel[],
  currentPrice: number,
): ChartPoint[] {
  const bid = getBestBidFromLevels(market)?.price ?? BEST_BID;
  const ask = getBestAskFromLevels(market)?.price ?? BEST_ASK;
  const simActive = state.tapeSimUntil != null && state.tapeSimUntil > Date.now();
  const mode = simActive ? "active" : state.tapeScenarioMode;
  return syncChartTail(state.chartPoints, currentPrice, bid, ask, mode);
}

function reducer(state: TerminalState, action: TerminalAction): TerminalState {
  switch (action.type) {
    case "SET_MODE": {
      if (action.mode === "practice") {
        return startPracticeSession({ ...state, mode: "practice" });
      }
      let next: TerminalState = { ...state, mode: action.mode };
      next.practiceSession = { ...next.practiceSession, active: false };
      if (
        (action.mode === "presenter" || action.mode === "explain") &&
        !next.lessonId
      ) {
        next.lessonId = DEFAULT_LESSON_ID;
      }
      if (action.mode === "presenter" || action.mode === "explain") {
        next = withLessonIndex(next, next.lessonStepIndex);
      }
      if (action.mode !== "scenario" && state.mode === "scenario") {
        next = stopScenario(next);
      }
      if (action.mode === "terminal" || action.mode === "scenario") {
        next.highlightZone = null;
      }
      return next;
    }
    case "SET_PAUSED":
      return { ...state, paused: action.paused };
    case "SET_VOLUME_KEY": {
      let next: TerminalState = { ...state, volumeKey: action.key };
      if (action.key === 50) next = applyLessonAction(next, "setVolume50");
      if (next.practiceSession.active && !next.lessonId) {
        const volEval = evaluatePracticeVolumeKey(next, action.key);
        if (volEval.success) next = applyPracticeEval(next, volEval);
        else if (volEval.error) next = applyPracticeEval(next, volEval);
      }
      return next;
    }
    case "SET_PRICE_MODE":
      return { ...state, priceMode: action.mode };
    case "SET_HIGHLIGHT":
      return { ...state, highlightZone: action.zone };
    case "SET_SELECTED_PRICE":
      return { ...state, selectedPrice: action.price };
    case "SET_SCALE":
      return { ...state, scale: action.scale };
    case "SET_BOOK_CENTER":
      return { ...state, bookCenterTick: Date.now(), currentPrice: action.price };
    case "SET_FEEDBACK":
      return { ...state, lastFeedback: action.message };
    case "SET_LADDER_SCROLL":
      return { ...state, ladderScrollTop: action.scrollTop };
    case "SET_HOVERED_LADDER_PRICE":
      return { ...state, hoveredLadderPrice: action.price };
    case "SET_CLUSTER_HINT":
      return { ...state, clusterHint: action.hint };
    case "SET_CLUSTER_CANDLES":
      return { ...state, clusterCandles: action.candles };
    case "TOGGLE_CHART":
      return { ...state, chartOpen: !state.chartOpen };
    case "SET_CHART_OPEN":
      return { ...state, chartOpen: action.open };
    case "SET_CHART_POINTS":
      return { ...state, chartPoints: action.points };
    case "SET_CHART_DRAWING_TOOL":
      return { ...state, chartDrawingTool: action.tool };
    case "ADD_CHART_DRAWING":
      return {
        ...state,
        chartDrawings: [...state.chartDrawings, action.drawing],
      };
    case "CLEAR_CHART_DRAWINGS":
      return { ...state, chartDrawings: [], chartDrawingTool: null };
    case "SET_CHART_HOVER":
      return { ...state, chartHoverIndex: action.index };
    case "SET_TAPE_MODE": {
      const now = Date.now();
      const tapePrints =
        action.mode === "referenceSnapshot"
          ? referenceSnapshotPrints(now)
          : state.tapePrints;
      const next = { ...state, tapeScenarioMode: action.mode, tapePrints };
      return {
        ...next,
        chartPoints: syncChartState(next, next.market, next.currentPrice),
      };
    }
    case "START_TAPE_SIM":
      return { ...state, tapeSimUntil: action.until, tapeScenarioMode: "active" };
    case "STOP_TAPE_SIM":
      return { ...state, tapeSimUntil: null };
    case "LESSON_NEXT":
      return withLessonIndex(state, state.lessonStepIndex + 1);
    case "LESSON_PREV":
      return withLessonIndex(state, state.lessonStepIndex - 1);
    case "LESSON_GOTO":
      return withLessonIndex(state, action.index);
    case "SET_LESSON": {
      const next: TerminalState = {
        ...state,
        lessonId: action.lessonId,
        lessonStepIndex: 0,
        practiceSession: {
          ...state.practiceSession,
          active: action.lessonId === "first-trade" ? false : state.practiceSession.active,
        },
      };
      return action.lessonId ? withLessonIndex(next, 0) : next;
    }
    case "TOGGLE_HINTS":
      return { ...state, hintsHidden: !state.hintsHidden };
    case "SET_HINTS_HIDDEN":
      return { ...state, hintsHidden: action.hidden };
    case "LESSON_ACTION_DONE":
      return applyLessonAction(state, action.action);
    case "PRACTICE_START":
      return startPracticeSession(state);
    case "PRACTICE_RESET":
      return resetPracticeSession(state);
    case "PRACTICE_TOGGLE_HINT":
      return togglePracticeHint(state);
    case "PRACTICE_CONFIRM_ABSORPTION": {
      if (!state.practiceSession.active || state.lessonId) return state;
      return applyPracticeEval(state, evaluatePracticeAbsorptionConfirm(state));
    }
    case "PRACTICE_TAPE_CLICK": {
      if (!state.practiceSession.active || state.lessonId) return state;
      return applyPracticeEval(state, evaluatePracticeTapeClick(state));
    }
    case "PRACTICE_APPLY":
      if (!state.practiceSession.active || state.lessonId) return state;
      return applyPracticeEval(state, action.eval);
    case "SCENARIO_START":
      return startScenario(state, action.id);
    case "SCENARIO_SELECT":
      return startScenario(state, action.id);
    case "SCENARIO_PLAY_PAUSE":
      if (!state.scenarioId) return state;
      return { ...state, scenarioPlaying: !state.scenarioPlaying };
    case "SCENARIO_STEP":
      return processScenarioStep(state);
    case "SCENARIO_RESTART":
      return restartScenario(state);
    case "SCENARIO_SET_SPEED":
      return { ...state, scenarioSpeed: action.speed };
    case "SCENARIO_TOGGLE_ANNOTATIONS": {
      const show = !state.scenarioShowAnnotations;
      return {
        ...state,
        scenarioShowAnnotations: show,
        scenarioCallout: show ? state.scenarioCallout : null,
      };
    }
    case "SCENARIO_DISMISS_CALLOUT":
      return { ...state, scenarioCallout: null };
    case "SCENARIO_TICK":
      return processScenarioTick(state, action.deltaMs);
    case "SCENARIO_STOP":
      return stopScenario(state);
    case "PUSH_PRINT": {
      const tapePrints = appendPrint(state.tapePrints, action.print);
      const clusterCandles = updateLastCandleFromTrade(
        state.clusterCandles,
        action.print.price,
        action.print.qty,
        action.print.side,
      );
      return { ...state, tapePrints, clusterCandles };
    }
    case "BOOK_TRADE": {
      let tapePrints = state.tapePrints;
      let clusterCandles = state.clusterCandles;
      if (action.print) {
        tapePrints = appendPrint(tapePrints, action.print);
        clusterCandles = updateLastCandleFromTrade(
          clusterCandles,
          action.print.price,
          action.print.qty,
          action.print.side,
        );
      }
      return {
        ...state,
        market: action.market,
        userOrders: action.userOrders,
        position: action.position,
        currentPrice: action.currentPrice,
        lastFeedback: action.feedback,
        tapePrints,
        clusterCandles,
        chartPoints: syncChartState(
          { ...state, tapePrints, clusterCandles },
          action.market,
          action.currentPrice,
        ),
      };
    }
    case "TICK_TAPE": {
      if (state.tapeScenarioMode === "referenceSnapshot") return state;
      const next = {
        ...state,
        tapePrints: tickTapePrints(state.tapePrints, action.now),
        tapeSimUntil:
          state.tapeSimUntil != null && action.now >= state.tapeSimUntil
            ? null
            : state.tapeSimUntil,
      };
      const needsChartSync =
        next.tapeScenarioMode === "active" ||
        next.tapeScenarioMode === "breakoutAttempt" ||
        next.tapeSimUntil != null;
      if (!needsChartSync) return next;
      return {
        ...next,
        chartPoints: syncChartState(next, next.market, next.currentPrice),
      };
    }
    default:
      return state;
  }
}

interface TerminalContextValue {
  state: TerminalState;
  dispatch: React.Dispatch<TerminalAction>;
  priceLevels: PriceLevel[];
  setMode: (mode: TrainerMode) => void;
  setVolumeKey: (key: DriveVolumeKey) => void;
  setHighlight: (zone: HighlightZone) => void;
  lessonNext: () => void;
  lessonPrev: () => void;
  dispatchBook: (action: BookAction) => void;
  handleRowPointer: (event: React.MouseEvent<HTMLElement>, level: PriceLevel) => void;
  cancelOrder: (orderId: string) => void;
  centerBook: () => void;
  toggleChart: () => void;
  setTapeScenarioMode: (mode: TapeScenarioMode) => void;
  addTapePrint: (side: TradeSide) => void;
  runTapeSimulation: (durationMs: number) => void;
  zoneClass: (zone: Exclude<HighlightZone, null>) => string;
  currentLessonStep: LessonStep;
  lessonStepsTotal: number;
  reportLessonAction: (action: ExpectedAction) => void;
  practiceHintPrice: number | null;
  activeScenario: MarketScenario | null;
}

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function TerminalProvider({
  children,
  chromeMode = "landing",
}: {
  children: ReactNode;
  chromeMode?: TrainerChromeMode;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const marketRef = useRef(state.market);
  const userOrdersRef = useRef(state.userOrders);
  const positionRef = useRef(state.position);
  const currentPriceRef = useRef(state.currentPrice);
  const tapeModeRef = useRef(state.tapeScenarioMode);
  const breakoutBurstRef = useRef(0);
  marketRef.current = state.market;
  userOrdersRef.current = state.userOrders;
  positionRef.current = state.position;
  currentPriceRef.current = state.currentPrice;
  tapeModeRef.current = state.tapeScenarioMode;

  const priceLevels = useMemo(
    () => mergeBookView(state.market, state.userOrders, state.currentPrice),
    [state.market, state.userOrders, state.currentPrice],
  );

  const pushPrint = useCallback((print: TapePrint) => {
    dispatch({ type: "PUSH_PRINT", print });
  }, []);

  const runBookAction = useCallback(
    (action: BookAction) => {
      const practiceOn = state.practiceSession.active && !state.lessonId;
      const beforeOrders = userOrdersRef.current;

      if (practiceOn) {
        const pre = evaluatePracticeBookAction(state, action, beforeOrders);
        if (!pre.allow) {
          dispatch({ type: "PRACTICE_APPLY", eval: pre });
          return;
        }
      }

      const result = applyBookAction(
        marketRef.current,
        userOrdersRef.current,
        positionRef.current,
        currentPriceRef.current,
        action,
      );
      marketRef.current = result.market;
      userOrdersRef.current = result.userOrders;
      positionRef.current = result.position;
      currentPriceRef.current = result.currentPrice;

      dispatch({
        type: "BOOK_TRADE",
        market: result.market,
        userOrders: result.userOrders,
        position: result.position,
        currentPrice: result.currentPrice,
        feedback: result.feedback,
        print: result.tape,
      });

      if (practiceOn) {
        const postState: TerminalState = {
          ...state,
          market: result.market,
          userOrders: result.userOrders,
          position: result.position,
          currentPrice: result.currentPrice,
        };
        const post = evaluatePracticeAfterBookAction(postState, action);
        if (post.error || post.success) {
          dispatch({ type: "PRACTICE_APPLY", eval: post });
        }
        return;
      }

      if (state.lessonId === "first-trade") {
        if (action.type === "limit_buy") {
          dispatch({ type: "LESSON_ACTION_DONE", action: "limitBuyBid" });
        } else if (action.type === "cancel_all_limits") {
          dispatch({ type: "LESSON_ACTION_DONE", action: "cancelLimitsF" });
        } else if (action.type === "market_buy") {
          dispatch({ type: "LESSON_ACTION_DONE", action: "marketBuyT" });
        } else if (action.type === "close_position") {
          dispatch({ type: "LESSON_ACTION_DONE", action: "closePositionD" });
        }
      }
    },
    [state],
  );

  const cancelOrder = useCallback(
    (orderId: string) => runBookAction({ type: "cancel", orderId }),
    [runBookAction],
  );

  const centerBook = useCallback(() => {
    dispatch({ type: "SET_BOOK_CENTER", price: currentPriceRef.current });
  }, []);

  const toggleChart = useCallback(() => {
    dispatch({ type: "TOGGLE_CHART" });
  }, []);

  const setTapeScenarioMode = useCallback((mode: TapeScenarioMode) => {
    dispatch({ type: "SET_TAPE_MODE", mode });
  }, []);

  const addTapePrint = useCallback(
    (side: TradeSide) => {
      const ask = getBestAskFromLevels(marketRef.current);
      const bid = getBestBidFromLevels(marketRef.current);
      const price = side === "buy" ? (ask?.price ?? BEST_ASK) : (bid?.price ?? BEST_BID);
      const qty = state.volumeKey;
      pushPrint(tapePrintFromTrade(side, price, qty));
    },
    [pushPrint, state.volumeKey],
  );

  const runTapeSimulation = useCallback((durationMs: number) => {
    dispatch({ type: "START_TAPE_SIM", until: Date.now() + durationMs });
  }, []);

  const handleRowPointer = useCallback(
    (event: React.MouseEvent<HTMLElement>, level: PriceLevel) => {
      if (state.mode === "explain" || state.mode === "presenter") return;

      const practiceOn = state.practiceSession.active && !state.lessonId;
      const button = event.button as 0 | 2;

      if (practiceOn && (button === 0 || button === 2)) {
        const ptrEval = evaluatePracticePointer(state, button, level);
        if (!ptrEval.allow) {
          event.preventDefault();
          dispatch({ type: "PRACTICE_APPLY", eval: ptrEval });
          return;
        }
        if (ptrEval.success && ptrEval.advance) {
          event.preventDefault();
          dispatch({ type: "PRACTICE_APPLY", eval: ptrEval });
          return;
        }
        if (ptrEval.error) {
          dispatch({ type: "PRACTICE_APPLY", eval: ptrEval });
        }
      }

      event.preventDefault();
      dispatch({ type: "SET_SELECTED_PRICE", price: level.price });

      const qty = state.volumeKey;
      const inAskZone = level.price >= BEST_ASK || level.askSize > 0;
      const inBidZone = level.price <= BEST_BID || level.bidSize > 0;

      if (event.button === 1 && level.userOrder) {
        cancelOrder(level.userOrder.id);
        return;
      }

      if (practiceOn) {
        const task = getCurrentPracticeTask(state);
        if (task?.expectedAction === "find_bid_density") return;
      }

      if (event.button === 0) {
        if (inAskZone && level.askSize > 0) {
          runBookAction({ type: "market_buy", qty });
        } else if (inBidZone && level.price <= BEST_BID) {
          runBookAction({ type: "limit_buy", price: level.price, qty });
        }
        return;
      }

      if (event.button === 2) {
        if (inBidZone && level.bidSize > 0) {
          runBookAction({ type: "market_sell", qty });
        } else if (inAskZone && level.price >= BEST_ASK) {
          runBookAction({ type: "limit_sell", price: level.price, qty });
        }
      }
    },
    [state, runBookAction, cancelOrder],
  );

  useTerminalHotkeys(
    {
      onCancelAllLimits: () => runBookAction({ type: "cancel_all_limits" }),
      onClosePosition: () => runBookAction({ type: "close_position", qty: state.volumeKey }),
      onCenterBook: centerBook,
      onVolumeIndex: (index) =>
        dispatch({ type: "SET_VOLUME_KEY", key: volumeKeyFromIndex(index) }),
      onMarketBuy: () => runBookAction({ type: "market_buy", qty: state.volumeKey }),
      onMarketSell: () => runBookAction({ type: "market_sell", qty: state.volumeKey }),
    },
    state.mode === "terminal" || state.mode === "practice",
  );

  useEffect(() => {
    if (state.paused || state.mode === "scenario") return;

    const simActive = state.tapeSimUntil != null && state.tapeSimUntil > Date.now();
    const mode = simActive ? "active" : state.tapeScenarioMode;

    if (mode === "referenceSnapshot") return;
    let timeoutId = 0;
    const schedule = () => {
      const delay = scheduleDelay(mode);
      timeoutId = window.setTimeout(() => {
        const print = generateScenarioPrint(mode, marketRef.current);
        if (!print) {
          schedule();
          return;
        }

        let nextMarket = marketRef.current;
        let currentPrice = currentPriceRef.current;

        if (mode === "absorption") {
          pushPrint(print);
        } else if (mode === "breakoutAttempt") {
          breakoutBurstRef.current += 1;
          pushPrint(print);
          if (breakoutBurstRef.current >= 8) {
            breakoutBurstRef.current = 0;
            nextMarket = applyBreakoutShift(marketRef.current);
            const ask = getBestAskFromLevels(nextMarket);
            currentPrice = ask?.price ?? currentPrice;
            marketRef.current = nextMarket;
            dispatch({
              type: "BOOK_TRADE",
              market: nextMarket,
              userOrders: userOrdersRef.current,
              position: positionRef.current,
              currentPrice,
              feedback: "Breakout: best bid/ask +0.01",
            });
          }
        } else {
          const { market, filled } = applyMarketOrderToLadder(
            marketRef.current,
            print.side,
            print.qty,
          );
          if (filled > 0) {
            marketRef.current = market;
            const tradePrint = tapePrintFromTrade(print.side, print.price, filled);
            dispatch({
              type: "BOOK_TRADE",
              market,
              userOrders: userOrdersRef.current,
              position: positionRef.current,
              currentPrice: print.price,
              feedback: "",
              print: tradePrint,
            });
          } else {
            pushPrint(print);
          }
        }

        schedule();
      }, delay);
    };

    schedule();
    return () => window.clearTimeout(timeoutId);
  }, [state.paused, state.mode, state.tapeScenarioMode, state.tapeSimUntil, pushPrint]);

  useEffect(() => {
    const id = window.setInterval(() => {
      dispatch({ type: "TICK_TAPE", now: Date.now() });
    }, 180);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const isCaptureMode = () => {
      if (typeof window === "undefined") return false;
      return new URLSearchParams(window.location.search).get("capture") === "1";
    };

    const updateScale = () => {
      if (isCaptureMode()) {
        dispatch({ type: "SET_SCALE", scale: 1 });
        return;
      }
      const padX =
        chromeMode === "fullscreen" ? CSCALP_FULLSCREEN_PAD_X : CSCALP_VIEWPORT_PAD_X;
      const padY =
        chromeMode === "fullscreen" ? CSCALP_FULLSCREEN_PAD_Y : CSCALP_VIEWPORT_PAD_Y;
      const debugStack = document.querySelector<HTMLElement>(".cscalp-debug-stack");
      const debugH = debugStack?.getBoundingClientRect().height ?? 0;
      const qaPanel =
        chromeMode === "fullscreen" && debugStack
          ? document.querySelector<HTMLElement>(".cscalp-visual-qa")
          : null;
      const qaW = qaPanel?.getBoundingClientRect().width ?? 0;

      const scaleW = (window.innerWidth - padX - qaW) / CSCALP_DESIGN_WIDTH;
      const scaleH = (window.innerHeight - padY - debugH) / CSCALP_DESIGN_HEIGHT;
      dispatch({
        type: "SET_SCALE",
        scale: Math.min(1, scaleW, scaleH),
      });
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    const observer = new ResizeObserver(updateScale);
    const debugStack = document.querySelector(".cscalp-debug-stack");
    if (debugStack) observer.observe(debugStack);
    const qaPanel = document.querySelector(".cscalp-visual-qa");
    if (qaPanel) observer.observe(qaPanel);
    return () => {
      window.removeEventListener("resize", updateScale);
      observer.disconnect();
    };
  }, [chromeMode]);

  useEffect(() => {
    if (state.mode !== "scenario" || !state.scenarioId || !state.scenarioPlaying) return;

    let last = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const delta = (now - last) * state.scenarioSpeed;
      last = now;
      dispatch({ type: "SCENARIO_TICK", deltaMs: delta });
    }, 50);

    return () => window.clearInterval(id);
  }, [state.mode, state.scenarioId, state.scenarioPlaying, state.scenarioSpeed]);

  const zoneClass = useCallback(
    (zone: Exclude<HighlightZone, null>) => {
      const active = state.highlightZone;
      if (!active) return "";
      if (active === zone) return "cscalp-zone--active";
      if (
        active === "klastera" &&
        (zone === "klastera-cell" || zone === "klastera-footer")
      ) {
        return "cscalp-zone--dimmed";
      }
      if (
        (active === "klastera-cell" || active === "klastera-footer") &&
        zone === "klastera"
      ) {
        return "cscalp-zone--dimmed";
      }
      if (state.mode === "explain" || state.mode === "presenter" || state.mode === "practice") {
        if (state.lessonId) return "";
        return "cscalp-zone--dimmed";
      }
      return "";
    },
    [state.highlightZone, state.mode, state.lessonId],
  );

  const reportLessonAction = useCallback((action: ExpectedAction) => {
    dispatch({ type: "LESSON_ACTION_DONE", action });
  }, []);

  const currentLessonStep = useMemo(() => getCurrentLessonStep(state), [state]);

  const lessonStepsTotal = useMemo(() => lessonStepCount(state), [state]);

  const practiceHintPrice = useMemo(() => getPracticeHintPrice(state), [state]);

  const value: TerminalContextValue = {
    state,
    dispatch,
    priceLevels,
    setMode: (mode) => dispatch({ type: "SET_MODE", mode }),
    setVolumeKey: (key) => dispatch({ type: "SET_VOLUME_KEY", key }),
    setHighlight: (zone) => dispatch({ type: "SET_HIGHLIGHT", zone }),
    lessonNext: () => dispatch({ type: "LESSON_NEXT" }),
    lessonPrev: () => dispatch({ type: "LESSON_PREV" }),
    dispatchBook: runBookAction,
    handleRowPointer,
    cancelOrder,
    centerBook,
    toggleChart,
    setTapeScenarioMode,
    addTapePrint,
    runTapeSimulation,
    zoneClass,
    currentLessonStep,
    lessonStepsTotal,
    reportLessonAction,
    practiceHintPrice,
    activeScenario: getActiveMarketScenario(state),
  };

  return (
    <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>
  );
}

export function useTerminalStore() {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error("useTerminalStore must be used within TerminalProvider");
  return ctx;
}
