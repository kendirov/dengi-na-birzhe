"use client";

import type { EnrichedInstrument } from "@/lib/types/instrument";
import type { ScreenerMode } from "@/lib/types/screener";
import { getModeScore } from "@/lib/types/screener";
import { TopPickCard } from "@/components/screener/TopPickCard";
import { cn, formatRub } from "@/lib/utils/format";

interface ModeConfig {
  title: string;
  description: string;
  watch: string[];
  scheme: React.ReactNode;
}

function TechnicalScheme() {
  return (
    <svg viewBox="0 0 100 48" className="h-12 w-full" aria-hidden>
      <path
        d="M4 36 L24 32 L40 12 L56 8 L76 20 L96 16"
        fill="none"
        stroke="rgba(34, 211, 238, 0.8)"
        strokeWidth="1.5"
      />
      <circle cx="40" cy="12" r="2" fill="rgba(34, 211, 238, 0.6)" />
      <circle cx="76" cy="20" r="2" fill="rgba(251, 191, 36, 0.6)" />
    </svg>
  );
}

function SpreadScheme() {
  return (
    <svg viewBox="0 0 100 48" className="h-12 w-full" aria-hidden>
      {[20, 35, 50, 65, 80].map((x) => (
        <g key={x}>
          <rect
            x={x}
            y="8"
            width="8"
            height="6"
            fill="rgba(52, 211, 153, 0.2)"
            stroke="rgba(52, 211, 153, 0.5)"
            strokeWidth="0.5"
          />
          <rect
            x={x}
            y="34"
            width="8"
            height="6"
            fill="rgba(248, 113, 113, 0.2)"
            stroke="rgba(248, 113, 113, 0.5)"
            strokeWidth="0.5"
          />
        </g>
      ))}
      <text x="50" y="26" textAnchor="middle" fill="rgba(251, 191, 36, 0.8)" fontSize="8">
        spread
      </text>
    </svg>
  );
}

function InPlayScheme() {
  return (
    <svg viewBox="0 0 100 48" className="h-12 w-full" aria-hidden>
      {[12, 24, 36, 48, 60, 72, 84].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={48 - (6 + i * 3)}
          width="6"
          height={6 + i * 3}
          fill="rgba(167, 139, 250, 0.15)"
          stroke="rgba(167, 139, 250, 0.4)"
          strokeWidth="0.5"
        />
      ))}
      <path
        d="M4 36 L50 30 L96 14"
        fill="none"
        stroke="rgba(34, 211, 238, 0.7)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function BeginnerScheme() {
  return (
    <svg viewBox="0 0 100 48" className="h-12 w-full" aria-hidden>
      <rect
        x="20"
        y="10"
        width="60"
        height="28"
        rx="3"
        fill="none"
        stroke="rgba(100, 116, 139, 0.4)"
        strokeWidth="1"
      />
      <text x="50" y="22" textAnchor="middle" fill="rgba(34, 211, 238, 0.7)" fontSize="7">
        лот × шаг
      </text>
      <text x="50" y="32" textAnchor="middle" fill="rgba(251, 191, 36, 0.7)" fontSize="7">
        = ошибка ₽
      </text>
    </svg>
  );
}

