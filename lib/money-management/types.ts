/** Режим расчёта базового риска на сделку (расширяемый). */
export type RiskMode = "drawdown" | "fixed" | "custom";

export type MoneyManagementWarningCode =
  | "zero_stop_distance"
  | "zero_risk_per_lot"
  | "position_too_small";

export interface MoneyManagementWarning {
  code: MoneyManagementWarningCode;
  message: string;
}

/** Основные входные параметры ядра расчётов. */
export interface MoneyManagementInput {
  deposit: number;
  dailyDrawdownRub: number;
  targetPercent: number;
  plannedTrades: number;
  entryPrice: number;
  stopPrice: number;
  tickSize: number;
  pointValueRub: number;
  slippagePoints: number;
  entryCommissionRub: number;
  exitCommissionRub: number;
  /** Режим риска; по умолчанию drawdown. */
  riskMode?: RiskMode;
  /** Для mode = fixed */
  fixedRiskRub?: number;
  /** Для mode = custom */
  customRiskRub?: number;
  /** Экспозиция 1 лота в ₽ — только для UI (не в формулах ядра). */
  lotValueRub?: number;
}

export interface RiskBreakdownPart {
  key: "stop" | "slippage" | "entryCommission" | "exitCommission";
  label: string;
  points: number;
  rub: number;
  tone: "red" | "amber" | "cyan";
}

export interface CalculationStep {
  key: string;
  label: string;
  formula: string;
  operands: Record<string, number>;
  result: number;
}

/** Unit-like debug object для прозрачности в UI. */
export interface MoneyManagementDebug {
  input: MoneyManagementInput;
  plannedTradesEffective: number;
  riskMode: RiskMode;
  formulas: Record<string, string>;
  steps: CalculationStep[];
}

export interface MoneyManagementResult {
  targetRub: number;
  baseRiskPerTradeRub: number;
  stopDistancePoints: number;
  stopLossRubPerLot: number;
  slippageRubPerLot: number;
  totalRiskPerLotRub: number;
  maxPositionLots: number;
  actualTradeRiskRub: number;
  reducedVolumeLots: number;
  baseVolumeLots: number;
  increasedVolumeLots: number;
  increasedVolumeNote: string;
  riskPerLotPoints: number;
  breakdown: RiskBreakdownPart[];
  warnings: MoneyManagementWarning[];
  debug: MoneyManagementDebug;
  /** Нормализованное число сделок (≥ 1). */
  plannedTradesEffective: number;
}

/** UI: учебный инструмент для комиссий и экспозиции. */
export interface DemoInstrument {
  ticker: string;
  name: string;
  price: number;
  lotSize: number;
  tickSize: number;
  pointValueRub: number;
  lotValue: number;
  spreadRub: number;
}

export type OrderSide = "limit" | "market";

export type TradingMode = "calm" | "standard" | "aggressive";

/** UI-состояние плана дня (конвертируется в ядро). */
export interface DailyPlanUiInput {
  depositRub: number;
  /** Дневная просадка в рублях. */
  drawdownRub: number;
  dailyGoalPct: number;
  plannedTrades: number;
}

export interface DailyPlanUiResult {
  targetRub: number;
  dailyDrawdownRub: number;
  baseRiskPerTradeRub: number;
}

/** Верификационный кейс из ТЗ. */
export const VERIFICATION_EXAMPLE_INPUT: MoneyManagementInput = {
  deposit: 500,
  dailyDrawdownRub: 50,
  targetPercent: 1,
  plannedTrades: 5,
  entryPrice: 286.2,
  stopPrice: 286.0,
  /** MOEX-акция ~286₽: min step 0.01 → |286.2−286.0|/0.01 = 20 п. */
  tickSize: 0.01,
  pointValueRub: 0.2,
  slippagePoints: 1,
  entryCommissionRub: 0.3,
  exitCommissionRub: 0.3,
};
