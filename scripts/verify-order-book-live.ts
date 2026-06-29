import { fetchMoexIssFromBrowser } from "@/lib/data/moex-browser";
import { enrichMarketInstruments } from "@/lib/data/enrich";
import {
  filterInstruments,
  getTopInstruments,
} from "@/lib/screener/filter-modes";
import {
  isFundLikeInstrument,
  isBlueChipUltraTightInstrument,
  buildOrderBookUniverseContext,
} from "@/lib/screener/order-book";

async function main() {
  const moex = await fetchMoexIssFromBrowser();
  const instruments = enrichMarketInstruments(moex.rows);
  const ctx = buildOrderBookUniverseContext(instruments);
  const top5 = getTopInstruments(instruments, "spread", 5);
  const filtered = filterInstruments(instruments, "spread", "", []);
  const funds = filtered.filter((i) => isFundLikeInstrument(i));
  const ultraTight = top5.filter((i) => isBlueChipUltraTightInstrument(i, ctx));

  const check = (ticker: string) => {
    const inst = instruments.find((i) => i.ticker === ticker);
    if (!inst) return { ticker, found: false };
    return {
      ticker,
      spreadTradable: inst.spreadTradable,
      spreadTicks: inst.spreadTicks,
      spreadPct: inst.spreadPct,
      trades: inst.trades,
      turnoverRub: inst.turnoverRub,
      spreadTradingScore: inst.spreadTradingScore,
      ultraTight: isBlueChipUltraTightInstrument(inst, ctx),
      inSpreadMode: filtered.some((f) => f.ticker === ticker),
    };
  };

  console.log(
    JSON.stringify(
      {
        source: "moex-browser",
        rowsCount: instruments.length,
        spreadCandidates: filtered.length,
        top5: top5.map((i) => ({
          ticker: i.ticker,
          name: i.name,
          spreadTicks: i.spreadTicks,
          spreadPct: i.spreadPct,
          trades: i.trades,
          turnoverRub: i.turnoverRub,
          tickValueRub: i.tickValueRub,
          spreadTradingScore: i.spreadTradingScore,
        })),
        fundsInFiltered: funds.map((i) => i.ticker),
        ultraTightInTop5: ultraTight.map((i) => i.ticker),
        checkTickers: ["WUSH", "RAGR", "RUSG", "SBER", "GAZP", "CHMF"].map(check),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
