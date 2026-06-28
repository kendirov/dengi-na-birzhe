import { cn } from "@/lib/utils/format";

interface GlowPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "green" | "violet" | "none";
  hover?: boolean;
}

const glowStyles = {
  cyan: "border-cyan/15 glow-cyan",
  green: "border-green/15 glow-green",
  violet: "border-violet/15",
  none: "border-terminal-border",
};

export function GlowPanel({
  children,
  className,
  glow = "none",
  hover = false,
}: GlowPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-terminal-card backdrop-blur-sm",
        glowStyles[glow],
        hover && "card-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}
