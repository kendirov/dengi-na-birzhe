/**
 * Верификация кейса из ТЗ (запуск: node scripts/verify-mm-example.mjs)
 */

const input = {
  deposit: 500,
  dailyDrawdownRub: 50,
  targetPercent: 1,
  plannedTrades: 5,
  entryPrice: 286.2,
  stopPrice: 286.0,
  tickSize: 0.01,
  pointValueRub: 0.2,
  slippagePoints: 1,
  entryCommissionRub: 0.3,
  exitCommissionRub: 0.3,
};

const plannedTrades = Math.max(1, Math.floor(input.plannedTrades));
const targetRub = (input.deposit * input.targetPercent) / 100;
const baseRiskPerTradeRub = input.dailyDrawdownRub / plannedTrades;
const stopDistancePoints =
  Math.abs(input.entryPrice - input.stopPrice) / input.tickSize;
const stopLossRubPerLot = stopDistancePoints * input.pointValueRub;
const slippageRubPerLot = input.slippagePoints * input.pointValueRub;
const totalRiskPerLotRub =
  stopLossRubPerLot +
  slippageRubPerLot +
  input.entryCommissionRub +
  input.exitCommissionRub;
const maxPositionLots =
  totalRiskPerLotRub > 0
    ? Math.floor(baseRiskPerTradeRub / totalRiskPerLotRub)
    : 0;
const actualTradeRiskRub = maxPositionLots * totalRiskPerLotRub;
const reducedVolumeLots = Math.floor(maxPositionLots * 0.5);
const baseVolumeLots = maxPositionLots;
const scaledIncreased = Math.floor(maxPositionLots * 1.5);
const increasedVolumeLots =
  scaledIncreased < baseVolumeLots + 1 ? baseVolumeLots + 1 : scaledIncreased;

const expected = {
  targetRub: 5,
  baseRiskPerTradeRub: 10,
  stopDistancePoints: 20,
  stopLossRubPerLot: 4,
  slippageRubPerLot: 0.2,
  totalRiskPerLotRub: 4.8,
  maxPositionLots: 2,
  actualTradeRiskRub: 9.6,
  reducedVolumeLots: 1,
  baseVolumeLots: 2,
  increasedVolumeLots: 3,
};

const actual = {
  targetRub,
  baseRiskPerTradeRub,
  stopDistancePoints,
  stopLossRubPerLot,
  slippageRubPerLot,
  totalRiskPerLotRub,
  maxPositionLots,
  actualTradeRiskRub,
  reducedVolumeLots,
  baseVolumeLots,
  increasedVolumeLots,
};

const approx = (a, b) => Math.abs(a - b) < 1e-6;

let ok = true;
for (const [key, exp] of Object.entries(expected)) {
  const got = actual[key];
  const pass = approx(got, exp);
  console.log(`${pass ? "✓" : "✗"} ${key}: expected ${exp}, got ${got}`);
  if (!pass) ok = false;
}

process.exit(ok ? 0 : 1);
