import { enrichPriceLevels, recomputePriceLevels } from "../data/mockMarket";
import { getMarketScenario } from "../data/scenarios";
import {
  addVolumeToClusterCandle,
  buildClusterCandles,
  updateLastCandleFromTrade,
} from "./clusterEngine";
import { buildInitialChartPoints, syncChartTail } from "./chartEngine";
import { createInitialBookState } from "./orderEngine";
import { initialTapePrints, tapePrintFromTrade } from "./tapeEngine";
import type {
  MarketScenario,
  ScenarioBaseline,
  ScenarioEvent,
  ScenarioSpeed,
  TerminalState,
  UserOrder,
} from "../types";

const TAPE_MAX = 48;

let scenarioOrderSeq = 0;

function nextScenarioOrderId(): string {
  scenarioOrderSeq += 1;
  return `sc-o-${Date.now()}-${scenarioOrderSeq}`;
}

export function scenarioEventKey(event: ScenarioEvent, index: number): string {
  return `${event.atMs}-${event.type}-${index}`;
}

export function captureScenarioBaseline(state: TerminalState): ScenarioBaseline {
  return {
    market: state.market.map((r) => ({ ...r })),
    userOrders: state.userOrders.map((o) => ({ ...o })),
    position: { ...state.position },
    currentPrice: state.currentPrice,
    tapePrints: state.tapePrints.map((p) => ({ ...p })),
    clusterCandles: state.clusterCandles,
    chartPoints: state.chartPoints.map((p) => ({ ...p })),
    tapeScenarioMode: state.tapeScenarioMode,
  };
}

function restoreFromBaseline(baseline: ScenarioBaseline): Partial<TerminalState> {
  return {
    market: baseline.market.map((r) => ({ ...r })),
    userOrders: baseline.userOrders.map((o) => ({ ...o })),
    position: { ...baseline.position },
    currentPrice: baseline.currentPrice,
    tapePrints: baseline.tapePrints.map((p) => ({ ...p })),
    clusterCandles: baseline.clusterCandles,
    chartPoints: baseline.chartPoints.map((p) => ({ ...p })),
    tapeScenarioMode: baseline.tapeScenarioMode,
    lastFeedback: "",
    scenarioCallout: null,
  };
}

function appendScenarioPrint(prints: TerminalState["tapePrints"], print: TerminalState["tapePrints"][0]) {
  return [print, ...prints].slice(0, TAPE_MAX);
}

function syncScenarioChart(state: TerminalState): TerminalState["chartPoints"] {
  const bid =
    state.market.find((l) => l.isBestBid)?.price ??
    state.market.filter((l) => l.bidSize > 0).map((l) => l.price).sort((a, b) => b - a)[0] ??
    state.currentPrice;
  const ask =
    state.market.find((l) => l.isBestAsk)?.price ??
    state.market.filter((l) => l.askSize > 0).map((l) => l.price).sort((a, b) => a - b)[0] ??
    state.currentPrice;
  return syncChartTail(state.chartPoints, state.currentPrice, bid, ask, "active");
}

function applyChangeLevelVolume(
  market: TerminalState["market"],
  price: number,
  opts: Pick<ScenarioEvent & { type: "changeLevelVolume" }, "askVol" | "bidVol" | "deltaAsk" | "deltaBid">,
  currentPrice: number,
): TerminalState["market"] {
  const next = market.map((row) => {
    if (row.price !== price) return row;
    const askSize =
      opts.askVol ??
      Math.max(0, row.askSize + (opts.deltaAsk ?? 0));
    const bidSize =
      opts.bidVol ??
      Math.max(0, row.bidSize + (opts.deltaBid ?? 0));
    return { ...row, askSize, bidSize };
  });
  return recomputePriceLevels(next, currentPrice);
}

