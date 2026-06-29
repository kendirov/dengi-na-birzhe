import { cn, formatRub } from "@/lib/utils/format";

export function MmFormulaBar({
  parts,
  totalPoints,
  totalRub,
}: {
  parts: { label: string; points: number; tone: "red" | "amber" | "cyan" }[];
  totalPoints: number;
  totalRub: number;
}) {
  const toneClass = {
    red: "border-red/30 bg-red/5 text-red",
    amber: "border-amber/30 bg-amber/5 text-amber",
    cyan: "border-cyan/30 bg-cyan/5 text-cyan",
  };

  const pts = Number.isFinite(totalPoints)
    ? totalPoints.toFixed(1).replace(".", ",")
    : "—";

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-terminal-muted">
        Риск на 1 лот =
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {parts.map((part, i) => (
          <span key={part.label} className="flex items-center gap-1.5">
            {i > 0 ? (
              <span className="font-mono text-sm text-terminal-muted">+</span>
            ) : null}
            <span
              className={cn(
                "rounded border px-2 py-1 font-mono text-[11px]",
                toneClass[part.tone],
              )}
            >
              {part.label}{" "}
              <span className="opacity-90">
                {part.points.toFixed(1).replace(".", ",")} п.
              </span>
            </span>
          </span>
        ))}
        <span className="font-mono text-sm text-terminal-muted">=</span>
        <span className="rounded border border-terminal-border bg-terminal-bg px-2 py-1 font-mono text-[11px] text-terminal-text">
          {pts} п. · {formatRub(totalRub)}
        </span>
      </div>
      <p className="font-mono text-[10px] text-terminal-muted/80">
        объём = риск ÷ риск на лот
      </p>
    </div>
  );
}

export function MmRow({
  label,
  value,
  tone,
  highlight,
}: {
  label: string;
  value: string;
  tone?: "cyan" | "green" | "red" | "amber";
  highlight?: boolean;
}) {
  const color =
    tone === "green"
      ? "text-green"
      : tone === "red"
        ? "text-red"
        : tone === "amber"
          ? "text-amber"
          : tone === "cyan"
            ? "text-cyan"
            : "text-terminal-text";

  return (
    <div className="flex items-baseline justify-between gap-3 font-mono text-xs">
      <span className="text-terminal-muted">{label}</span>
      <span className={cn(color, highlight && "text-sm font-bold")}>{value}</span>
    </div>
  );
}
