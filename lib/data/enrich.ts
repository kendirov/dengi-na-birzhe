import type { MarketInstrumentRaw, MarketInstrument } from "@/lib/data/types";
import {
  DEFAULT_MARKET_COMMISSION_RATE,
  computeCommissionCosts,
} from "@/lib/screener/commission";
import { buildScoreContext, computeScores } from "@/lib/screener/scoring";
import {
  buildTypeLabels,
  buildVisualTags,
  computeMedians,
} from "@/lib/screener/tags";
import {
  buildWhyBullets,
  buildSpreadWhyBullets,
  buildRiskBullets,
  buildWhyShort,
  DEFAULT_LESSON_TIPS,
} from "@/lib/screener/insights";
import {
  buildSpreadUniverseContext,
  isSpreadTradableCandidate,
} from "@/lib/screener/spread-trading";

function applyComputedFields(raw: MarketInstrumentRaw): MarketInstrumentRaw & {
  lotValue: number;
  rubPerPointPerLot: number;
  tickValueRub: number | null;
  bigLotRub: number | null;
  spreadPct: number | null;
  spreadTicks: number | null;
} {
  const lotValue = raw.price * raw.lotSize;
  const tickValueRub =
    raw.tickSize !== null ? raw.tickSize * raw.lotSize : null;
  const rubPerPointPerLot = tickValueRub ?? 0;
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

  const costs = computeCommissionCosts({
    lotValue: withFields.lotValue,
    lotSize: withFields.lotSize,
    spreadRub: withFields.spreadRub,
    spreadTicks: withFields.spreadTicks,
    tickValueRub: withFields.tickValueRub,
  });

  return {
    ...withFields,
    ...scores,
    ...costs,
    spreadCostRub: costs.spreadCostRub,
    entryCostRub: costs.entryCostMarketRub,
    defaultCommissionRate: DEFAULT_MARKET_COMMISSION_RATE,
    visualTags: [],
    whyBullets: [],
    spreadWhyBullets: [],
    spreadTradable: false,
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
  const spreadCtx = buildSpreadUniverseContext(enriched);

  return enriched.map((inst) => {
    const spreadTradable = isSpreadTradableCandidate(inst, spreadCtx);
    return {
      ...inst,
      spreadTradable,
      visualTags: buildVisualTags(inst, medians),
      typeLabels: buildTypeLabels(inst),
      whyBullets: buildWhyBullets(inst),
      spreadWhyBullets: spreadTradable ? buildSpreadWhyBullets(inst) : [],
      riskBullets: buildRiskBullets(inst),
      whyShort: buildWhyShort(inst),
    };
  });
}

/** @deprecated use enrichMarketInstruments */
export const enrichInstruments = enrichMarketInstruments;