function applyMoveBestBidAsk(
  market: TerminalState["market"],
  bestAsk: number,
  bestBid: number,
  currentPrice: number,
): { market: TerminalState["market"]; currentPrice: number } {
  const next = market.map((row) => ({ ...row }));
  const askRow = next.find((r) => r.price === bestAsk);
  const bidRow = next.find((r) => r.price === bestBid);
  if (askRow && askRow.askSize === 0) askRow.askSize = 500;
  if (bidRow && bidRow.bidSize === 0) bidRow.bidSize = 400;
  const cp = currentPrice;
  return {
    market: recomputePriceLevels(next, cp),
    currentPrice: cp,
  };
}

export function applyScenarioEvent(
  state: TerminalState,
  event: ScenarioEvent,
  baseline: ScenarioBaseline | null,
): TerminalState {
  switch (event.type) {
    case "reset": {
      if (!baseline) return state;
      const restored = restoreFromBaseline(baseline);
      return { ...state, ...restored };
    }
    case "pause":
      return { ...state, scenarioPlaying: false };
    case "showLessonCallout":
      return {
        ...state,
        scenarioCallout: state.scenarioShowAnnotations ? event.callout : null,
      };
    case "addTapePrint": {
      const print = tapePrintFromTrade(event.side, event.price, event.qty);
      if (event.isLarge) {
        print.isLarge = true;
        print.intensity = Math.min(1, print.intensity + 0.15);
      }
      const tapePrints = appendScenarioPrint(state.tapePrints, print);
      const clusterCandles = updateLastCandleFromTrade(
        state.clusterCandles,
        event.price,
        event.qty,
        event.side,
      );
      return {
        ...state,
        tapePrints,
        clusterCandles,
        chartPoints: syncScenarioChart({ ...state, tapePrints, clusterCandles }),
      };
    }
    case "changeLevelVolume": {
      const market = applyChangeLevelVolume(
        state.market,
        event.price,
        event,
        state.currentPrice,
      );
      return {
        ...state,
        market: enrichPriceLevels(market, state.userOrders, state.currentPrice),
      };
    }
    case "moveBestBidAsk": {
      const { market, currentPrice } = applyMoveBestBidAsk(
        state.market,
        event.bestAsk,
        event.bestBid,
        event.currentPrice ?? state.currentPrice,
      );
      return {
        ...state,
        market: enrichPriceLevels(market, state.userOrders, currentPrice),
        currentPrice,
        chartPoints: syncScenarioChart({ ...state, market, currentPrice }),
      };
    }
    case "addUserOrder": {
      const order: UserOrder = {
        id: nextScenarioOrderId(),
        side: event.side,
        price: event.price,
        qty: event.qty,
        type: event.orderType ?? "limit",
        status: "active",
      };
      return {
        ...state,
        userOrders: [...state.userOrders, order],
        market: enrichPriceLevels(state.market, [...state.userOrders, order], state.currentPrice),
      };
    }
    case "fillUserOrder": {
      const target =
        event.orderId != null
          ? state.userOrders.find((o) => o.id === event.orderId)
          : event.price != null
            ? state.userOrders.find((o) => o.price === event.price && o.status === "active")
            : undefined;
      if (!target) return state;
      const userOrders = state.userOrders.map((o) =>
        o.id === target.id ? { ...o, status: "filled" as const } : o,
      );
      return {
        ...state,
        userOrders,
        market: enrichPriceLevels(state.market, userOrders, state.currentPrice),
        lastFeedback: `Заявка ${target.qty} @ ${target.price.toFixed(2)} исполнена`,
      };
    }
    case "addClusterVolume": {
      const clusterCandles = addVolumeToClusterCandle(state.clusterCandles, event.price, {
        buyVol: event.buyVol,
        sellVol: event.sellVol,
        deltaBuy: event.deltaBuy,
        deltaSell: event.deltaSell,
        candleIndex: event.candleIndex,
      });
      return { ...state, clusterCandles };
    }
    default:
      return state;
  }
}

