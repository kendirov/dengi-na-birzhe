"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InteractiveOrderBook } from "@/components/lesson/InteractiveOrderBook";
import { cn } from "@/lib/utils/format";

type Scenario = "real" | "fake" | null;

const REAL_STEPS = [
  "Аномальный объём на 312.40",
  "Уровень на круглом числе",
  "Плотность не снимается при подходе",
  "Есть исполнение в ленте",
  "Цена даёт отскок",
];

const FAKE_STEPS = [
  "Объём выделяется, но…",
  "При подходе цены заявка снимается",
  "Реакции цены нет",
  "В ленте нет крупных принтов",
  "Возможен спуфинг / техликвидность",
];

const REAL_PRICES = [312.38, 312.39, 312.4, 312.41, 312.43, 312.45];
const FAKE_PRICES = [312.38, 312.39, 312.4, 312.4, 312.39, 312.38];

export function DensityScenario() {
  const [scenario, setScenario] = useState<Scenario>(null);
  const [priceIdx, setPriceIdx] = useState(0);

  const prices = scenario === "fake" ? FAKE_PRICES : REAL_PRICES;
  const currentPrice = prices[priceIdx] ?? prices[prices.length - 1];
  const densityRemoved = scenario === "fake" && priceIdx >= 2;

  const runAnimation = (type: Scenario) => {
    setScenario(type);
    setPriceIdx(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setPriceIdx(i);
      if (i >= (type === "fake" ? FAKE_PRICES.length : REAL_PRICES.length) - 1) {
        clearInterval(interval);
      }
    }, 800);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <ScenarioButton
          active={scenario === "real"}
          onClick={() => runAnimation("real")}
          label="Сценарий: настоящая плотность"
          tone="green"
        />
        <ScenarioButton
          active={scenario === "fake"}
          onClick={() => runAnimation("fake")}
          label="Сценарий: ложная плотность"
          tone="red"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <MiniPriceChart
            prices={prices.slice(0, priceIdx + 1)}
            scenario={scenario}
            densityPrice={312.4}
          />
          <p className="mt-2 text-center font-mono text-lg font-bold text-cyan data-glow-cyan">
            {currentPrice.toFixed(2)} ₽
            {scenario === "real" && priceIdx >= 4 && (
              <span className="ml-2 text-sm text-green">↑ отскок</span>
            )}
            {scenario === "fake" && priceIdx >= 3 && (
              <span className="ml-2 text-sm text-red">↓ провал</span>
            )}
          </p>
        </div>

        <InteractiveOrderBook
          showDensity
          densityRemoved={densityRemoved}
        />
      </div>

      {scenario && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-terminal-border bg-terminal-surface/50 p-4"
        >
          <p className="mb-3 font-mono text-xs uppercase text-terminal-muted">
            Алгоритм чтения · {scenario === "real" ? "настоящая" : "ложная"}
          </p>
          <ol className="space-y-2">
            {(scenario === "real" ? REAL_STEPS : FAKE_STEPS).map((step, i) => (
              <li
                key={step}
                className={cn(
                  "flex gap-2 text-sm",
                  i <= priceIdx ? "text-terminal-text" : "text-terminal-muted/50",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-xs",
                    i <= priceIdx
                      ? scenario === "real"
                        ? "text-green"
                        : "text-red"
                      : "",
                  )}
                >
                  {i + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </motion.div>
      )}
    </div>
  );
}

function ScenarioButton({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone: "green" | "red";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
        active
          ? tone === "green"
            ? "border-green/50 bg-green/10 text-green"
            : "border-red/50 bg-red/10 text-red"
          : "border-terminal-border text-terminal-muted hover:border-cyan/30",
      )}
    >
      {label}
    </button>
  );
}

function MiniPriceChart({
  prices,
  scenario,
  densityPrice,
}: {
  prices: number[];
  scenario: Scenario;
  densityPrice: number;
}) {
  if (prices.length === 0) {
    return (
      <div className="flex h-[140px] items-center justify-center rounded-lg border border-terminal-border bg-terminal-bg/60 text-sm text-terminal-muted">
        Запустите сценарий
      </div>
    );
  }

  const min = Math.min(...prices, densityPrice) - 0.02;
  const max = Math.max(...prices, densityPrice) + 0.02;
  const range = max - min || 0.01;

  const toY = (p: number) => 120 - ((p - min) / range) * 100;
  const toX = (i: number) => (i / Math.max(prices.length - 1, 1)) * 280;

  const path = prices
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p)}`)
    .join(" ");

  const densityY = toY(densityPrice);

  return (
    <svg
      viewBox="0 0 300 140"
      className="w-full rounded-lg border border-terminal-border bg-terminal-bg/60"
    >
      <line
        x1="0"
        y1={densityY}
        x2="300"
        y2={densityY}
        stroke="rgba(251,191,36,0.5)"
        strokeDasharray="4 4"
      />
      <text x="8" y={densityY - 4} fill="rgba(251,191,36,0.8)" fontSize="9">
        плотность {densityPrice.toFixed(2)}
      </text>
      <motion.path
        d={path}
        fill="none"
        stroke={scenario === "fake" ? "#f87171" : "#34d399"}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4 }}
      />
      {prices.map((p, i) => (
        <circle
          key={`${i}-${p}`}
          cx={toX(i)}
          cy={toY(p)}
          r="3"
          fill={scenario === "fake" ? "#f87171" : "#22d3ee"}
        />
      ))}
    </svg>
  );
}

export function DensityCompareCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CompareCard
        title="Признаки настоящей"
        tone="green"
        items={[
          "Выделяется на фоне остальных",
          "Стоит и не снимается",
          "Круглое число / obvious level",
          "Реально исполняют",
          "Цена даёт реакцию",
        ]}
      />
      <CompareCard
        title="Признаки ложной"
        tone="red"
        items={[
          "Снимается при подходе цены",
          "Не даёт реакции",
          "Исчезает после провокации",
          "Спуфинг / техническая ликвидность",
        ]}
      />
    </div>
  );
}

function CompareCard({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "green" | "red";
  items: string[];
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-terminal-surface/40 p-4",
        tone === "green" ? "border-green/20" : "border-red/20",
      )}
    >
      <h4
        className={cn(
          "mb-3 font-semibold",
          tone === "green" ? "text-green" : "text-red",
        )}
      >
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-terminal-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={tone === "green" ? "text-green" : "text-red"}>·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BounceChecklist() {
  const items = [
    "Плотность визуально выделяется",
    "За плотностью не пустой стакан",
    "Нет крупных плотностей против нас",
    "Нет одностороннего потока против нас",
    "Цена не зажата между уровнями",
    "Плотность не убирается при подходе",
    "Есть потенциал движения после отскока",
  ];

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2 rounded border border-terminal-border bg-terminal-bg/40 px-3 py-2 text-xs text-terminal-muted"
        >
          <span className="text-cyan">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ZoneOfInterest() {
  return (
    <div className="rounded-lg border border-cyan/20 bg-cyan/5 p-4">
      <p className="mb-2 font-mono text-xs uppercase text-cyan">Зона интереса</p>
      <ul className="space-y-2 text-sm text-terminal-text/90">
        <li>→ Вход максимально близко к плотности</li>
        <li>→ Преимущественно лимитным ордером</li>
        <li>→ Выход, если плотность начинают разъедать</li>
      </ul>
    </div>
  );
}
