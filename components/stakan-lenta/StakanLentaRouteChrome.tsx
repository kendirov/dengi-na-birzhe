"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const HTML_CLASS = "cscalp-route-fullscreen";

/** Syncs html/body chrome for fullscreen terminal route (default on /stakan-lenta). */
export function StakanLentaRouteChrome() {
  const params = useSearchParams();
  const landing = params.get("landing") === "1";

  useEffect(() => {
    const root = document.documentElement;
    if (landing) {
      root.classList.remove(HTML_CLASS);
      return () => root.classList.remove(HTML_CLASS);
    }

    root.classList.add(HTML_CLASS);
    return () => root.classList.remove(HTML_CLASS);
  }, [landing]);

  return null;
}
