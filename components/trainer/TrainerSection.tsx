import { cn } from "@/lib/utils/format";

interface TrainerSectionProps {
  step: number;
  title: string;
  children: React.ReactNode;
  id?: string;
  compact?: boolean;
}

/** Нумерованная секция учебного инструмента — workspace, MM, уроки. */
export function TrainerSection({
  step,
  title,
  children,
  id,
  compact,
}: TrainerSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-2">
      <header className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-terminal-border bg-terminal-bg font-mono text-[10px] font-bold text-terminal-muted">
          {String(step).padStart(2, "0")}
        </span>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </header>
      <div
        className={cn(
          "rounded-xl border border-terminal-border bg-terminal-card/80",
          compact ? "p-2.5" : "p-3 md:p-4",
        )}
      >
        {children}
      </div>
    </section>
  );
}