function DangerousScheme() {
  return (
    <svg viewBox="0 0 100 48" className="h-12 w-full" aria-hidden>
      <polygon
        points="50,8 58,22 42,22"
        fill="rgba(248, 113, 113, 0.3)"
        stroke="rgba(248, 113, 113, 0.7)"
        strokeWidth="1"
      />
      <rect
        x="30"
        y="28"
        width="14"
        height="8"
        fill="rgba(52, 211, 153, 0.15)"
        stroke="rgba(52, 211, 153, 0.4)"
        strokeWidth="0.5"
      />
      <rect
        x="56"
        y="28"
        width="14"
        height="8"
        fill="rgba(248, 113, 113, 0.15)"
        stroke="rgba(248, 113, 113, 0.4)"
        strokeWidth="0.5"
      />
      <line
        x1="44"
        y1="32"
        x2="56"
        y2="32"
        stroke="rgba(251, 191, 36, 0.8)"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function AllScheme() {
  return (
    <svg viewBox="0 0 100 48" className="h-12 w-full" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={10 + i * 18}
          y={12 + i * 2}
          width="14"
          height="24 - i * 4"
          fill="rgba(100, 116, 139, 0.1)"
          stroke="rgba(100, 116, 139, 0.3)"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}

const MODE_CONFIG: Record<ScreenerMode, ModeConfig> = {
  all: {
    title: "Все инструменты",
    description:
      "Общий список. Для торговли лучше выбирать через конкретный режим: техничные, спредовые, в игре или для новичка.",
    watch: [],
    scheme: <AllScheme />,
  },
  technical: {
    title: "Техничные инструменты",
    description:
      "Для графика, уровней, high/low, импульсов и откатов. Обычно важны диапазон, ликвидность и понятное движение.",
    watch: [
      "диапазон дня",
      "high/low",
      "движение относительно рынка",
      "оборот и сделки",
      "нет ли слишком дорогого спреда",
    ],
    scheme: <TechnicalScheme />,
  },
  spread: {
    title: "Спредовые инструменты",
    description:
      "Для работы от bid/ask. Важны ширина спреда, цена шага, комиссия, сделки и плотность стакана.",
    watch: [
      "spread ₽",
      "spread %",
      "spread ticks",
      "цена шага",
      "сделки",
      "оборот",
      "стоимость входа",
    ],
    scheme: <SpreadScheme />,
  },
  "in-play": {
    title: "Инструменты в игре",
    description:
      "Есть оборот, сделки и движение. Это не сигнал, а список того, что сейчас стоит наблюдать.",
    watch: [
      "оборот",
      "сделки",
      "диапазон",
      "ускорение",
      "удержание high/low",
      "появление невозврата",
    ],
    scheme: <InPlayScheme />,
  },
  beginner: {
    title: "Инструменты для тренировки",
    description:
      "Понятный лот, понятная цена шага, не экстремальный спред и достаточно сделок.",
    watch: [
      "цена лота",
      "пункт/лот",
      "цена шага",
      "spread ₽",
      "сделки",
      "стоимость ошибки",
    ],
    scheme: <BeginnerScheme />,
  },
  dangerous: {
    title: "Опасные инструменты",
    description:
      "Движение есть, но торговые условия плохие: широкий спред, мало сделок, дорогой лот или высокая стоимость ошибки.",
    watch: [
      "широкий spread",
      "мало сделок",
      "большой lotValue",
      "резкие тики",
      "отсутствие базы",
    ],
    scheme: <DangerousScheme />,
  },
};

interface ModeExplainerPanelProps {
  mode: ScreenerMode;
  topPicks: EnrichedInstrument[];
  modeCount: number;
  selectedTicker?: string;
  onSelect: (inst: EnrichedInstrument) => void;
}

export function ModeExplainerPanel({
  mode,
  topPicks,
  modeCount,
  selectedTicker,
  onSelect,
}: ModeExplainerPanelProps) {
  const config = MODE_CONFIG[mode];
  const fewSpread =
    mode === "spread" && modeCount < 5;

  return (
    <div
      className={cn(
        "rounded-lg border border-terminal-border/70 bg-terminal-surface/30 p-3 lg:p-4",
        mode === "dangerous" && "border-red/15",
        mode === "spread" && "border-amber/15",
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_200px] xl:grid-cols-[1fr_220px_1fr]">
        <div>
          <h3 className="text-sm font-semibold text-terminal-text">
            {config.title}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-terminal-muted">
            {config.description}
          </p>
          {config.watch.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
                Смотреть
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-terminal-muted">
                {config.watch.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
          )}
          {fewSpread && (
            <p className="mt-3 text-[11px] text-amber/90">
              Мало инструментов по условиям ({modeCount}). Нужны широкий спред,
              сделки, оборот и понятный шаг — не добиваем мусором.
            </p>
          )}
        </div>

        <div className="flex items-center justify-center rounded border border-terminal-border/40 bg-terminal-bg/50 px-3 py-2">
          {config.scheme}
        </div>

        <div className="xl:col-span-1">
          {topPicks.length > 0 ? (
            <>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
                Лучшие в режиме
              </p>
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                {topPicks.map((inst, i) => (
                  <TopPickCard
                    key={inst.ticker}
                    rank={i + 1}
                    instrument={inst}
                    mode={mode}
                    selected={selectedTicker === inst.ticker}
                    onSelect={() => onSelect(inst)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[80px] items-center justify-center rounded border border-terminal-border/40 bg-terminal-bg/30 px-4 text-center text-xs text-terminal-muted">
              {mode === "spread"
                ? "Нет подходящих спредовых по условиям"
                : "Нет инструментов в этом режиме"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ModeExplainerMiniRow({
  instrument,
}: {
  instrument: EnrichedInstrument;
}) {
  return (
    <span className="font-mono text-[10px] text-terminal-muted">
      {instrument.ticker} · {formatRub(instrument.rubPerPointPerLot)} · оценка{" "}
      {getModeScore(instrument, "all")}
    </span>
  );
}
