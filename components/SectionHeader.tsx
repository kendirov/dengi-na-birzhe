interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {badge && (
        <span className="mb-3 inline-block rounded border border-cyan/30 bg-cyan/5 px-3 py-1 font-mono text-xs uppercase tracking-widest text-cyan">
          {badge}
        </span>
      )}
      <h2 className="text-2xl font-semibold tracking-tight text-terminal-text md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-terminal-muted md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
