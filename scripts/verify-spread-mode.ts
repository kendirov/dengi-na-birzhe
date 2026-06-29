import { getMarketInstruments } from "@/lib/data/provider";
import {
  filterInstruments,
  getTopInstruments,
} from "@/lib/screener/filter-modes";
import { isFundLikeInstrument } from "@/lib/screener/order-book";

async function main() {
  const result = await getMarketInstruments({
    mode: (process.env.MARKET_DATA_MODE as "live" | "mock" | "fallback") ?? "mock",
  });
  const instruments = result.rows;
  const top = getTopInstruments(instruments, "spread", 3);
  const filtered = filterInstruments(instruments, "spread", "", []);
  const fundsInTop = top.filter((i) => isFundLikeInstrument(i));
  const fundsInFiltered = filtered.filter((i) => isFundLikeInstrument(i));

  const check = (ticker: string) => {
    const inst = instruments.find((i) => i.ticker === ticker);
    if (!inst) return { ticker, found: false };
    return {
      ticker,
      spreadTradable: inst.spreadTradable,
      spreadTicks: inst.spreadTicks,
      trades: inst.trades,
      turnoverRub: inst.turnoverRub,
      spreadTradingScore: inst.spreadTradingScore,
      inSpreadMode: filtered.some((f) => f.ticker === ticker),
    };
  };

  console.log(
    JSON.stringify(
      {
        source: result.status.source,
        rowsCount: instruments.length,
        spreadCandidates: filtered.length,
        top3: top.map((i) => ({
          ticker: i.ticker,
          name: i.name,
          spreadTicks: i.spreadTicks,
          spreadRub: i.spreadRub,
          trades: i.trades,
          turnoverRub: i.turnoverRub,
          tickValueRub: i.tickValueRub,
          spreadTradingScore: i.spreadTradingScore,
        })),
        fundsInTop: fundsInTop.map((i) => i.ticker),
        fundsInFiltered: fundsInFiltered.map((i) => i.ticker),
        checkTickers: ["WUSH", "RAGR", "RUSG", "CHMF", "SBER", "GAZP"].map(check),
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
