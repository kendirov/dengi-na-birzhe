import { SectionHeader } from "@/components/SectionHeader";
import { GlowPanel } from "@/components/GlowPanel";
import { FadeInSection } from "@/components/ui/FadeInSection";

const points = [
  {
    title: "Известная ≠ торгуемая",
    text: "Новичок часто берёт SBER или GAZP, не понимая стоимость пункта, комиссию и реальный spread на входе.",
    tone: "text-red",
  },
  {
    title: "Где тренироваться",
    text: "Сайт показывает, где реально можно отрабатывать механику: по лоту, ликвидности и условиям сделки.",
    tone: "text-cyan",
  },
  {
    title: "Качество, не сигнал",
    text: "Мы не продаём «куда зайти». Мы показываем качество инструмента — параметры, которые останутся с вами.",
    tone: "text-green",
  },
];

export function WhyBeginnerSection() {
  return (
    <FadeInSection>
      <GlowPanel className="overflow-hidden p-0" glow="cyan">
        <div className="grid lg:grid-cols-[1fr_1.2fr]">
          <div className="border-b border-terminal-border p-8 lg:border-b-0 lg:border-r">
            <SectionHeader
              badge="FOR BEGINNERS"
              title="Почему это важно новичку"
              subtitle="Большинство теряет не на «неправильном направлении», а на неправильном инструменте"
            />
          </div>
          <div className="space-y-0">
            {points.map((p, i) => (
              <div
                key={p.title}
                className={`border-b border-terminal-border/50 p-6 last:border-0 ${i === 1 ? "bg-cyan/3" : ""}`}
              >
                <h3 className={`mb-2 text-lg font-semibold ${p.tone}`}>
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-terminal-muted">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GlowPanel>
    </FadeInSection>
  );
}