function applyPendingEvents(
  state: TerminalState,
  scenario: MarketScenario,
  upToMs: number,
  onlyNext = false,
): TerminalState {
  let next = state;
  for (const [index, event] of scenario.events.entries()) {
    const key = scenarioEventKey(event, index);
    if (next.scenarioFiredEvents.includes(key)) continue;
    if (event.atMs > upToMs) break;

    next = applyScenarioEvent(next, event, next.scenarioBaseline);
    next = {
      ...next,
      scenarioFiredEvents: [...next.scenarioFiredEvents, key],
    };

    if (event.type === "pause") {
      next = { ...next, scenarioPlaying: false };
    }

    if (onlyNext) break;
  }
  return next;
}

export function startScenario(state: TerminalState, id: string): TerminalState {
  const scenario = getMarketScenario(id);
  if (!scenario) return state;

  const now = Date.now();
  const book = createInitialBookState();

  const baseline = captureScenarioBaseline({
    ...state,
    market: book.market.map((r) => ({ ...r })),
    userOrders: book.userOrders,
    position: book.position,
    currentPrice: book.currentPrice,
    tapePrints: initialTapePrints(now),
    clusterCandles: buildClusterCandles(),
    chartPoints: buildInitialChartPoints(),
    tapeScenarioMode: "normal",
  });

  let next: TerminalState = {
    ...state,
    mode: "scenario",
    scenarioId: id,
    scenarioElapsedMs: 0,
    scenarioPlaying: true,
    scenarioSpeed: 1,
    scenarioFiredEvents: [],
    scenarioCallout: null,
    scenarioShowAnnotations: true,
    scenarioBaseline: baseline,
    paused: false,
    highlightZone: null,
    practiceSession: { ...state.practiceSession, active: false },
    ...restoreFromBaseline(baseline),
  };

  next = applyPendingEvents(next, scenario, 0);
  return next;
}

export function restartScenario(state: TerminalState): TerminalState {
  if (!state.scenarioId || !state.scenarioBaseline) return state;
  const scenario = getMarketScenario(state.scenarioId);
  if (!scenario) return state;

  let next: TerminalState = {
    ...state,
    ...restoreFromBaseline(state.scenarioBaseline),
    scenarioElapsedMs: 0,
    scenarioPlaying: true,
    scenarioFiredEvents: [],
    scenarioCallout: null,
  };
  next = applyPendingEvents(next, scenario, 0);
  return next;
}

export function processScenarioTick(state: TerminalState, deltaMs: number): TerminalState {
  if (!state.scenarioId || !state.scenarioPlaying) return state;
  const scenario = getMarketScenario(state.scenarioId);
  if (!scenario) return state;

  const nextElapsed = state.scenarioElapsedMs + deltaMs;
  let next: TerminalState = { ...state, scenarioElapsedMs: nextElapsed };
  next = applyPendingEvents(next, scenario, nextElapsed);

  if (nextElapsed >= scenario.durationMs && next.scenarioPlaying) {
    next = { ...next, scenarioPlaying: false };
  }
  return next;
}

export function processScenarioStep(state: TerminalState): TerminalState {
  if (!state.scenarioId) return state;
  const scenario = getMarketScenario(state.scenarioId);
  if (!scenario) return state;

  let next = { ...state, scenarioPlaying: false };
  const nextEvent = scenario.events.find(
    (_, index) => !state.scenarioFiredEvents.includes(scenarioEventKey(scenario.events[index]!, index)),
  );
  if (!nextEvent) return next;

  next = {
    ...next,
    scenarioElapsedMs: Math.max(state.scenarioElapsedMs, nextEvent.atMs),
  };
  next = applyPendingEvents(next, scenario, nextEvent.atMs, true);
  return next;
}

export function stopScenario(state: TerminalState): TerminalState {
  return {
    ...state,
    scenarioId: null,
    scenarioElapsedMs: 0,
    scenarioPlaying: false,
    scenarioFiredEvents: [],
    scenarioCallout: null,
    scenarioBaseline: null,
  };
}

export function getActiveMarketScenario(state: TerminalState): MarketScenario | null {
  if (!state.scenarioId) return null;
  return getMarketScenario(state.scenarioId) ?? null;
}

export const SCENARIO_SPEEDS: ScenarioSpeed[] = [0.5, 1, 2];

export { getMarketScenario, MARKET_SCENARIOS } from "../data/scenarios";
