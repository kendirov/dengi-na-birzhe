interface DataBadgeProps {
  label: string;
  value: string | number;
  tone?: "cyan" | "green" | "red" | "amber" | "violet" | "muted";
  className?: string;
}

const toneStyles = {
  cyan: "border-cyan/30 bg-cyan/5 text-cyan",
  green: "border-green/30 bg-green/5 text-green",
  red: "border-red/30 bg-red/5 text-red",
  amber: "border-amber/30 bg-amber/5 text-amber",
  violet: "border-violet/30 bg-violet/5 text-violet",
  muted: "border-terminal-border bg-terminal-surface text-terminal-muted",
};

export function DataBadge({
  label,
  value,
  tone = "cyan",
  className,
}: DataBadgeProps) {
  return (
    <div
      className={`inline-flex flex-col gap-0.5 rounded border px-3 py-2 ${toneStyles[tone]} ${className ?? ""}`}
    >
      <span className="text-[10px] uppercase tracking-wider opacity-70">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}
