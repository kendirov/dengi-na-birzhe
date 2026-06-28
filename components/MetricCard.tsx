interface MetricCardProps {
  title: string;
  value?: string;
  subtitle?: string;
  description?: string;
  tone?: "cyan" | "green" | "red" | "amber" | "violet";
  highlight?: boolean;
  interactive?: boolean;
}

const toneBorder = {
  cyan: "border-cyan/15 hover:border-cyan/30",
  green: "border-green/15 hover:border-green/30",
  red: "border-red/15 hover:border-red/30",
  amber: "border-amber/15 hover:border-amber/30",
  violet: "border-violet/15 hover:border-violet/30",
};

const toneValue = {
  cyan: "text-cyan data-glow-cyan",
  green: "text-green data-glow-green",
  red: "text-red data-glow-red",
  amber: "text-amber",
  violet: "text-violet",
};

const toneDot = {
  cyan: "bg-cyan",
  green: "bg-green",
  red: "bg-red",
  amber: "bg-amber",
  violet: "bg-violet",
};

export function MetricCard({
  title,
  value,
  subtitle,
  description,
  tone = "cyan",
  highlight,
  interactive = true,
}: MetricCardProps) {
  return (
    <div
      className={`group rounded-lg border bg-terminal-card p-5 transition-all duration-300 ${toneBorder[tone]} ${interactive ? "card-hover cursor-default" : ""} ${highlight ? "glow-cyan" : ""}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${toneDot[tone]}`} />
        <p className="text-xs font-medium uppercase tracking-wider text-terminal-muted">
          {title}
        </p>
      </div>
      {value && (
        <p className={`font-mono text-2xl font-bold ${toneValue[tone]}`}>
          {value}
        </p>
      )}
      {subtitle && (
        <p className="mt-1 text-xs text-terminal-muted">{subtitle}</p>
      )}
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-terminal-text/75">
          {description}
        </p>
      )}
    </div>
  );
}
