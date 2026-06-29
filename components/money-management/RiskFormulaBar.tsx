import { formatPoints, formatRub } from "@/lib/money-management/format";
import { cn } from "@/lib/utils/format";

interface RiskFormulaBarProps {
  stopPoints: number;
  slipPoints: number;
  entryCommissionPoints: number;
  exitCommissionPoints: number;
  fullRiskPoints: number;
  riskPerLotRub: number;
  riskPerTradeRub: number;
  baseVolume: number;
}

export function RiskFormulaBar({
  stopPoints,
  slipPoints,
  entryCommissionPoints,
  exitCommissionPoints,
  fullRiskPoints,
  riskPerLotRub,
  riskPerTradeRub,
  baseVolume,
}: RiskFormulaBarProps) {
  const parts = [
    { label: "Стоп", points: stopPoints, tone: "red" as const },
    { label: "Slip", points: slipPoints, tone: "amber" as const },
    { label: "Ком. вх.", points: entryCommissionPoints, tone: "commission" as const },
    { label: "Ком. вых.", points: exitCommissionPoints, tone: "commission" as const },
  ];

  const toneClass = {
    red: "border-red/30 bg-red/5 text-red",
    amber: "border-amber/30 bg-amber/5 text-amber",
    commission: "border-amber/25 bg-amber/[0.04] text-amber/90",
  };

  return (
    <div className="rounded-lg border border-terminal-border/60 bg-terminal-card/40 px-3 py-2">
      <p className="mb-1.5 text-[10px] uppercase tracking-wider text-terminal-muted">
        Полный риск на 1 лот = Стоп + Slip + Ком. входа + Ком. выхода
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {parts.map((part, i) => (
          <span key={part.label} className="flex items-center gap-1">
            {i > 0 ? (
              <span className="font-mono text-xs text-terminal-muted">+</span>
            ) : null}
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 font-mono text-[10px]",
                toneClass[part.tone],
              )}
            >
              {part.label} {formatPoints(part.points)}
            </span>
          </span>
        ))}
        <span className="font-mono text-xs text-terminal-muted">=</span>
        <span className="rounded border border-amber/30 bg-amber/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-amber">
          {formatPoints(fullRiskPoints)} · {formatRub(riskPerLotRub)}
        </span>
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-terminal-muted">
        Объём = {formatRub(riskPerTradeRub)} ÷ {formatRub(riskPerLotRub)} →{" "}
        <span className="text-cyan">{baseVolume} лот.</span>
      </p>
    </div>
  );
}
