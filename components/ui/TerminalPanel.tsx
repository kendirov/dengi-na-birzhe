"use client";

import { cn } from "@/lib/utils/format";

interface TerminalPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  status?: string;
  scanLine?: boolean;
}

export function TerminalPanel({
  children,
  className,
  title = "Учебный терминал",
  status = "Учебные данные",
  scanLine = false,
}: TerminalPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-terminal-border bg-terminal-card terminal-grid",
        className,
      )}
    >
      {scanLine && <div className="scan-line" aria-hidden />}

      <div className="relative border-b border-terminal-border bg-terminal-surface/80 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red/50" />
              <span className="h-2 w-2 rounded-full bg-amber/50" />
              <span className="h-2 w-2 rounded-full bg-green/50" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-terminal-muted">
              {title}
            </span>
          </div>
          <span className="font-mono text-[10px] text-terminal-muted">
            {status}
          </span>
        </div>
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}
