"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/format";

interface Exercise {
  id: string;
  label: string;
  hint?: string;
}

interface ExerciseChecklistProps {
  exercises: Exercise[];
  title?: string;
}

export function ExerciseChecklist({
  exercises,
  title = "Первые упражнения",
}: ExerciseChecklistProps) {
  const [done, setDone] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = Math.round((done.size / exercises.length) * 100);

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-terminal-text">{title}</h3>
        <span className="font-mono text-sm text-cyan">{progress}%</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-terminal-border">
        <div
          className="h-full rounded-full bg-cyan transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ul className="space-y-2">
        {exercises.map((ex) => {
          const checked = done.has(ex.id);
          return (
            <li key={ex.id}>
              <button
                type="button"
                onClick={() => toggle(ex.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all",
                  checked
                    ? "border-green/30 bg-green/5"
                    : "border-terminal-border hover:border-cyan/20",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border font-mono text-xs",
                    checked
                      ? "border-green bg-green/20 text-green"
                      : "border-terminal-muted text-terminal-muted",
                  )}
                >
                  {checked ? "✓" : ""}
                </span>
                <div>
                  <p
                    className={cn(
                      "text-sm",
                      checked ? "text-green line-through opacity-80" : "text-terminal-text",
                    )}
                  >
                    {ex.label}
                  </p>
                  {ex.hint && (
                    <p className="mt-1 text-xs text-terminal-muted">{ex.hint}</p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
