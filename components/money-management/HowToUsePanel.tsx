import { HOW_TO_USE_STEPS } from "@/lib/money-management/scenarios";

export function HowToUsePanel() {
  return (
    <div className="rounded-xl border border-terminal-border/70 bg-terminal-card/30 px-3 py-2.5">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-terminal-muted">
        Как использовать
      </p>
      <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-5">
        {HOW_TO_USE_STEPS.map((step, i) => (
          <li
            key={step}
            className="flex items-start gap-2 text-[11px] leading-snug text-terminal-text"
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-mono text-[9px] font-bold text-cyan">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
