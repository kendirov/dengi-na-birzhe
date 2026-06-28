import { GlowPanel } from "@/components/GlowPanel";
import { FadeInSection } from "@/components/ui/FadeInSection";

interface LessonSectionProps {
  number: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  id?: string;
}

export function LessonSection({
  number,
  title,
  subtitle,
  children,
  id,
}: LessonSectionProps) {
  return (
    <FadeInSection id={id}>
      <section className="scroll-mt-24">
        <div className="mb-5 flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 font-mono text-sm font-bold text-cyan">
            {String(number).padStart(2, "0")}
          </span>
          <div>
            <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-terminal-muted">{subtitle}</p>
            )}
          </div>
        </div>
        <GlowPanel className="p-4 md:p-6" hover={false}>
          {children}
        </GlowPanel>
      </section>
    </FadeInSection>
  );
}
