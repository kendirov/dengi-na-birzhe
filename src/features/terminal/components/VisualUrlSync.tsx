"use client";

import { useEffect } from "react";
import { useDebugQuery } from "../hooks/useDebugQuery";
import { useTerminalStore } from "../state/terminalStore";

/** Visual QA: terminal mode + fit viewport при ?debug=1&reference=1; capture=1 → scale 1:1 */
export function VisualUrlSync() {
  const { reference, capture } = useDebugQuery();
  const { dispatch } = useTerminalStore();

  useEffect(() => {
    if (!reference && !capture) return;
    dispatch({ type: "SET_MODE", mode: "terminal" });
    dispatch({ type: "SET_LESSON", lessonId: null });
    if (capture) {
      dispatch({ type: "SET_SCALE", scale: 1 });
      dispatch({ type: "SET_VOLUME_KEY", key: 200 });
    }
  }, [reference, capture, dispatch]);

  return null;
}
