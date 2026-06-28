import { SectionHeader } from "@/components/SectionHeader";
import { MetricCard } from "@/components/MetricCard";
import { FadeInSection } from "@/components/ui/FadeInSection";
import { FadeIn } from "@/components/ui/FadeInSection";

const criteria = [
  {
    title: "Цена пункта",
    description:
      "Сколько рублей вы зарабатываете или теряете на 1 ₽ движения цены. Определяет размер позиции и риск.",
    tone: "cyan" as const,
  },
  {
    title: "Спред",
    description:
      "Стоимость входа и выхода в рублях и тиках. Узкий — техничные, широкий — спредовые инструменты.",
    tone: "amber" as const,
  },
  {
    title: "Комиссия",
    description:
      "Процент от оборота съедает мелкие движения. Считаем breakeven до входа, а не после убытка.",
    tone: "violet" as const,
  },
  {
    title: "Оборот",
    description:
      "Где реально крутятся деньги. Без оборота — нет импульсов, нет ликвидности для выхода.",
    tone: "green" as const,
  },
  {
    title: "Сделки",
    description:
      "Количество принтов в ленте. Много сделок — живой инструмент, мало — риск застрять.",
    tone: "cyan" as const,
  },
  {
    title: "Волатильность",
    description:
      "Дневной диапазон и амплитуда. Нужна для движения, но слишком высокая — для опытных.",
    tone: "amber" as const,
  },
  {
    title: "Техничность",
    description:
      "Насколько чисто отрабатываются уровни, импульсы и откаты. Скор, а не субъективное «нравится».",
    tone: "green" as const,
  },
  {
    title: "Крупный лот",
    description:
      "Big lot — 1% от среднего оборота. Показывает, какой объём в ленте считается «крупным».",
    tone: "violet" as const,
  },
];

export function SelectionCriteriaSection() {
  return (
    <FadeInSection>
      <SectionHeader
        badge="METHODOLOGY"
        title="Как мы выбираем акции"
        subtitle="Не по названию и не по «советам из чата» — по параметрам, которые видит терминал"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {criteria.map((item, i) => (
          <FadeIn key={item.title} delay={i * 0.05}>
            <MetricCard
              title={item.title}
              description={item.description}
              tone={item.tone}
            />
          </FadeIn>
        ))}
      </div>
    </FadeInSection>
  );
}
