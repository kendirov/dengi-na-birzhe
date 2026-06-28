export function ReturnLogicPanel() {
  return (
    <section className="rounded-lg border border-terminal-border/70 bg-[#080F1A] px-4 py-4 md:px-5">
      <h2 className="text-sm font-semibold text-terminal-text">
        Возврат и невозврат
      </h2>
      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-terminal-muted">
        В спокойном инструменте цена часто возвращается в диапазон. В активном
        инструменте с объёмом и сделками уровень может стать точкой невозврата —
        цена ушла и не вернулась.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <ReturnCard
          title="Возврат"
          tone="cyan"
          items={[
            "Спокойный рынок",
            "Уровень прокололи и вернулись",
            "Объём слабый",
            "Движение без продолжения",
            "Лучше не догонять пробой",
          ]}
        />

        <div className="flex items-center justify-center px-2">
          <svg
            viewBox="0 0 140 90"
            className="h-24 w-36"
            aria-label="Fake breakout и real breakout"
          >
            {/* Level line */}
            <line
              x1="8"
              y1="45"
              x2="132"
              y2="45"
              stroke="rgba(251, 191, 36, 0.55)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text x="8" y="12" fill="rgba(100, 116, 139, 0.85)" fontSize="7">
              уровень
            </text>

            {/* Fake breakout — return */}
            <text x="8" y="82" fill="rgba(34, 211, 238, 0.8)" fontSize="7">
              fake → возврат
            </text>
            <path
              d="M8 55 Q28 42 48 38 Q68 34 72 45 Q76 56 58 52 Q40 48 28 50"
              fill="none"
              stroke="rgba(34, 211, 238, 0.65)"
              strokeWidth="1.5"
            />

            {/* Real breakout — hold */}
            <text x="78" y="82" fill="rgba(52, 211, 153, 0.85)" fontSize="7">
              real → удержание
            </text>
            <path
              d="M78 55 L92 40 L108 32 L132 24"
              fill="none"
              stroke="rgba(52, 211, 153, 0.85)"
              strokeWidth="1.5"
            />
            <circle cx="108" cy="32" r="2" fill="rgba(52, 211, 153, 0.6)" />
          </svg>
        </div>

        <ReturnCard
          title="Невозврат"
          tone="green"
          items={[
            "Инструмент в игре",
            "Объём и сделки выросли",
            "Уровень удержали",
            "Цена не возвращается в диапазон",
            "Появляется потенциал удержания",
          ]}
        />
      </div>
    </section>
  );
}

function ReturnCard({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "cyan" | "green";
  items: string[];
}) {
  const titleClass = tone === "cyan" ? "text-cyan" : "text-green";
  return (
    <div className="rounded border border-terminal-border/50 bg-[#070B12] p-3">
      <h3 className={`text-sm font-semibold ${titleClass}`}>{title}</h3>
      <ul className="mt-2 space-y-1 text-[11px] text-terminal-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-1.5">
            <span className={titleClass}>—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
