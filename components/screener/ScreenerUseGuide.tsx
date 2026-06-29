"use client";

function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-terminal-border/60 bg-[#080E18] text-terminal-muted">
      {children}
    </div>
  );
}

const STEPS = [
  {
    n: 1,
    title: "Выбери задачу",
    text: "Техничные для графика или «Для стакана» для bid/ask.",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <rect x="2" y="3" width="5" height="4" rx="0.5" fill="rgba(34,211,238,0.25)" stroke="rgba(34,211,238,0.6)" strokeWidth="0.6" />
        <rect x="9" y="3" width="5" height="4" rx="0.5" fill="none" stroke="rgba(100,116,139,0.5)" strokeWidth="0.6" />
        <rect x="2" y="9" width="5" height="4" rx="0.5" fill="none" stroke="rgba(100,116,139,0.5)" strokeWidth="0.6" />
        <rect x="9" y="9" width="5" height="4" rx="0.5" fill="none" stroke="rgba(100,116,139,0.5)" strokeWidth="0.6" />
      </svg>
    ),
  },
  {
    n: 2,
    title: "Получи подборку",
    text: "Таблица и «Лучшие в режиме» — список для проверки, не сигнал.",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <rect x="2" y="3" width="12" height="2" rx="0.5" fill="rgba(34,211,238,0.35)" />
        <rect x="2" y="7" width="12" height="2" rx="0.5" fill="rgba(100,116,139,0.25)" />
        <rect x="2" y="11" width="12" height="2" rx="0.5" fill="rgba(100,116,139,0.15)" />
      </svg>
    ),
  },
  {
    n: 3,
    title: "Проверь цену ошибки",
    text: "Цена лота, шаг/лот, спред в пунктах, комиссия.",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <text x="3" y="11" fill="rgba(251,191,36,0.9)" fontSize="9" fontFamily="monospace">
          ₽
        </text>
        <path d="M10 4 L13 8 L10 12" fill="none" stroke="rgba(248,113,113,0.7)" strokeWidth="0.8" />
      </svg>
    ),
  },
  {
    n: 4,
    title: "Открой привод",
    text: "Оборот, сделки, bid/ask, плотности. Скринер не заменяет стакан.",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <rect x="2" y="4" width="5" height="8" rx="0.5" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.55)" strokeWidth="0.6" />
        <rect x="9" y="4" width="5" height="8" rx="0.5" fill="rgba(248,113,113,0.15)" stroke="rgba(248,113,113,0.55)" strokeWidth="0.6" />
      </svg>
    ),
  },
  {
    n: 5,
    title: "Ищи вход",
    text: "Только после проверки условий — лимитка, стоп, выход.",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <circle cx="8" cy="8" r="5" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="0.8" />
        <path d="M8 5 L8 11 M5 8 L11 8" stroke="rgba(34,211,238,0.7)" strokeWidth="0.8" />
      </svg>
    ),
  },
] as const;

export function ScreenerUseGuide() {
  return (
    <section className="rounded-lg border border-terminal-border/60 bg-[#060A12] px-3 py-3 md:px-4">
      <p className="text-[11px] leading-relaxed text-terminal-muted">
        Скринер не даёт сигнал. Он отбирает инструменты, где вообще есть смысл
        искать сделку.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="flex gap-2.5 rounded border border-terminal-border/50 bg-[#080E18]/80 px-2.5 py-2"
          >
            <StepIcon>{step.icon}</StepIcon>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-terminal-text/90">
                <span className="mr-1 font-mono text-cyan/70">{step.n}.</span>
                {step.title}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-terminal-muted">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
