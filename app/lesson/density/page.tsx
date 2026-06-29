import { LessonShell } from "@/components/lesson/LessonShell";
import { LessonSection } from "@/components/lesson/LessonSection";
import { StepTimeline } from "@/components/lesson/StepTimeline";
import {
  DensityScenario,
  DensityCompareCards,
  BounceChecklist,
  ZoneOfInterest,
} from "@/components/lesson/DensityScenario";

const densityIntro = [
  {
    id: "d1",
    title: "Аномальный объём",
    description:
      "Лимитный объём значительно больше соседних уровней и типичного big lot — выделяется в стакане.",
  },
  {
    id: "d2",
    title: "Конкретная цена",
    description: "Плотность на круглом числе или obvious level — 312.00, 310.00, вчерашний high/low.",
  },
  {
    id: "d3",
    title: "Влияние на цену",
    description:
      "Может замедлить движение, дать отскок или стать магнитом перед пробоем — зависит от контекста.",
  },
];

const algorithmSteps = [
  {
    id: "a1",
    title: "Аномальный объём",
    description: "Найти уровень, где объём выбивается из фона.",
  },
  {
    id: "a2",
    title: "Уровень",
    description: "Запомнить цену — круглое число, VWAP, high/low.",
  },
  {
    id: "a3",
    title: "Поведение",
    description: "Снимают или держат при подходе цены?",
  },
  {
    id: "a4",
    title: "Исполнение",
    description: "Есть ли крупные принты в ленте на этом уровне?",
  },
  {
    id: "a5",
    title: "Реакция цены",
    description: "Отскок, пробой или «ничего» — решение по факту.",
  },
];

export default function DensityLessonPage() {
  return (
    <LessonShell
      badge="LESSON 03"
      title="Плотности и айсберги"
      subtitle="Крупные заявки, удержание уровня, скрытый объём и реакция цены."
      lessonIndex={3}
      nav={{
        prev: { href: "/lesson/orderbook", label: "Стакан и лента" },
        next: { href: "/screener", label: "Скринер" },
      }}
    >
      <LessonSection
        number={1}
        title="Что такое крупная плотность"
        subtitle="Не каждый большой объём — торговый сигнал"
      >
        <StepTimeline steps={densityIntro} />
      </LessonSection>

      <LessonSection
        number={2}
        title="Настоящая или ложная заявка"
        subtitle="Сравните признаки — потом проверьте в сценарии"
      >
        <DensityCompareCards />
      </LessonSection>

      <LessonSection
        number={3}
        title="Алгоритм чтения плотности"
        subtitle="Пять шагов перед любым решением"
      >
        <StepTimeline steps={algorithmSteps} />
      </LessonSection>

      <LessonSection
        number={4}
        title="Интерактив: сценарии плотности"
        subtitle="Запустите сценарий — смотрите стакан, ленту и реакцию цены"
      >
        <DensityScenario />
      </LessonSection>

      <LessonSection
        number={5}
        title="Отскок от плотности"
        subtitle="Чеклист условий — не входить на одной плотности"
      >
        <BounceChecklist />
      </LessonSection>

      <LessonSection
        number={6}
        title="Зона интереса"
        subtitle="Где входить и когда выходить"
      >
        <ZoneOfInterest />
      </LessonSection>
    </LessonShell>
  );
}
