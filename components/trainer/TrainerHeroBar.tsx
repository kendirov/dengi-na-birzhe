import { cn } from "@/lib/utils/format";

export interface HeroChipData {
  label: string;
  value: string;
  tone?: "neutral" | "red" | "green" | "cyan" | "accent";
  highlight?: boolean;
  className?: string;
}

export function TrainerHeroBar({ chips }: { chips: HeroChipData[] }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
      {chips.map((chip) => (
        <HeroChip key={chip.label} {...chip} />
      ))}
    </div>
  );
}

function HeroChip({
  label,
  value,
  tone = "neutral",
  highlight,
  className,
}: HeroChipData) {
  const valueColor = {
    neutral: "text-terminal-text",
    red: "text-red",
    green: "text-green",
    cyan: "text-cyan",
    accent: "text-green data-glow-green",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-lg border bg-terminal-bg/60 px-2.5 py-2",
        highlight ? "border-green/30 glow-green" : "border-terminal-border/70",
        className,
      )}
    >
      <p className="text-[9px] uppercase tracking-wider text-terminal-muted">
        {label}
      </p>
      <p className={cn("mt-0.5 font-mono text-base font-bold tabular-nums", valueColor)}>
        {value}
      </p>
    </div>
  );
}

export function TrainerInsightBanner({
  text,
  trailing,
}: {
  text: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-green/25 bg-green/[0.06] px-3 py-2">
      <span className="hidden h-8 w-0.5 shrink-0 rounded bg-green/60 sm:block" />
      <p className="text-sm font-medium leading-snug text-green/95">{text}</p>
      {trailing ? (
        <span className="ml-auto hidden font-mono text-[10px] text-terminal-muted xl:inline">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}
