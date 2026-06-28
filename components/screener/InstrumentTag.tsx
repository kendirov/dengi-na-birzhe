import type { VisualTag } from "@/lib/types/instrument";
import {
  VISUAL_TAG_LABELS,
  VISUAL_TAG_TONE,
} from "@/lib/screener/tags";
import { cn } from "@/lib/utils/format";

const toneClasses = {
  cyan: "border-cyan/25 bg-cyan/8 text-cyan",
  green: "border-green/25 bg-green/8 text-green",
  red: "border-red/25 bg-red/8 text-red",
  amber: "border-amber/25 bg-amber/8 text-amber",
  violet: "border-violet/25 bg-violet/8 text-violet",
  muted: "border-terminal-border bg-terminal-surface text-terminal-muted",
};

interface InstrumentTagProps {
  tag: VisualTag;
  className?: string;
}

export function InstrumentTag({ tag, className }: InstrumentTagProps) {
  const tone = VISUAL_TAG_TONE[tag];
  return (
    <span
      className={cn(
        "inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {VISUAL_TAG_LABELS[tag]}
    </span>
  );
}

interface InstrumentTagListProps {
  tags: VisualTag[];
  limit?: number;
}

export function InstrumentTagList({ tags, limit = 4 }: InstrumentTagListProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, limit).map((tag) => (
        <InstrumentTag key={tag} tag={tag} />
      ))}
    </div>
  );
}
