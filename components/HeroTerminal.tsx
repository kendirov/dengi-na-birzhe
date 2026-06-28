"use client";

import { motion } from "framer-motion";
import { CTAButton } from "@/components/CTAButton";
import { DataBadge } from "@/components/DataBadge";

export function HeroTerminal() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-terminal-border bg-terminal-surface/40 terminal-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan/5 via-transparent to-transparent" />

      <div className="relative p-8 md:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 flex items-center gap-2 font-mono text-xs text-terminal-muted">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green" />
            <span>TERMINAL // MOEX // TQBR</span>
            <span className="text-terminal-border">|</span>
            <span className="text-cyan">LIVE MOCK</span>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-terminal-text md:text-5xl lg:text-6xl">
            Лаборатория{" "}
            <span className="text-cyan">рынка</span>
          </h1>

          <p className="mb-8 max-w-xl text-lg text-terminal-muted md:text-xl">
            Интерактивный выбор акций для внутридневной торговли
          </p>

          <div className="mb-10 flex flex-wrap gap-3">
            <DataBadge label="Инструментов" value="15" tone="cyan" />
            <DataBadge label="Режимов" value="5" tone="violet" />
            <DataBadge label="Уроков" value="3" tone="amber" />
            <DataBadge label="Backend" value="none" tone="muted" />
          </div>

          <div className="flex flex-wrap gap-4">
            <CTAButton href="/screener">Открыть скринер</CTAButton>
            <CTAButton href="/lesson/setup" variant="secondary">
              Первое занятие: настройка терминала
            </CTAButton>
          </div>
        </motion.div>

        <motion.div
          className="mt-12 hidden font-mono text-xs text-terminal-muted lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <pre className="overflow-x-auto rounded border border-terminal-border bg-terminal-bg/80 p-4">
            {`> screener --mode technical --board TQBR
> filter: spread < 0.05%, turnover > 500M, lotValue < 500K
> result: SBER, GAZP, NVTK ...`}
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
