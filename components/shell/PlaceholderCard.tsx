import { cn } from "@/lib/utils/format";

interface PlaceholderCardProps {
  title: string;
  text?: string;
  accent?: "cyan" | "amber" | "muted";
  className?: string;
}

const accentBorder = {
  cyan: "border-cyan/20",
  amber: "border-amber/20",
  muted: "border-terminal-border/60",
};

const accentTitle = {
  cyan: "text-cyan/90",
  amber: "text-amber/90",
  muted: "text-terminal-text/90",
};

export function PlaceholderCard({
  title,
  text,
  accent = "muted",
  className,
}: PlaceholderCardProps) {
  return (
    <article
      className={cn(
        "rounded border bg-[#06080c] px-3 py-2.5",
        accentBorder[accent],
        className,
      )}
    >
      <h2 className={cn("text-xs font-semibold", accentTitle[accent])}>
        {title}
      </h2>
      {text ? (
        <p className="mt-0.5 text-[11px] leading-snug text-terminal-text/75">
          {text}
        </p>
      ) : null}
    </article>
  );
}

interface PlaceholderCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function PlaceholderCardGrid({
  children,
  columns = 2,
}: PlaceholderCardGridProps) {
  const colClass =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "md:grid-cols-2";

  return (
    <div className={cn("grid gap-2", colClass)}>{children}</div>
  );
}
