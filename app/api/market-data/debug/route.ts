import { NextResponse } from "next/server";
import type { MarketDataMode } from "@/lib/data/types";
import type { MarketInstrument } from "@/lib/data/types";
import { getMarketInstruments } from "@/lib/data/provider";
import {
  buildFilterThresholds,
  filterInstruments,
  DEFAULT_SCREENER_QUICK_FILTERS,
} from "@/lib/screener/filter-modes";
import { buildScreenerFilterStats } from "@/lib/screener/liquidity-filters";
import { isFundLikeInstrument } from "@/lib/screener/order-book";
import { computeCommissionCosts } from "@/lib/screener/commission";
import { fetchLiveInvestCommissionMap } from "@/lib/server/liveinvest-characteristics";

const VALID_MODES: MarketDataMode[] = ["mock", "live", "fallback"];

const COMMISSION_SAMPLE_TICKERS = ["SBER", "GAZP", "LKOH", "WUSH"];

function commissionSampleRow(inst: MarketInstrument) {
  const formula = computeCommissionCosts({
    lotValue: inst.lotValue,
    lotSize: inst.lotSize,
    spreadRub: inst.spreadRub,
    spreadTicks: inst.spreadTicks,
    tickValueRub: inst.tickValueRub,
  });

  return {
    ticker: inst.ticker,
    price: inst.price,
    lotSize: inst.lotSize,
    tickSize: inst.tickSize,
    pointValueRub: inst.tickValueRub,
    lotValue: inst.lotValue,
    source: inst.commissionSource,
    marketRub: inst.commissionMarketRub,
    limitRub: inst.commissionLimitRub,
    marketPoints: inst.commissionMarketPoints,
    limitPoints: inst.commissionLimitPoints,
    formulaMarketRub: formula.commissionMarketRub,
    formulaLimitRub: formula.commissionLimitRub,
    formulaMarketPoints: formula.commissionMarketPoints,
    formulaLimitPoints: formula.commissionLimitPoints,
    diffMarketRub: Number(
      (inst.commissionMarketRub - formula.commissionMarketRub).toFixed(6),
    ),
    diffLimitRub: Number(
      (inst.commissionLimitRub - formula.commissionLimitRub).toFixed(6),
    ),
    diffMarketPoints:
      inst.commissionMarketPoints !== null &&
      formula.commissionMarketPoints !== null
        ? inst.commissionMarketPoints - formula.commissionMarketPoints
        : null,
    diffLimitPoints:
      inst.commissionLimitPoints !== null &&
      formula.commissionLimitPoints !== null
        ? inst.commissionLimitPoints - formula.commissionLimitPoints
        : null,
  };
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Debug endpoint disabled in production" },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const modeParam = searchParams.get("mode");
  const mode =
    modeParam && VALID_MODES.includes(modeParam as MarketDataMode)
      ? (modeParam as MarketDataMode)
      : undefined;

  const [{ map: liveInvestMap, meta: liveInvestMeta }, result] =
    await Promise.all([
      fetchLiveInvestCommissionMap(),
      getMarketInstruments(mode ? { mode } : undefined),
    ]);
  const { diagnostics } = result;
  const rows = result.rows;

  const matchedByTicker = rows.filter(
    (r) => r.commissionSource === "liveinvest",
  ).length;
  const fallbackFormulaCount = rows.filter(
    (r) => r.commissionSource === "formula",
  ).length;
  const missingLiveInvest = rows
    .filter((r) => r.commissionSource === "formula")
    .slice(0, 15)
    .map((r) => r.ticker);

  const commissionSamples = COMMISSION_SAMPLE_TICKERS.map((ticker) => {
    const inst = rows.find((r) => r.ticker === ticker);
    return inst ? commissionSampleRow(inst) : { ticker, error: "not in universe" };
  });

  if (searchParams.get("report") === "1") {
    const thresholds = buildFilterThresholds(rows);
    const technical = filterInstruments(rows, "technical", "", []);
    const spread = filterInstruments(rows, "spread", "", []);
    const defaultFiltered = filterInstruments(
      rows,
      "all",
      "",
      DEFAULT_SCREENER_QUICK_FILTERS,
    );
    const manyTrades = filterInstruments(rows, "all", "", ["many-trades"]);
    const sber = rows.find((r) => r.ticker === "SBER");
    const filterStats = buildScreenerFilterStats(
      rows,
      defaultFiltered,
      DEFAULT_SCREENER_QUICK_FILTERS,
    );

    return NextResponse.json({
      rowsTotal: rows.length,
      source: result.status.source,
      thresholds: {
        tradesP80: Math.round(thresholds.tradesP80),
        turnoverP80: Math.round(thresholds.turnoverP80),
        rangeP80: Number(thresholds.rangeP80.toFixed(2)),
        spreadP20: Number(thresholds.spreadP20.toFixed(2)),
        spreadP80: Number(thresholds.spreadP80.toFixed(2)),
      },
      filterStats,
      defaultFilterPreview: {
        manyTradesCount: manyTrades.length,
        tradesP80: Math.round(thresholds.tradesP80),
        defaultShownRows: defaultFiltered.length,
      },
      liveInvest: {
        endpoint:
          "https://production2.liveinvestgroup.ru/api/v1/stock/characteristics?isOnlyLiquid=true",
        liveInvestRows: liveInvestMeta.rows,
        matchedByTicker,
        fallbackFormulaCount,
        missingLiveInvestSample: missingLiveInvest,
        meta: liveInvestMeta,
      },
      commissionSamples,
      top10Technical: technical.slice(0, 10).map((r) => ({
        ticker: r.ticker,
        score: r.technicalScore,
        trades: r.trades,
        range: r.dayRangePct,
      })),
      top10Spread: spread.slice(0, 10).map((r) => ({
        ticker: r.ticker,
        score: r.spreadTradingScore,
        spreadPts: r.spreadTicks,
        trades: r.trades,
      })),
      sber: sber
        ? {
            ...commissionSampleRow(sber),
            inSpreadMode: spread.some((r) => r.ticker === "SBER"),
            spreadTicks: sber.spreadTicks,
            spreadTradingScore: sber.spreadTradingScore,
            technicalScore: sber.technicalScore,
            spreadTradable: sber.spreadTradable,
          }
        : null,
      fundLikeInTable: rows.filter((r) => isFundLikeInstrument(r)).length,
      liveInvestMapSize: liveInvestMap.size,
    });
  }

  return NextResponse.json({
    status: result.status,
    diagnostics,
    rowsCount: rows.length,
    liveInvest: {
      liveInvestRows: liveInvestMeta.rows,
      matchedByTicker,
      fallbackFormulaCount,
      meta: liveInvestMeta,
    },
    commissionSamples,
    universe: diagnostics.universe ?? null,
    sampleExcluded: diagnostics.sampleExcluded ?? [],
    sampleIncluded: diagnostics.sampleIncluded ?? [],
    sample: rows.slice(0, 3).map((row) => ({
      ticker: row.ticker,
      name: row.name,
      instrumentClass: row.instrumentClass,
      price: row.price,
      turnoverRub: row.turnoverRub,
      trades: row.trades,
      spreadRub: row.spreadRub,
      baselineStatus: row.baselineStatus,
      hasHistoricalBaseline: row.hasHistoricalBaseline,
      commissionSource: row.commissionSource,
      commissionMarketRub: row.commissionMarketRub,
      commissionMarketPoints: row.commissionMarketPoints,
    })),
    fundCheck: rows
      .filter((r) => r.instrumentClass === "fund" || r.instrumentClass === "etf")
      .slice(0, 5)
      .map((r) => ({
        ticker: r.ticker,
        name: r.name,
        instrumentClass: r.instrumentClass,
      })),
  });
}
