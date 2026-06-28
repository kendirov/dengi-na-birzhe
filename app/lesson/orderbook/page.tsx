import { LessonShell } from "@/components/lesson/LessonShell";
import { LessonSection } from "@/components/lesson/LessonSection";
import {
  InteractiveOrderBook,
  OrderBookLegend,
} from "@/components/lesson/InteractiveOrderBook";
import { TapeSimulator, ClusterPreview } from "@/components/lesson/TapeSimulator";
import { HotkeyGrid } from "@/components/lesson/HotkeyCard";
import { StepTimeline } from "@/components/lesson/StepTimeline";

const orderbookSteps = [
  {
    id: "ob1",
    title: "Заявки на покупку",
    description: "Bid-сторона стакана — кто готов купить и по какой цене. Очередь по времени и цене.",
  },
  {
    id: "ob2",
    title: "Заявки на продажу",
    description: "Ask-сторона — кто продаёт. Лучший ask — минимальная цена продажи.",
  },
  {
    id: "ob3",
    title: "Цена и количество",
    description: "Каждый уровень: цена + объём в лотах/штуках. Глубина показывает ликвидность.",
  },
  {
    id: "ob4",
    title: "Анонимность",
    description: "Заявки анонимны — видите объём, не контрагента. Приоритет: цена, затем время.",
  },
  {
    id: "ob5",
    title: "Очередь",
    description: "При одной цене исполняют раньше поставленные заявки — важно для лимиток.",
  },
];

const tapeSteps = [
  {
    id: "t1",
    title: "Все сделки",
    description: "Лента показывает каждый принт: время, цена, объём.",
  },
  {
    id: "t2",
    title: "Рыночные покупки",
    description: "Удар в ask — агрессивный покупатель, часто зелёный цвет в терминале.",
  },
  {
    id: "t3",
    title: "Рыночные продажи",
    description: "Удар в bid — агрессивный продавец.",
  },
  {
    id: "t4",
    title: "Крупные сделки",
    description: "Принты больше big lot — след крупного игрока или алгоритма.",
  },
];

const hotkeys = [
  { keys: "ЛКМ", action: "Покупка", description: "Клик по стакану / кнопке buy", tone: "green" as const },
  { keys: "ПКМ", action: "Продажа", description: "Клик по стакану / кнопке sell", tone: "red" as const },
  { keys: "Space", action: "Снять лимитки", description: "Отмена всех активных заявок", tone: "amber" as const },
  { keys: "C", action: "Центровка стакана", description: "Цена по центру, симметричная глубина", tone: "cyan" as const },
  { keys: "F12", action: "Закрыть по рынку", description: "Flatten — выход из позиции", tone: "red" as const },
  { keys: "SL", action: "Стоп-лосс", description: "Заранее заданный уровень потерь", tone: "amber" as const },
];

export default function OrderbookLessonPage() {
  return (
    <LessonShell
      badge="LESSON 02"
      title="Стакан, лента, кластеры"
      subtitle="Bid / Ask, спред, заявки, лента сделок — интерактивный учебный терминал"
      lessonIndex={2}
      nav={{
        prev: { href: "/lesson/setup", label: "Первое занятие" },
        next: { href: "/lesson/density", label: "Плотности" },
      }}
    >
      <LessonSection
        number={1}
        title="Bid / Ask / Spread"
        subtitle="Три понятия, без которых нельзя торговать внутри дня"
      >
        <OrderBookLegend />
        <div className="mt-6">
          <InteractiveOrderBook />
        </div>
      </LessonSection>

      <LessonSection
        number={2}
        title="Биржевой стакан"
        subtitle="Как читать глубину и очередь"
      >
        <StepTimeline steps={orderbookSteps} />
        <div className="mt-6">
          <InteractiveOrderBook />
        </div>
      </LessonSection>

      <LessonSection
        number={3}
        title="Лента сделок"
        subtitle="Time & Sales — пульс рынка"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <TapeSimulator />
          <StepTimeline steps={tapeSteps} />
        </div>
      </LessonSection>

      <LessonSection
        number={4}
        title="Кластера"
        subtitle="Объёмы по цене и связь с графиком"
      >
        <ClusterPreview />
      </LessonSection>

      <LessonSection
        number={5}
        title="Мышь и горячие клавиши"
        subtitle="Скорость исполнения = меньше ошибок"
      >
        <HotkeyGrid items={hotkeys} />
      </LessonSection>
    </LessonShell>
  );
}
