import { SectionHeader } from "@/components/SectionHeader";
import { GlowPanel } from "@/components/GlowPanel";
import { FadeInSection } from "@/components/ui/FadeInSection";

export function InstrumentTypesSection() {
  return (
    <FadeInSection>
      <SectionHeader
        badge="INSTRUMENT TYPES"
        title="Два типа инструментов"
        subtitle="Разные механики — разные параметры. Скринер фильтрует по типу, а не по популярности"
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <GlowPanel className="p-6 lg:p-8" glow="cyan" hover>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded border border-cyan/30 bg-cyan/10 px-2 py-0.5 font-mono text-xs text-cyan">
              TECHNICAL
            </span>
          </div>
          <h3 className="mb-4 text-2xl font-semibold text-terminal-text">
            Техничные
          </h3>
          <ul className="space-y-3 text-sm leading-relaxed text-terminal-text/80">
            <li className="flex gap-2">
              <span className="text-cyan">→</span>
              Почти нет спреда — вход и выход дешевле
            </li>
            <li className="flex gap-2">
              <span className="text-cyan">→</span>
              Движение через импульсы и откаты к уровням
            </li>
            <li className="flex gap-2">
              <span className="text-cyan">→</span>
              Важны график, уровни, диапазон дня, поведение индекса
            </li>
          </ul>
          <div className="mt-6 rounded-lg border border-terminal-border bg-terminal-surface/50 p-4">
            <p className="text-xs uppercase tracking-wider text-terminal-muted">
              Пример класса инструмента
            </p>
            <p className="mt-1 font-mono text-sm text-cyan">
              SMLT / «самолётный» тип
            </p>
            <p className="mt-2 text-xs text-terminal-muted">
              Условный пример механики, не торговая рекомендация
            </p>
          </div>
        </GlowPanel>

        <GlowPanel className="p-6 lg:p-8" glow="none" hover>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded border border-amber/30 bg-amber/10 px-2 py-0.5 font-mono text-xs text-amber">
              SPREAD
            </span>
          </div>
          <h3 className="mb-4 text-2xl font-semibold text-terminal-text">
            Спредовые
          </h3>
          <ul className="space-y-3 text-sm leading-relaxed text-terminal-text/80">
            <li className="flex gap-2">
              <span className="text-amber">→</span>
              Широкий спред — bid и ask постоянно «дышат»
            </li>
            <li className="flex gap-2">
              <span className="text-amber">→</span>
              Можно работать между лучшей покупкой и продажей
            </li>
            <li className="flex gap-2">
              <span className="text-amber">→</span>
              Важны шаг, цена пункта, комиссия, плотность стакана
            </li>
          </ul>
          <div className="mt-6 rounded-lg border border-terminal-border bg-terminal-surface/50 p-4">
            <p className="text-xs uppercase tracking-wider text-terminal-muted">
              Пример класса инструмента
            </p>
            <p className="mt-1 font-mono text-sm text-amber">WUSH</p>
            <p className="mt-2 text-xs text-terminal-muted">
              Иллюстрация спредовой механики, не призыв к сделке
            </p>
          </div>
        </GlowPanel>
      </div>
    </FadeInSection>
  );
}
