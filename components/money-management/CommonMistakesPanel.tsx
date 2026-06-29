import { COMMON_MISTAKES } from "@/lib/money-management/scenarios";

export function CommonMistakesPanel() {
  return (
    <div className="rounded-lg border border-amber/15 bg-amber/[0.03] px-3 py-2">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber/90">
        Частые ошибки
      </p>
      <ul className="grid gap-0.5 sm:grid-cols-2">
        {COMMON_MISTAKES.map((item) => (
          <li
            key={item}
            className="flex items-start gap-1.5 text-[11px] leading-snug text-terminal-muted"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber/70" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
