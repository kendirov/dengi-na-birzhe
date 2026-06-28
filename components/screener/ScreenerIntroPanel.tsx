import { MarketStateMap } from "@/components/screener/MarketStateMap";

export function ScreenerIntroPanel() {
  return (
    <section className="rounded-lg border border-terminal-border/70 bg-terminal-surface/40 px-4 py-4 md:px-5">
      <h1 className="text-lg font-semibold tracking-tight md:text-xl">
        Отбор инструментов для сделки
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-terminal-muted">
        Сначала выбираем инструмент, потом ищем вход. Разные акции дают разные
        условия: где-то работает график, где-то стакан и спред, где-то
        инструмент уже в игре, а где-то движение опасно.
      </p>

      <MarketStateMap />
    </section>
  );
}
