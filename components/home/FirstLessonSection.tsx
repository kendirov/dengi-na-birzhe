import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { GlowPanel } from "@/components/GlowPanel";
import { FadeInSection } from "@/components/ui/FadeInSection";
import { FadeIn } from "@/components/ui/FadeInSection";

const lessons = [
  {
    step: "01",
    title: "Подключение проп-счёта",
    href: "/lesson/setup",
  },
  {
    step: "02",
    title: "Установка терминала",
    href: "/lesson/setup",
  },
  {
    step: "03",
    title: "Настройка рабочего места",
    href: "/lesson/setup",
  },
  {
    step: "04",
    title: "Стакан / лента / кластеры",
    href: "/lesson/orderbook",
  },
  {
    step: "05",
    title: "Первые упражнения",
    href: "/lesson/setup",
  },
  {
    step: "06",
    title: "Риск и торговый план",
    href: "/lesson/density",
  },
];

export function FirstLessonSection() {
  return (
    <FadeInSection>
      <SectionHeader
        badge="LESSON PATH"
        title="Первое занятие"
        subtitle="От нуля до первого осмысленного экрана в терминале — по шагам"
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((item, i) => (
          <FadeIn key={item.step} delay={i * 0.06}>
            <Link href={item.href}>
              <GlowPanel
                className="group flex items-start gap-4 p-5 transition-all hover:border-cyan/25"
                hover
              >
                <span className="font-mono text-2xl font-bold text-cyan/40 transition-colors group-hover:text-cyan">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-medium text-terminal-text transition-colors group-hover:text-cyan">
                    {item.title}
                  </h3>
                  <span className="mt-1 inline-block text-xs text-terminal-muted opacity-0 transition-opacity group-hover:opacity-100">
                    Открыть →
                  </span>
                </div>
              </GlowPanel>
            </Link>
          </FadeIn>
        ))}
      </div>
    </FadeInSection>
  );
}
