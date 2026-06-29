import { AppShell } from "@/components/AppShell";
import { InstrumentCycleScene } from "@/components/screener/InstrumentCycleScene";
import { ReturnLogicPanel } from "@/components/screener/ReturnLogicPanel";

export default function InstrumentCycleLabPage() {
  return (
    <AppShell fullWidth>
      <div className="mx-auto max-w-[1800px] space-y-4 px-4 py-5 lg:px-6 lg:py-6">
        <header>
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            Лаборатория: фазы инструмента
          </h1>
          <p className="mt-1.5 text-sm text-terminal-muted">
            Экспериментальный учебный блок. Не основной скринер.
          </p>
        </header>

        <section className="rounded-lg border border-terminal-border/70 bg-[#05070D] px-4 py-4 md:px-5">
          <InstrumentCycleScene />
        </section>

        <ReturnLogicPanel />
      </div>
    </AppShell>
  );
}
