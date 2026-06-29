import { AppShell } from "@/components/AppShell";
import { ScreenerClient } from "@/components/ScreenerClient";
import { ScreenerErrorBoundary } from "@/components/ScreenerErrorBoundary";
import { getMarketInstruments } from "@/lib/data/provider";
import { getMarketDataConfig } from "@/lib/data/config";
import { CONTENT_MAX_WIDTH } from "@/lib/constants/brand";
import {
  fetchLiveInvestCommissionMap,
  serializeLiveInvestMap,
} from "@/lib/server/liveinvest-characteristics";

/** Shared screener screen for "/" and "/screener" */
export async function ScreenerScreen() {
  const config = getMarketDataConfig();
  const [{ map: liveInvestMap }, result] = await Promise.all([
    fetchLiveInvestCommissionMap(),
    getMarketInstruments(),
  ]);

  return (
    <AppShell fullWidth>
      <div
        className="mx-auto px-4 py-2 lg:px-5"
        style={{ maxWidth: CONTENT_MAX_WIDTH }}
      >
        <ScreenerErrorBoundary>
          <ScreenerClient
            instruments={result.rows}
            status={result.status}
            diagnostics={result.diagnostics}
            dataMode={config.mode}
            moexBaseUrl={config.moexBaseUrl}
            moexTimeoutMs={config.moexTimeoutMs}
            liveInvestCommissions={serializeLiveInvestMap(liveInvestMap)}
          />
        </ScreenerErrorBoundary>
      </div>
    </AppShell>
  );
}