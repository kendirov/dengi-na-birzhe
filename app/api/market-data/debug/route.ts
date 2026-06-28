import { NextResponse } from "next/server";
import type { MarketDataMode } from "@/lib/data/types";
import { getMarketInstruments } from "@/lib/data/provider";

const VALID_MODES: MarketDataMode[] = ["mock", "live", "fallback"];

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

  const result = await getMarketInstruments(mode ? { mode } : undefined);

  return NextResponse.json({
    status: result.status,
    diagnostics: result.diagnostics,
    rowsCount: result.rows.length,
    sample: result.rows.slice(0, 3).map((row) => ({
      ticker: row.ticker,
      name: row.name,
      price: row.price,
      turnoverRub: row.turnoverRub,
      trades: row.trades,
      spreadRub: row.spreadRub,
      baselineStatus: row.baselineStatus,
      hasHistoricalBaseline: row.hasHistoricalBaseline,
    })),
  });
}
