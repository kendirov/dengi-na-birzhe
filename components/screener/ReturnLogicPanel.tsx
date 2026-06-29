import { cn } from "@/lib/utils/format";

export function ReturnLogicPanel() {
  return (
    <section className="rounded-lg border border-terminal-border/50 bg-[#060A12] px-4 py-2.5 md:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="max-w-lg text-[11px] leading-relaxed text-terminal-muted">
          В спокойном рынке цена часто возвращается в диапазон. В активном
          инструменте с объёмом уровень может стать{" "}
          <span className="text-terminal-text/90">точкой невозврата</span>.
        </p>

        <div className="flex shrink-0 gap-2 sm:gap-3">
          <MiniScenario title="Возврат" tone="red" ariaLabel="Вынос и возврат внутрь диапазона">
            <line
              x1="10"
              y1="28"
              x2="110"
              y2="28"
              stroke="rgba(251, 191, 36, 0.55)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <path
              d="M14 42 L32 30 L48 22 L54 28 L44 34 L28 32 L16 38 Z"
              fill="none"
              stroke="rgba(248, 113, 113, 0.8)"
              strokeWidth={1.2}
              strokeDasharray="3 2"
            />
            <text x="10" y="14" fill="rgba(100, 116, 139, 0.75)" fontSize={7}>
              уровень
            </text>
            <text x="10" y="56" fill="rgba(248, 113, 113, 0.85)" fontSize={7}>
              вынос → возврат
            </text>
          </MiniScenario>

          <MiniScenario title="Невозврат" tone="green" ariaLabel="Пробой и удержание уровня">
            <line
              x1="10"
              y1="28"
              x2="110"
              y2="28"
              stroke="rgba(251, 191, 36, 0.55)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <path
              d="M14 42 L30 32 L46 24 L62 18 L88 12"
              fill="none"
              stroke="rgba(52, 211, 153, 0.9)"
              strokeWidth={1.3}
            />
            <circle cx="46" cy="24" r="2.5" fill="rgba(52, 211, 153, 0.45)" />
            <text x="10" y="14" fill="rgba(100, 116, 139, 0.75)" fontSize={7}>
              уровень
            </text>
            <text x="10" y="56" fill="rgba(52, 211, 153, 0.85)" fontSize={7}>
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
    <div className={cn("rounded border px-2.5 py-1.5", border)}>
      <p className={cn("mb-1 text-[8px] font-semibold uppercase tracking-wider", titleColor)}>
        {title}
      </p>
      <svg
        viewBox="0 0 120 64"
        className="h-12 w-[120px]"
        aria-label={ariaLabel}
      >
        {children}
      </svg>
    </div>
  );
}
