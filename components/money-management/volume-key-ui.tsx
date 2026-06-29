"use client";

import { cn } from "@/lib/utils/format";

export type VolumeKeyVariant = "beacon" | "quarter" | "half" | "full" | "double";

const VARIANT_STYLES: Record<
  VolumeKeyVariant,
  { shell: string; size: "sm" | "md" | "lg" }
> = {
  beacon: {
    shell:
      "border-terminal-border/70 bg-terminal-card/60 text-terminal-text hover:border-terminal-border",
    size: "sm",
  },
  quarter: {
    shell: "border-cyan/30 bg-cyan/[0.08] text-cyan hover:border-cyan/45",
    size: "md",
  },
  half: {
    shell: "border-cyan/35 bg-cyan/[0.12] text-cyan hover:border-cyan/50",
    size: "md",
  },
  full: {
    shell:
      "border-green/50 bg-green/[0.14] text-green shadow-[0_0_28px_rgba(52,211,153,0.15)] ring-1 ring-green/25 scale-105 z-10",
    size: "lg",
  },
  double: {
    shell:
      "border-amber/45 bg-amber/[0.08] text-amber hover:border-amber/55",
    size: "md",
  },
};

export function VolumeKeyButton({
  variant,
  lots,
  label,
  hint,
  unavailable,
  compact,
}: {
  variant: VolumeKeyVariant;
  lots: number;
  label: string;
  hint?: string;
  unavailable?: boolean;
  compact?: boolean;
}) {
  const { shell, size } = VARIANT_STYLES[variant];
  const display = unavailable ? "—" : lots;

  const sizeClasses = compact
    ? "min-w-[36px] px-1.5 py-1"
    : {
        sm: "min-w-[56px] px-2 py-2",
        md: "min-w-[68px] px-2.5 py-2.5",
        lg: "min-w-[84px] px-3 py-3",
      }[size];

  const numClasses = compact
    ? "text-sm font-bold"
    : {
        sm: "text-xl font-bold",
        md: "text-2xl font-bold",
        lg: "text-4xl font-bold data-glow-green",
      }[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border text-center transition-all",
        shell,
        sizeClasses,
        unavailable && variant === "full" && "border-amber/50 bg-amber/[0.1] text-amber ring-amber/20",
        unavailable && variant === "double" && "opacity-80",
      )}
      title={hint}
    >
      {!compact && hint ? (
        <span className="mb-0.5 max-w-[72px] text-[8px] leading-tight text-terminal-muted">
          {hint}
        </span>
      ) : null}
      <span className={cn("font-mono tabular-nums", numClasses)}>{display}</span>
      <span
        className={cn(
          "font-mono uppercase tracking-wide text-terminal-muted",
          compact ? "text-[7px]" : "mt-0.5 text-[9px]",
          variant === "full" && !compact && "text-green/80",
        )}
      >
        {label}
      </span>
    </div>
  );
}
