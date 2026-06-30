"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_LESSON_ID,
  parseLessonParam,
  parseModeParam,
} from "../data/lessons";
import { useTerminalStore } from "../state/terminalStore";

const PRESERVED_PARAMS = ["debug", "reference"] as const;

function preserveDevParams(params: URLSearchParams, source: URLSearchParams) {
  for (const key of PRESERVED_PARAMS) {
    const v = source.get(key);
    if (v != null) params.set(key, v);
  }
}

export function LessonUrlSync() {
  const { state, dispatch } = useTerminalStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const referenceMode =
    searchParams.get("debug") === "1" && searchParams.get("reference") === "1";

  useEffect(() => {
    const mode = parseModeParam(searchParams.get("mode"));
    const lesson = parseLessonParam(searchParams.get("lesson"));
    const stepRaw = searchParams.get("step");
    const step = stepRaw != null ? Number(stepRaw) : NaN;

    if (mode) dispatch({ type: "SET_MODE", mode });
    if (lesson) dispatch({ type: "SET_LESSON", lessonId: lesson });
    else if (mode && mode !== "terminal") {
      dispatch({ type: "SET_LESSON", lessonId: DEFAULT_LESSON_ID });
    }
    if (Number.isFinite(step) && step >= 0) {
      dispatch({ type: "LESSON_GOTO", index: step });
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    if (referenceMode) return;

    const params = new URLSearchParams();
    preserveDevParams(params, searchParams);

    if (state.mode !== "terminal") params.set("mode", state.mode);
    if (state.lessonId) params.set("lesson", state.lessonId);
    if (state.lessonStepIndex > 0) params.set("step", String(state.lessonStepIndex));

    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    const current = searchParams.toString();
    const currentPath = current ? `${pathname}?${current}` : pathname;
    if (next !== currentPath) {
      router.replace(next, { scroll: false });
    }
  }, [
    state.mode,
    state.lessonId,
    state.lessonStepIndex,
    pathname,
    router,
    searchParams,
    referenceMode,
  ]);

  return null;
}
