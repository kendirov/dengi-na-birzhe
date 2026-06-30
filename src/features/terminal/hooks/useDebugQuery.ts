"use client";

import { useSearchParams } from "next/navigation";

/** Dev-only query flags — never shown in production UI without ?debug=1 */
export function useDebugQuery() {
  const params = useSearchParams();
  const debug = params.get("debug") === "1";
  const reference = debug && params.get("reference") === "1";
  /** Playwright capture: scale=1, no overlay, no debug chrome in screenshot */
  const capture = params.get("capture") === "1";
  const clusterDebug = debug && params.get("clusterDebug") === "1";
  const bookDebug = debug && params.get("bookDebug") === "1";
  return { debug, reference, capture, clusterDebug, bookDebug };
}
