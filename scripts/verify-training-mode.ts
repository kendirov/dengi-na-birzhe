import { fetchMoexIssFromBrowser } from "@/lib/data/moex-browser";
import { enrichMarketInstruments } from "@/lib/data/enrich";
import {
  buildTrainingSelection,
  filterInstruments,
} from "@/lib/screener/filter-modes";

async function main() {
  const moex = await fetchMoexIssFromBrowser();
  const instruments = enrichMarketInstruments(moex.rows);
  const picks = buildTrainingSelection(instruments);
  const allCount = filterInstruments(instruments, "all", "", []).length;

  const byRole = {
    technical: picks.filter((p) => p.role === "technical"),
    orderbook: picks.filter((p) => p.role === "orderbook"),
    beginner: picks.filter((p) => p.role === "beginner"),
    dangerous: picks.filter((p) => p.role === "dangerous"),
  };

  console.log(
    JSON.stringify(
      {
        source: "moex-browser",
        totalInstruments: instruments.length,
        allModeCount: allCount,
        trainingCount: picks.length,
        byRole: Object.fromEntries(
          Object.entries(byRole).map(([k, v]) => [
            k,
            v.map((p) => ({
              ticker: p.instrument.ticker,
              roleLabel: p.roleLabel,
              verdict: p.verdictLabel,
            })),
          ]),
        ),
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
