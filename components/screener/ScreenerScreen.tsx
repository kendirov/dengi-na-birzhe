import { AppShell } from "@/components/AppShell";
import { ScreenerClient } from "@/components/ScreenerClient";
import { getMarketInstruments } from "@/lib/data/provider";

/** Shared screener screen for "/" and "/screener" */
export async function ScreenerScreen() {
  const result = await getMarketInstruments();

  return (
    <AppShell fullWidth>
      <div className="mx-auto max-w-[1800px] px-4 py-5 lg:px-6 lg:py-6">
        <ScreenerClient
          instruments={result.rows}
          status={result.status}
          diagnostics={result.diagnostics}
        />
      </div>
    </AppShell>
  );
}
