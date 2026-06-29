export function MiniStopDiagram() {
  return (
    <div className="rounded-lg border border-terminal-border/60 bg-terminal-card/40 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-terminal-muted">
        Почему стоп — не весь риск
      </p>

      <div className="relative mx-auto mb-3 h-28 w-full max-w-[200px]">
        <svg viewBox="0 0 200 112" className="h-full w-full" aria-hidden>
          <line x1="100" y1="8" x2="100" y2="96" stroke="currentColor" className="text-terminal-border" strokeWidth="1" />
          <rect x="88" y="18" width="24" height="14" rx="2" className="fill-cyan/20 stroke-cyan/40" strokeWidth="1" />
          <text x="100" y="28" textAnchor="middle" className="fill-cyan text-[8px] font-mono">Вход</text>
          <rect x="88" y="38" width="24" height="18" rx="2" className="fill-red/15 stroke-red/35" strokeWidth="1" />
          <text x="100" y="50" textAnchor="middle" className="fill-red text-[8px] font-mono">Стоп</text>
          <rect x="88" y="58" width="24" height="10" rx="2" className="fill-amber/15 stroke-amber/30" strokeWidth="1" />
          <text x="100" y="66" textAnchor="middle" className="fill-amber text-[7px] font-mono">Slip</text>
          <rect x="76" y="72" width="48" height="10" rx="2" className="fill-amber/10 stroke-amber/25" strokeWidth="1" />
          <text x="100" y="80" textAnchor="middle" className="fill-amber/80 text-[7px] font-mono">Комиссии</text>
          <line x1="60" y1="96" x2="140" y2="96" stroke="currentColor" className="text-green/50" strokeWidth="2" />
          <text x="100" y="108" textAnchor="middle" className="fill-green text-[8px] font-mono">= полный риск</text>
        </svg>
      </div>

      <ul className="space-y-1 text-[11px] leading-snug text-terminal-muted">
        <li>Стоп показывает расстояние до выхода.</li>
        <li>Slip добавляется, если цена исполнилась хуже.</li>
        <li>Комиссии считаются на вход и выход.</li>
      </ul>
    </div>
  );
}
