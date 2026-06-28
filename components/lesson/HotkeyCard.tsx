import { GlowPanel } from "@/components/GlowPanel";
import { cn } from "@/lib/utils/format";

interface HotkeyCardProps {
  keys: string;
  action: string;
  description?: string;
  tone?: "cyan" | "green" | "red" | "amber";
}

const toneStyles = {
  cyan: "border-cyan/20 text-cyan",
  green: "border-green/20 text-green",
  red: "border-red/20 text-red",
  amber: "border-amber/20 text-amber",
};

export function HotkeyCard({
  keys,
  action,
  description,
  tone = "cyan",
}: HotkeyCardProps) {
  return (
    <GlowPanel className={cn("p-4 transition-all card-hover", toneStyles[tone])} hover>
      <kbd className="mb-2 inline-block rounded border border-current/30 bg-terminal-bg/80 px-2 py-1 font-mono text-sm font-bold">
        {keys}
      </kbd>
      <p className="text-sm font-semibold text-terminal-text">{action}</p>
      {description && (
        <p className="mt-1 text-xs text-terminal-muted">{description}</p>
      )}
    </GlowPanel>
  );
}

interface HotkeyGridProps {
  items: HotkeyCardProps[];
}

export function HotkeyGrid({ items }: HotkeyGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <HotkeyCard key={item.keys + item.action} {...item} />
      ))}
    </div>
  );
}
