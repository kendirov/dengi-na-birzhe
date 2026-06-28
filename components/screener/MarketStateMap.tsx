const STATES = [
  {
    id: "range",
    title: "Диапазон",
    description:
      "Цена ходит туда-сюда, уровни часто прокалываются, возвраты вероятнее продолжения.",
    approach: "Работа от границ, осторожно с пробоями.",
  },
  {
    id: "impulse",
    title: "Импульс",
    description:
      "Цена быстро проходит расстояние, появляется скорость и расширение диапазона.",
    approach: "Ищем продолжение или откат к уровню.",
  },
  {
    id: "consolidation",
    title: "Консолидация",
    description:
      "Цена сжимается, объём может копиться, рынок ждёт выход из зоны.",
    approach: "Смотреть выход из диапазона и реакцию объёма.",
  },
  {
    id: "volume",
    title: "Повышенный объём",
    description:
      "Растут сделки, оборот и интерес. Инструмент становится заметным.",
    approach: "Следить за лентой, стаканом, high/low.",
  },
  {
    id: "no-return",
    title: "Точка невозврата",
    description:
      "Цена уходит от уровня и не возвращается. Ситуации с потенциалом удержания.",
    approach: "Не ловить случайный тик. Смотреть объём, сделки и удержание зоны.",
  },
] as const;

function StateSparkline({ id }: { id: string }) {
  const stroke = "rgba(34, 211, 238, 0.7)";
  const fill = "rgba(34, 211, 238, 0.08)";

  switch (id) {
    case "range":
      return (
        <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden>
          <path
            d="M4 16 Q16 6 28 16 T52 16 T76 16"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    case "impulse":
      return (
        <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden>
          <path
            d="M4 28 L20 24 L36 8 L52 4 L76 2"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    case "consolidation":
      return (
        <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden>
          <path
            d="M4 8 L40 20 L76 8"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M4 24 L40 12 L76 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      );
    case "volume":
      return (
        <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden>
          {[8, 16, 24, 32, 40, 48, 56, 64, 72].map((x, i) => (
            <rect
              key={x}
              x={x}
              y={32 - (8 + i * 2.5)}
              width="5"
              height={8 + i * 2.5}
              fill={fill}
              stroke={stroke}
              strokeWidth="0.5"
            />
          ))}
        </svg>
      );
    case "no-return":
      return (
        <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden>
          <line
            x1="4"
            y1="16"
            x2="76"
            y2="16"
            stroke="rgba(251, 191, 36, 0.5)"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <path
            d="M4 20 Q20 18 32 16 L48 10 L76 4"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function MarketStateMap() {
  return (
    <div className="mt-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-terminal-muted">
        Состояние инструмента → подход
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {STATES.map((state) => (
          <div
            key={state.id}
            className="rounded border border-terminal-border/60 bg-terminal-surface/30 px-3 py-2.5"
          >
            <StateSparkline id={state.id} />
            <p className="mt-1.5 text-xs font-semibold text-terminal-text">
              {state.title}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-terminal-muted">
              {state.description}
            </p>
            <p className="mt-1.5 text-[10px] text-cyan/80">
              {state.approach}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
