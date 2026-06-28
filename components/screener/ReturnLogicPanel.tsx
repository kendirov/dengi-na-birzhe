import { cn } from "@/lib/utils/format";

export function ReturnLogicPanel() {
  return (
    <section className="rounded-lg border border-terminal-border/60 bg-[#060A12] px-4 py-3 md:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl shrink-0">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-terminal-muted">
            Возврат и невозврат
          </h2>
          <p className="mt-1.5 text-[11px] leading-relaxed text-terminal-muted">
            В спокойном рынке цена часто возвращается. В активном инструменте с
            объёмом уровень может стать точкой невозврата.
          </p>
          <p className="mt-2 text-[10px] italic text-terminal-muted/80">
            Это не сигнал. Это фильтр сценария: какую сделку вообще имеет смысл
            искать.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
          <MiniScenario
            title="Возврат"
            tone="red"
            ariaLabel="Сценарий возврата после выноса"
          >
            <line
              x1="12"
              y1="32"
              x2="108"
              y2="32"
              stroke="rgba(251, 191, 36, 0.55)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <text x="12" y="12" fill="rgba(100, 116, 139, 0.8)" fontSize={7}>
              уровень
            </text>
            <path
              d="M16 44 L36 28 L52 22 L58 32 L48 38 L32 36 L20 40"
              fill="none"
              stroke="rgba(248, 113, 113, 0.75)"
              strokeWidth={1.2}
              strokeDasharray="3 2"
            />
            <text x="16" y="58" fill="rgba(248, 113, 113, 0.85)" fontSize={7}>
              вынос → возврат
            </text>
          </MiniScenario>

          <MiniScenario
            title="Невозврат"
            tone="green"
            ariaLabel="Сценарий невозврата после пробоя"
          >
            <line
              x1="12"
              y1="32"
              x2="108"
              y2="32"
              stroke="rgba(251, 191, 36, 0.55)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <text x="12" y="12" fill="rgba(100, 116, 139, 0.8)" fontSize={7}>
              уровень
            </text>
            <path
              d="M16 44 L32 30 L48 24 L64 20 L88 14"
              fill="none"
              stroke="rgba(52, 211, 153, 0.85)"
              strokeWidth={1.2}
            />
            <circle cx="48" cy="24" r="2" fill="rgba(52, 211, 153, 0.5)" />
            <text x="16" y="58" fill="rgba(52, 211, 153, 0.85)" fontSize={7}>
              пробой → удержание
            </text>
          </MiniScenario>
        </div>
      </div>
    </section>
  );
}

function MiniScenario({
  title,
  tone,
  ariaLabel,
  children,
}: {
  title: string;
  tone: "red" | "green";
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const border =
    tone === "red" ? "border-red/20 bg-red/[0.04]" : "border-green/20 bg-green/[0.04]";
  const titleColor = tone === "red" ? "text-red/90" : "text-green/90";

  return (
    <div className={cn("rounded border px-3 py-2", border)}>
      <p className={cn("mb-1.5 text-[9px] font-semibold uppercase tracking-wider", titleColor)}>
        {title}
      </p>
      <svg
        viewBox="0 0 120 64"
        className="h-14 w-full min-w-[120px] max-w-[160px]"
        aria-label={ariaLabel}
      >
        {children}
      </svg>
    </div>
  );
}
