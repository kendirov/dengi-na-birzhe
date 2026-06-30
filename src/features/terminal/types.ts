/** CScalp trainer — domain types (mock sandbox only, no live API). */

export const PRICE_STEP = 0.01;

export type TrainerMode =
  | "terminal"
  | "explain"
  | "practice"
  | "scenario"
  | "presenter";

export type HighlightZone =
  | "stakan"
  | "lenta"
  | "klastera"
  | "klastera-cell"
  | "klastera-footer"
  | "chart"
  | "volume"
  | null;

export type DriveVolumeKey = 50 | 100 | 200 | 400 | 800;

export type TradeSide = "buy" | "sell";

export type PriceMode = "F" | "D" | "L";

export type OrderType = "limit" | "market" | "stop";

export type OrderStatus = "active" | "filled" | "cancelled";

export type PositionSide = "long" | "short" | "flat";

export interface UserOrder {
  id: string;
  side: TradeSide;
  price: number;
  qty: number;
  type: OrderType;
  status: OrderStatus;
}

export interface Position {
  side: PositionSide;
  qty: number;
  avgPrice: number;
  pnlPoints: number;
}

export interface PriceLevel {
  price: number;
  askSize: number;
  bidSize: number;
  askHeat: number;
  bidHeat: number;
  isBestAsk: boolean;
  isBestBid: boolean;
  isCurrentPrice: boolean;
  userOrder?: UserOrder;
}

/** @deprecated use PriceLevel — kept for cluster seed compat */
export interface OrderBookLevel {
  price: number;
  askQty: number;
  bidQty: number;
  densityQty: number;
  densitySide?: "ask" | "bid";
}

export interface ClusterLevel {
  price: number;
  buyVol: number;
  sellVol: number;
  totalVol: number;
  delta: number;
  intensity: number;
  isPoc?: boolean;
}

export interface ClusterCandle {
  time: string;
  levels: ClusterLevel[];
  totalVol: number;
  delta: number;
  maxVol: number;
}

/** @deprecated legacy cluster cell */
export interface ClusterCell {
  buy: number;
  sell: number;
  poc?: "white" | "red" | "green";
}

/** @deprecated use ClusterCandle */
export interface ClusterColumn {
  time: string;
  cells: Map<number, ClusterCell>;
  totalBuy: number;
  totalSell: number;
}

export type TapeScenarioMode =
  | "referenceSnapshot"
  | "normal"
  | "active"
  | "absorption"
  | "breakoutAttempt";

export interface TapePrint {
  id: string;
  side: TradeSide;
  price: number;
  qty: number;
  timestamp: number;
  intensity: number;
  isLarge: boolean;
  /** 0–100, right → left drift */
  laneX: number;
  opacity: number;
}

/** @deprecated use TapePrint */
export interface TapeBubble {
  id: string;
  price: number;
  qty: number;
  side: TradeSide;
  xPercent: number;
  createdAt: number;
  opacity: number;
}

export interface ChartCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartPoint {
  time: string;
  timestamp: number;
  /** Close price */
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  up: boolean;
}

export type ChartLayoutMode = "embedded" | "presentation";

export type ChartDrawingTool = "horizontal" | "rectangle" | "arrow" | null;

export interface ChartDrawing {
  id: string;
  type: "horizontal" | "rectangle" | "arrow";
  price?: number;
  priceTop?: number;
  priceBottom?: number;
  indexStart?: number;
  indexEnd?: number;
  indexFrom?: number;
  priceFrom?: number;
  indexTo?: number;
  priceTo?: number;
}

export interface InstrumentMeta {
  symbol: string;
  exchange: string;
  tickCount: number;
  maxClusterVol: number;
  clusterDeltaBuy: string;
  clusterDeltaSell: string;
  latencyMs: number;
  priceStepMult: 1 | 10 | 100 | 1000;
}

export interface CalloutSpec {
  zone: Exclude<HighlightZone, null>;
  title: string;
  body: string;
  anchor?: "top" | "center" | "bottom";
}

export type CalloutPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type HighlightType = "outline" | "glow" | "dimRest" | "arrow";

