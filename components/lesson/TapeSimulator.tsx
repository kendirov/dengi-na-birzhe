"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_TAPE, type TapePrint } from "@/lib/lesson/orderbook-demo";
import { cn } from "@/lib/utils/format";

interface TapeSimulatorProps {
  maxRows?: number;
}

export function TapeSimulator({ maxRows = 8 }: TapeSimulatorProps) {
  const [prints, setPrints] = useState<TapePrint[]>(DEMO_TAPE.slice(0, 4));
  const [flashId, setFlashId] = useState<string | null>(null);

  const pushPrint = useCallback((print: TapePrint) => {
    setPrints((prev) => [print, ...prev].slice(0, maxRows));
    setFlashId(print.id);
    setTimeout(() => setFlashId(null), 600);
  }, [maxRows]);

  const simulateBuy = () => {
    pushPrint({
      id: `b-${Date.now()}`,
      time: new Date().toLocaleTimeString("ru-RU"),
      price: 312.45,
      qty: 150,
      side: "buy",
      large: true,
    });
  };

  const simulateSell = () => {
    pushPrint({
      id: `s-${Date.now()}`,
      time: new Date().toLocaleTimeString("ru-RU"),
      price: 312.42,
      qty: 200,
      side: "sell",
      large: true,
    });
  };

  const simulateMarketBuy = () => {
    pushPrint({
      id: `m-${Date.now()}`,
      time: new Date().toLocaleTimeString("ru-RU"),
      price: 312.45,
      qty: 30,
      side: "buy",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <TapeButton onClick={simulateBuy} label="Крупная покупка" tone="green" />
        <TapeButton onClick={simulateSell} label="Крупная продажа" tone="red" />
        <TapeButton onClick={simulateMarketBuy} label="Сделка в ленте" tone="cyan" />
      </div>

      <div className="overflow-hidden rounded-lg border border-terminal-border bg-terminal-bg/80">
        <div className="grid grid-cols-4 border-b border-terminal-border bg-terminal-surface/80 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-terminal-muted">
          <span>Время</span>
          <span>Цена</span>
          <span>Qty</span>
          <span className="text-right">Сторона</span>
        </div>
        <div className="max-h-[220px] overflow-y-auto scrollbar-terminal">
          <AnimatePresence initial={false}>
            {prints.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -12, backgroundColor: "rgba(34,211,238,0.15)" }}
                animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
                className={cn(
                  "grid grid-cols-4 border-b border-terminal-border/30 px-3 py-1.5 font-mono text-xs",
                  flashId === p.id && "bg-cyan/10",
                  p.large && "font-semibold",
                )}
              >
                <span className="text-terminal-muted">{p.time}</span>
                <span>{p.price.toFixed(2)}</span>
                <span>{p.qty}</span>
                <span
                  className={cn(
                    "text-right uppercase",
                    p.side === "buy" ? "text-green" : "text-red",
                  )}
                >
                  {p.side === "buy" ? "buy" : "sell"}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-[11px] text-terminal-muted">
        Зелёный — агрессивная покупка (удар в ask). Красный — агрессивная продажа (удар в bid).
      </p>
    </div>
  );
}

function TapeButton({
  onClick,
  label,
  tone,
}: {
  onClick: () => void;
  label: string;
  tone: "green" | "red" | "cyan";
}) {
  const styles = {
    green: "border-green/30 text-green hover:bg-green/10",
    red: "border-red/30 text-red hover:bg-red/10",
    cyan: "border-cyan/30 text-cyan hover:bg-cyan/10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded border px-3 py-1.5 font-mono text-[11px] transition-colors",
        styles[tone],
      )}
    >
      {label}
    </button>
  );
}

export function ClusterPreview() {
  const bars = [
    { price: 312.46, buy: 20, sell: 65 },
    { price: 312.45, buy: 35, sell: 80 },
    { price: 312.44, buy: 90, sell: 40 },
    { price: 312.43, buy: 55, sell: 25 },
    { price: 312.42, buy: 70, sell: 15 },
  ];

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-bg/60 p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-violet">
        Кластера · объём по цене
      </p>
      <div className="space-y-2">
        {bars.map((b) => (
          <div key={b.price} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-14 text-terminal-muted">{b.price.toFixed(2)}</span>
            <div className="flex flex-1 gap-1">
              <div
                className="h-4 rounded-sm bg-green/60"
                style={{ width: `${b.buy}%` }}
                title={`Buy ${b.buy}%`}
              />
              <div
                className="h-4 rounded-sm bg-red/60"
                style={{ width: `${b.sell}%` }}
                title={`Sell ${b.sell}%`}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-terminal-muted">
        Слева — покупки, справа — продажи на уровне. Связь с графиком: где был объём, там уровень.
      </p>
    </div>
  );
}
