"use client";

import { SLIDE_SECTIONS, type SlideZone } from "@/lib/stakan-lenta/slide-content";
import { cn } from "@/lib/utils/format";

interface LessonSlideNotesProps {
  activeZone: SlideZone;
  onZoneChange: (zone: SlideZone) => void;
  onZoneHover: (zone: SlideZone | null) => void;
}

export function LessonSlideNotes({
  activeZone,
  onZoneChange,
  onZoneHover,
}: LessonSlideNotesProps) {
  return (
    <aside className="space-y-3 lg:sticky lg:top-20 lg:max-w-[320px] lg:self-start">
      {SLIDE_SECTIONS.map((section) => {
        const active = activeZone === section.zone;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onZoneChange(section.zone)}
            onMouseEnter={() => onZoneHover(section.zone)}
            onMouseLeave={() => onZoneHover(null)}
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-200",
              active
                ? "border-cyan/40 bg-cyan/[0.06] shadow-[0_0_12px_rgba(34,211,238,0.12)]"
                : "border-terminal-border/50 bg-terminal-card/15 hover:border-cyan/25",
            )}
          >
            <h2 className="text-sm font-semibold text-terminal-text">{section.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-terminal-muted">
              {section.intro}
            </p>
          </button>
        );
      })}
    </aside>
  );
}
