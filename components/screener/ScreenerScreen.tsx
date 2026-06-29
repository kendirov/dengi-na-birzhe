import { AppShell } from "@/components/AppShell";
import { ScreenerClient } from "@/components/ScreenerClient";
import { ScreenerErrorBoundary } from "@/components/ScreenerErrorBoundary";
import { getMarketInstruments } from "@/lib/data/provider";
import { getMarketDataConfig } from "@/lib/data/config";

/** Shared screener screen for "/" and "/screener" */
export async function ScreenerScreen() {
  const config = getMarketDataConfig();
  const result = await getMarketInstruments();

  return (
    <AppShell fullWidth>
      <div className="mx-auto max-w-[1800px] px-4 py-3 lg:px-6 lg:py-4">
        <ScreenerErrorBoundary>
          <ScreenerClient
            instruments={result.rows}
            status={result.status}
            diagnostics={result.diagnostics}
            dataMode={config.mode}
            moexBaseUrl={config.moexBaseUrl}
            moexTimeoutMs={config.moexTimeoutMs}
          />
        </ScreenerErrorBoundary>
      </div>
    </AppShell>
  );
}
