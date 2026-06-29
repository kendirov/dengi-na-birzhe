"use client";

import { buildSberVerificationReport } from "@/lib/money-management/table-calculate";
import { cn } from "@/lib/utils/format";

interface CalcDebugPanelProps {
  show: boolean;
  onToggle: () => void;
}

export function CalcDebugPanel({ show, onToggle }: CalcDebugPanelProps) {
  const report = buildSberVerificationReport();

  return (
    <div className="rounded-lg border border-terminal-border/60 bg-terminal-card/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="font-mono text-[10px] uppercase tracking-wider text-terminal-muted">
          Debug · проверка SBER
        </span>
        <span className="text-[10px] text-cyan">{show ? "скрыть" : "показать"}</span>
      </button>

      {show ? (
        <div className="space-y-2 border-t border-terminal-border px-3 pb-3 pt-2">
          <div className="grid gap-1 sm:grid-cols-2">
            {Object.entries(report.inputs).map(([key, val]) => (
              <p key={key} className="font-mono text-[10px] text-terminal-muted">
                <span className="text-cyan/80">{key}</span>: {String(val)}
              </p>
            ))}
          </div>
          <ol className="space-y-1">
            {report.steps.map((step) => (
              <li
                key={step}
                className={cn(
                  "rounded border border-terminal-border/50 bg-terminal-bg/40 px-2 py-1 font-mono text-[10px] text-terminal-text/85",
                )}
              >
                {step}
              </li>
            ))}
          </ol>
          <p className="font-mono text-[10px] text-terminal-muted">
            Ожидание ТЗ: {report.expectedBaseVolume} лот. · LI-комиссии могут отличаться на ±1 п.
          </p>
        </div>
      ) : null}
    </div>
  );
}
