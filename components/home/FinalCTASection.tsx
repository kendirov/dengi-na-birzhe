import { CTAButton } from "@/components/CTAButton";
import { FadeInSection } from "@/components/ui/FadeInSection";

export function FinalCTASection() {
  return (
    <FadeInSection>
      <section className="relative overflow-hidden rounded-xl border border-cyan/15 bg-terminal-card p-10 text-center md:p-14">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cyan/5 via-transparent to-transparent"
          aria-hidden
        />

        <div className="relative">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-cyan">
            Ready to trade smarter
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Рынок через параметры,{" "}
            <span className="text-cyan">не через слова</span>
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-terminal-muted">
            Откройте скринер и посмотрите, какие инструменты подходят под вашу
            механику — или начните с первого занятия
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <CTAButton href="/screener">Открыть скринер</CTAButton>
            <CTAButton href="/lesson/setup" variant="secondary">
              Начать первое занятие
            </CTAButton>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}
