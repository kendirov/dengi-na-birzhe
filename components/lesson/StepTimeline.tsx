"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/format";

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
}

interface StepTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function StepTimeline({ steps, className }: StepTimelineProps) {
  const [activeId, setActiveId] = useState(steps[0]?.id ?? "");

  const active = steps.find((s) => s.id === activeId) ?? steps[0];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-terminal">
        {steps.map((step, i) => {
          const isActive = step.id === activeId;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveId(step.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all",
                isActive
                  ? "border-cyan/40 bg-cyan/10 text-cyan"
                  : "border-terminal-border text-terminal-muted hover:border-cyan/20",
              )}
            >
              <span className="font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
              <span className="whitespace-nowrap text-xs font-medium">{step.title}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-lg border border-cyan/15 bg-terminal-surface/60 p-5"
        >
          <h3 className="mb-2 font-semibold text-terminal-text">{active.title}</h3>
          <p className="text-sm leading-relaxed text-terminal-muted">{active.description}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
