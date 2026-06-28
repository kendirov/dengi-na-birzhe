import type { MarketInstrumentRaw, MarketInstrument } from "@/lib/data/types";
import { DEFAULT_COMMISSION_RATE } from "@/lib/data/types";
import { calculateEntryCost } from "@/lib/screener/calculator";
import { buildScoreContext, computeScores } from "@/lib/screener/scoring";
import {
  buildTypeLabels,
  buildVisualTags,
  computeMedians,
} from "@/lib/screener/tags";
import {
  buildWhyBullets,
  buildRiskBullets,
  buildWhyShort,
  DEFAULT_LESSON_TIPS,
} from "@/lib/screener/insights";

function applyComputedFields(raw: MarketInstrumentRaw): MarketInstrumentRaw & {
  lotValue: number;
  rubPerPointPerLot: number;
  tickValueRub: number | null;
  bigLotRub: number | null;
  spreadPct: number | null;
  spreadTicks: number | null;
} {
  const lotValue = raw.price * raw.lotSize;
  const rubPerPointPerLot = raw.lotSize;
  const tickValueRub =
    raw.tickSize !== null ? raw.tickSize * raw.lotSize : null;
  const bigLotRub =
    raw.avgTurnover20d !== null ? raw.avgTurnover20d * 0.01 : null;
  const spreadPct =
    raw.spreadRub !== null && raw.price > 0
      ? (raw.spreadRub / raw.price) * 100
      : null;
  const spreadTicks =
    raw.spreadRub !== null && raw.tickSize !== null && raw.tickSize > 0
      ? raw.spreadRub / raw.tickSize
      : null;

  return {
    ...raw,
    lotValue,
    rubPerPointPerLot,
    tickValueRub,
    bigLotRub,
    spreadPct,
    spreadTicks,
  };
}

function enrichOne(
  raw: MarketInstrumentRaw,
  ctx: ReturnType<typeof buildScoreContext>,
): MarketInstrument {
  const withFields = applyComputedFields(raw);
  const scores = computeScores(withFields, ctx);

  const spreadRubForCost = withFields.spreadRub ?? 0;
  const { spreadCostRub, entryCostRub } = calculateEntryCost(
    spreadRubForCost,
    withFields.lotSize,
    withFields.lotValue,
    DEFAULT_COMMISSION_RATE,
  );

  return {
    ...withFields,
    ...scores,
    spreadCostRub: withFields.spreadRub !== null ? spreadCostRub : null,
    entryCostRub: withFields.spreadRub !== null ? entryCostRub : null,
    defaultCommissionRate: DEFAULT_COMMISSION_RATE,
    visualTags: [],
    whyBullets: [],
    riskBullets: [],
    lessonTips: DEFAULT_LESSON_TIPS,
    typeLabels: [],
    whyShort: "",
  };
}

export function enrichMarketInstruments(
  instruments: MarketInstrumentRaw[],
): MarketInstrument[] {
  const ctx = buildScoreContext(instruments);
  const enriched = instruments.map((inst) => enrichOne(inst, ctx));
  const medians = computeMedians(enriched);

  return enriched.map((inst) => ({
    ...inst,
    visualTags: buildVisualTags(inst, medians),
    typeLabels: buildTypeLabels(inst),
    whyBullets: buildWhyBullets(inst),
    riskBullets: buildRiskBullets(inst),
    whyShort: buildWhyShort(inst),
  }));
}

/** @deprecated use enrichMarketInstruments */
export const enrichInstruments = enrichMarketInstruments;