export type ExpectedAction =
  | "setVolume50"
  | "limitBuyBid"
  | "cancelLimitsF"
  | "marketBuyT"
  | "closePositionD"
  | "observeTape"
  | "observeCluster";

export interface LessonStep {
  id: string;
  title: string;
  shortText: string;
  targetSelector: string;
  calloutPosition: CalloutPosition;
  highlightType: HighlightType;
  actionHint?: string;
  expectedAction?: ExpectedAction;
  nextOnAction?: boolean;
  speakerNotes?: string;
  /** @deprecated legacy zone highlight */
  highlight?: HighlightZone;
  body?: string;
  callouts?: CalloutSpec[];
  practiceHint?: string;
}

export interface LessonDefinition {
  id: string;
  title: string;
  steps: LessonStep[];
}

export interface ScenarioKeyframe {
  atMs: number;
  bubbles?: Omit<TapeBubble, "createdAt" | "opacity">[];
  note?: string;
}

export interface ScenarioScript {
  id: string;
  title: string;
  durationMs: number;
  keyframes: ScenarioKeyframe[];
}

export type ScenarioSpeed = 0.5 | 1 | 2;

export interface ScenarioCalloutState {
  title?: string;
  text: string;
  targetSelector?: string;
  calloutPosition?: CalloutPosition;
}

export interface ScenarioBaseline {
  market: PriceLevel[];
  userOrders: UserOrder[];
  position: Position;
  currentPrice: number;
  tapePrints: TapePrint[];
  clusterCandles: ClusterCandle[];
  chartPoints: ChartPoint[];
  tapeScenarioMode: TapeScenarioMode;
}

export type ScenarioEvent =
  | {
      atMs: number;
      type: "addTapePrint";
      side: TradeSide;
      price: number;
      qty: number;
      isLarge?: boolean;
    }
  | {
      atMs: number;
      type: "changeLevelVolume";
      price: number;
      askVol?: number;
      bidVol?: number;
      deltaAsk?: number;
      deltaBid?: number;
    }
  | {
      atMs: number;
      type: "moveBestBidAsk";
      bestAsk: number;
      bestBid: number;
      currentPrice?: number;
    }
  | {
      atMs: number;
      type: "addUserOrder";
      side: TradeSide;
      price: number;
      qty: number;
      orderType?: OrderType;
    }
  | {
      atMs: number;
      type: "fillUserOrder";
      orderId?: string;
      price?: number;
    }
  | {
      atMs: number;
      type: "addClusterVolume";
      price: number;
      buyVol?: number;
      sellVol?: number;
      deltaBuy?: number;
      deltaSell?: number;
      candleIndex?: number;
    }
  | {
      atMs: number;
      type: "showLessonCallout";
      callout: ScenarioCalloutState;
    }
  | { atMs: number; type: "pause" }
  | { atMs: number; type: "reset" };

export interface MarketScenario {
  id: string;
  name: string;
  description: string;
  durationMs: number;
  events: ScenarioEvent[];
}

