import { cn } from "@/lib/utils/format";

export function TrainerMeter({
  pct,
  tone,
}: {
  pct: number;
  tone: "cyan" | "amber" | "red";
}) {
  const color = { cyan: "bg-cyan", amber: "bg-amber", red: "bg-red" }[tone];
  const safe = Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-terminal-border/80">
      <div
        className={cn("h-full rounded-full transition-all duration-300", color)}
        style={{ width: `${safe > 0 ? Math.max(safe, 3) : 0}%` }}
      />
    </div>
  );
}

export function TrainerBarRow({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: "green" | "red";
}) {
  const safe = Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0;
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-[9px]">
        <span className="uppercase tracking-wider text-terminal-muted">{label}</span>
        <span className={tone === "green" ? "text-green" : "text-red"}>{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-terminal-border/60">
        <div
          className={cn("h-full rounded-full", tone === "green" ? "bg-green/70" : "bg-red/70")}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
