import Link from "next/link";
import { cn } from "@/lib/utils/format";

type CTAButtonVariant = "primary" | "secondary" | "ghost";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: CTAButtonVariant;
  className?: string;
  external?: boolean;
}

const variantStyles: Record<CTAButtonVariant, string> = {
  primary:
    "border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/15 hover:border-cyan/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]",
  secondary:
    "border-terminal-border bg-terminal-card text-terminal-text hover:border-cyan/30 hover:text-cyan hover:shadow-[0_0_16px_rgba(34,211,238,0.06)]",
  ghost:
    "border-transparent bg-transparent text-terminal-muted hover:text-cyan hover:bg-cyan/5",
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
  external,
}: CTAButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-all duration-300",
    variantStyles[variant],
    className,
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
