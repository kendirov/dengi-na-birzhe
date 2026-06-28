"use client";

import { motion } from "framer-motion";
import { CTAButton } from "@/components/CTAButton";

export function HomeHeroSection() {
  return (
    <section className="relative">
      <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-cyan/5 blur-3xl" aria-hidden />
      <div className="absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-violet/5 blur-3xl" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-3xl"
      >
        <div className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-terminal-muted">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
          <span>MOEX · TQBR · Market Lab</span>
        </div>

        <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
          Лаборатория{" "}
          <span className="text-cyan data-glow-cyan">рынка</span>
        </h1>

        <p className="mb-4 text-xl font-medium text-terminal-text/90 md:text-2xl">
          Интерактивный скринер акций для внутридневной торговли
        </p>

        <p className="mb-10 max-w-2xl text-base leading-relaxed text-terminal-muted md:text-lg">
          Выбираем не «популярные акции», а инструменты с деньгами, движением,
          понятным спредом и условиями для сделки
        </p>

        <div className="flex flex-wrap gap-4">
          <CTAButton href="/screener">Открыть скринер</CTAButton>
          <CTAButton href="/lesson/setup" variant="secondary">
            Первое занятие
          </CTAButton>
        </div>
      </motion.div>
    </section>
  );
}
