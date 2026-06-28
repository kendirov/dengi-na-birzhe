export function ReturnLogicPanel() {
  return (
    <section className="rounded-lg border border-terminal-border/70 bg-terminal-surface/40 px-4 py-4 md:px-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <div>
          <h3 className="text-sm font-semibold text-terminal-text">Возврат</h3>
          <ul className="mt-2 space-y-1 text-xs text-terminal-muted">
            <li>— спокойный рынок</li>
            <li>— уровень часто прокалывается</li>
            <li>— движение туда-сюда</li>
            <li>— лучше брать ближе к границам</li>
            <li>— опасно покупать пробой без подтверждения</li>
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center px-2">
          <svg
            viewBox="0 0 120 80"
            className="h-20 w-28"
            aria-label="Схема возврата и невозврата"
          >
            <line
              x1="10"
              y1="40"
              x2="110"
              y2="40"
              stroke="rgba(251, 191, 36, 0.5)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text x="10" y="12" fill="rgba(100, 116, 139, 0.8)" fontSize="8">
              A: возврат
            </text>
            <path
              d="M10 50 Q30 35 50 42 Q70 48 90 38"
              fill="none"
              stroke="rgba(34, 211, 238, 0.6)"
              strokeWidth="1.5"
            />
            <text x="10" y="72" fill="rgba(100, 116, 139, 0.8)" fontSize="8">
              B: невозврат
            </text>
            <path
              d="M10 50 L40 42 L70 28 L110 18"
              fill="none"
              stroke="rgba(34, 211, 238, 0.9)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-terminal-text">Невозврат</h3>
          <ul className="mt-2 space-y-1 text-xs text-terminal-muted">
            <li>— инструмент в игре</li>
            <li>— резко выросли объём и сделки</li>
            <li>— цена удерживает уровень</li>
            <li>— движение расширяется</li>
            <li>— можно искать продолжение, если есть подтверждение</li>
          </ul>
        </div>
      </div>

      <p className="mt-4 border-t border-terminal-border/50 pt-3 text-[11px] text-terminal-muted">
        Это не сигнал на сделку. Это способ понять, какой тип инструмента перед
        нами и какую стратегию вообще имеет смысл искать.
      </p>
    </section>
  );
}
