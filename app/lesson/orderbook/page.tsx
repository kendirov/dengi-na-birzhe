import { LessonShell } from "@/components/lesson/LessonShell";
import { OrderBookSandbox } from "@/components/lesson/OrderBookSandbox";

/**
 * TODO(orderbook-ui): Довести учебный стакан до CScalp-like макета:
 * ASK сверху, BID снизу, лента справа, цена/спред в центре.
 * DriveBasicsPanel (components/screener/DriveBasicsPanel.tsx) — запасной простой
 * вид, только для урока, не для /screener.
 */
export default function OrderbookLessonPage() {
  return (
    <LessonShell
      badge="LESSON 02"
      title="Стакан и лента"
      subtitle="Bid, ask, spread, лента сделок, лимитки и рыночные заявки."
      lessonIndex={2}
      nav={{
        prev: { href: "/lesson/setup", label: "Первое занятие" },
        next: { href: "/lesson/density", label: "Плотности и айсберги" },
      }}
    >
      <OrderBookSandbox />
    </LessonShell>
  );
}
