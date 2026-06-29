/**
 * One-off screener verification — thresholds, top-10 modes, SBER/ETF check.
 * Run: npx tsx scripts/verify-screener-report.ts
 */
import { getMarketInstruments } from "../lib/data/provider";
import {
  buildFilterThresholds,
  filterInstruments,
} from "../lib/screener/filter-modes";
import { isFundLikeInstrument } from "../lib/screener/order-book";

async function main() {
  const result = await getMarketInstruments();
  const rows = result.rows;
  const thresholds = buildFilterThresholds(rows);

  const technical = filterInstruments(rows, "technical", "", []);
  const spread = filterInstruments(rows, "spread", "", []);

  const sber = rows.find((r) => r.ticker === "SBER");
  const sberInSpread = spread.some((r) => r.ticker === "SBER");
  const sberRank =
    sberInSpread
      ? spread.findIndex((r) => r.ticker === "SBER") + 1
      : null;

  const funds = rows.filter((r) => isFundLikeInstrument(r));

  console.log(JSON.stringify({
    rowsTotal: rows.length,
    source: result.status.source,
    thresholds: {
      tradesP80: Math.round(thresholds.tradesP80),
      turnoverP80: Math.round(thresholds.turnoverP80),
      rangeP80: Number(thresholds.rangeP80.toFixed(2)),
      spreadP20: Number(thresholds.spreadP20.toFixed(2)),
      spreadP80: Number(thresholds.spreadP80.toFixed(2)),
    },
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
          inSpreadMode: sberInSpread,
          spreadRank: sberRank,
          spreadTicks: sber.spreadTicks,
          spreadTradingScore: sber.spreadTradingScore,
          technicalScore: sber.technicalScore,
          spreadTradable: sber.spreadTradable,
        }
      : null,
    fundLikeCount: funds.length,
    fundLikeTickers: funds.slice(0, 15).map((r) => r.ticker),
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