export interface TerminalState {
  mode: TrainerMode;
  paused: boolean;
  volumeKey: DriveVolumeKey;
  priceMode: PriceMode;
  selectedPrice: number | null;
  highlightZone: HighlightZone;
  lessonId: string | null;
  lessonStepIndex: number;
  hintsHidden: boolean;
  scenarioId: string | null;
  scenarioElapsedMs: number;
  scenarioPlaying: boolean;
  scenarioSpeed: ScenarioSpeed;
  scenarioFiredEvents: string[];
  scenarioCallout: ScenarioCalloutState | null;
  scenarioShowAnnotations: boolean;
  scenarioBaseline: ScenarioBaseline | null;
  scale: number;
  market: PriceLevel[];
  userOrders: UserOrder[];
  position: Position;
  currentPrice: number;
  bookCenterTick: number;
  lastFeedback: string;
  clusterCandles: ClusterCandle[];
  ladderScrollTop: number;
  hoveredLadderPrice: number | null;
  clusterHint: string | null;
  tapePrints: TapePrint[];
  tapeScenarioMode: TapeScenarioMode;
  tapeSimUntil: number | null;
  chartOpen: boolean;
  chartPoints: ChartPoint[];
  chartDrawings: ChartDrawing[];
  chartDrawingTool: ChartDrawingTool;
  chartHoverIndex: number | null;
  practiceSession: PracticeSession;
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

export interface PracticeEvalResult {
  allow: boolean;
  error?: string;
  wrongMarket?: boolean;
  wrongVolume?: boolean;
  success?: boolean;
  successMessage?: string;
  advance?: boolean;
}

export type TerminalAction =
  | { type: "SET_MODE"; mode: TrainerMode }
  | { type: "SET_PAUSED"; paused: boolean }
  | { type: "SET_VOLUME_KEY"; key: DriveVolumeKey }
  | { type: "SET_PRICE_MODE"; mode: PriceMode }
  | { type: "SET_HIGHLIGHT"; zone: HighlightZone }
  | { type: "SET_SELECTED_PRICE"; price: number | null }
  | { type: "SET_SCALE"; scale: number }
  | { type: "LESSON_NEXT" }
  | { type: "LESSON_PREV" }
  | { type: "LESSON_GOTO"; index: number }
  | { type: "SET_LESSON"; lessonId: string | null }
  | { type: "TOGGLE_HINTS" }
  | { type: "SET_HINTS_HIDDEN"; hidden: boolean }
  | { type: "LESSON_ACTION_DONE"; action: ExpectedAction }
  | { type: "SCENARIO_START"; id: string }
  | { type: "SCENARIO_SELECT"; id: string }
  | { type: "SCENARIO_TICK"; deltaMs: number }
  | { type: "SCENARIO_PLAY_PAUSE" }
  | { type: "SCENARIO_STEP" }
  | { type: "SCENARIO_RESTART" }
  | { type: "SCENARIO_SET_SPEED"; speed: ScenarioSpeed }
  | { type: "SCENARIO_TOGGLE_ANNOTATIONS" }
  | { type: "SCENARIO_DISMISS_CALLOUT" }
  | { type: "SCENARIO_STOP" }
  | { type: "PUSH_PRINT"; print: TapePrint }
  | { type: "SET_TAPE_MODE"; mode: TapeScenarioMode }
  | { type: "START_TAPE_SIM"; until: number }
  | { type: "STOP_TAPE_SIM" }
  | { type: "TICK_TAPE"; now: number }
  | { type: "SET_MARKET"; market: PriceLevel[] }
  | { type: "SET_USER_ORDERS"; orders: UserOrder[] }
  | { type: "SET_POSITION"; position: Position }
  | { type: "SET_CURRENT_PRICE"; price: number }
  | { type: "SET_BOOK_CENTER"; price: number }
  | { type: "SET_FEEDBACK"; message: string }
  | { type: "SET_LADDER_SCROLL"; scrollTop: number }
  | { type: "SET_HOVERED_LADDER_PRICE"; price: number | null }
  | { type: "SET_CLUSTER_HINT"; hint: string | null }
  | { type: "SET_CLUSTER_CANDLES"; candles: ClusterCandle[] }
  | { type: "TOGGLE_CHART" }
  | { type: "SET_CHART_OPEN"; open: boolean }
  | { type: "SET_CHART_POINTS"; points: ChartPoint[] }
  | { type: "SET_CHART_DRAWING_TOOL"; tool: ChartDrawingTool }
  | { type: "ADD_CHART_DRAWING"; drawing: ChartDrawing }
  | { type: "CLEAR_CHART_DRAWINGS" }
  | { type: "SET_CHART_HOVER"; index: number | null }
  | { type: "PRACTICE_START" }
  | { type: "PRACTICE_RESET" }
  | { type: "PRACTICE_TOGGLE_HINT" }
  | { type: "PRACTICE_CONFIRM_ABSORPTION" }
  | { type: "PRACTICE_TAPE_CLICK" }
  | { type: "PRACTICE_APPLY"; eval: PracticeEvalResult }
  | { type: "TICK_BUBBLES"; now: number }
  | {
      type: "BOOK_TRADE";
      market: PriceLevel[];
      userOrders: UserOrder[];
      position: Position;
      currentPrice: number;
      feedback: string;
      print?: TapePrint;
    };
