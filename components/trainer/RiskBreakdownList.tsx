import type { MoneyManagementResult } from "@/lib/money-management/types";
import { formatMmLotsDisplay } from "@/lib/money-management/format";
import { formatRub, cn } from "@/lib/utils/format";

interface RiskBreakdownListProps {
  result: MoneyManagementResult;
  slippagePoints: number;
  /** compact — без объёма (если он уже в sidebar) */
  variant?: "full" | "compact";
}

/** Единая разбивка риска — одна формула для summary, sidebar и стакана. */
export function RiskBreakdownList({
  result,
  slippagePoints,
  variant = "compact",
}: RiskBreakdownListProps) {
  const entryComm = result.breakdown.find((p) => p.key === "entryCommission");
  const exitComm = result.breakdown.find((p) => p.key === "exitCommission");

  return (
    <div className="space-y-1.5 rounded-lg border border-terminal-border/70 bg-terminal-bg/50 px-3 py-2.5 font-mono text-xs">
      <Row
        label="Стоп"
        value={`${formatPoints(result.stopDistancePoints)}`}
        sub={formatRub(result.stopLossRubPerLot)}
        tone="red"
      />
      <Row
        label="Slip"
        value={`${slippagePoints} п.`}
        sub={formatRub(result.slippageRubPerLot)}
        tone="amber"
      />
      <Row label="Ком. вход" value={formatRub(entryComm?.rub ?? 0)} tone="cyan" />
      <Row label="Ком. выход" value={formatRub(exitComm?.rub ?? 0)} tone="cyan" />
      <div className="my-1 border-t border-terminal-border/50" />
      <Row
        label="Риск / лот"
        value={formatRub(result.totalRiskPerLotRub)}
        tone="red"
        bold
      />
      {variant === "full" ? (
        <Row
          label="Объём"
          value={formatMmLotsDisplay(result.maxPositionLots)}
          sub={formatRub(result.actualTradeRiskRub)}
          tone="green"
          bold
        />
      ) : null}
    </div>
  );
}

function formatPoints(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(1).replace(".", ",")} п.`;
}

function Row({
  label,
  value,
  sub,
  tone,
  bold,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "red" | "amber" | "cyan" | "green";
  bold?: boolean;
}) {
  const color = {
    red: "text-red",
    amber: "text-amber",
    cyan: "text-cyan",
    green: "text-green",
  }[tone];

  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-terminal-muted">{label}</span>
      <div className={cn("text-right tabular-nums", color, bold && "font-semibold")}>
        <span>{value}</span>
        {sub ? <span className="ml-1.5 text-[10px] opacity-75">{sub}</span> : null}
      </div>
    </div>
  );
}
