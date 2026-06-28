"use client";

import { useCallback, useState } from "react";
import type { ScreenerMode } from "@/lib/types/screener";
import { cn } from "@/lib/utils/format";

export type CycleStageId =
  | "sideways"
  | "impulse"
  | "trend"
  | "acceleration"
  | "correction"
  | "range"
  | "breakout"
  | "consolidation";

interface CycleStage {
  id: CycleStageId;
  title: string;
  meaning: string;
  signs: string[];
  approach: string;
  screenerHint: string;
  screenerModes: ScreenerMode[];
  primaryMode: ScreenerMode;
  metrics: {
    volume: string;
    range: string;
    logic: string;
  };
  tone: "cyan" | "green" | "amber" | "red" | "muted";
  zoneColor: string;
  nodeX: number;
}

const STAGES: CycleStage[] = [
  {
    id: "sideways",
    title: "Боковик",
    meaning: "Цена стоит в диапазоне, объём и амплитуда низкие.",
    signs: [
      "Маленький диапазон",
      "Мало сделок",
      "Уровни часто прокалываются",
      "Цена возвращается внутрь",
    ],
    approach: "Работа от границ. Не верить каждому пробою без объёма.",
    screenerHint: "Смотрите: диапазон, сделки, узкий спред, цена лота.",
    screenerModes: ["beginner", "technical"],
    primaryMode: "beginner",
    metrics: { volume: "низкий", range: "узкий", logic: "возврат" },
    tone: "muted",
    zoneColor: "rgba(100, 116, 139, 0.12)",
    nodeX: 50,
  },
  {
    id: "impulse",
    title: "Импульс",
    meaning: "Резкое направленное движение на выросшем объёме.",
    signs: [
      "Объём может вырасти в 5–10 раз",
      "Скорость выше обычной",
      "Цена быстро проходит расстояние",
      "Появляются сделки в ленте",
    ],
    approach: "Искать продолжение или откат к уровню. Не входить вслепую в середине свечи.",
    screenerHint: "Смотрите: оборот, сделки, диапазон дня, инструмент «В игре».",
    screenerModes: ["in-play"],
    primaryMode: "in-play",
    metrics: { volume: "высокий", range: "расширяется", logic: "тренд" },
    tone: "cyan",
    zoneColor: "rgba(34, 211, 238, 0.1)",
    nodeX: 150,
  },
  {
    id: "trend",
    title: "Тренд",
    meaning: "После импульса цена продолжает идти в сторону движения.",
    signs: [
      "Обновления high/low",
      "Откаты неглубокие",
      "Объём выше обычного",
      "Направление удерживается",
    ],
    approach: "Работа по направлению, удержание через откаты.",
    screenerHint: "Смотрите: диапазон, ликвидность, технический score.",
    screenerModes: ["technical", "in-play"],
    primaryMode: "technical",
    metrics: { volume: "высокий", range: "расширяется", logic: "тренд" },
    tone: "green",
    zoneColor: "rgba(52, 211, 153, 0.1)",
    nodeX: 250,
  },
  {
    id: "acceleration",
    title: "Ускорение",
    meaning: "Движение становится слишком быстрым, растёт риск выноса и отката.",
    signs: [
      "Свечи становятся шире",
      "Вход становится дороже",
      "Спред может расширяться",
      "Эмоции в ленте",
    ],
    approach: "Не догонять без плана. Смотреть, где появится остановка.",
    screenerHint: "Смотрите: спред, стоимость входа, режим «Опасные».",
    screenerModes: ["dangerous"],
    primaryMode: "dangerous",
    metrics: { volume: "высокий", range: "расширяется", logic: "ожидание" },
    tone: "amber",
    zoneColor: "rgba(251, 191, 36, 0.12)",
    nodeX: 350,
  },
  {
    id: "correction",
    title: "Коррекция",
    meaning: "Движение против тренда. Часто откат около 30% от импульса.",
    signs: [
      "Цена возвращает часть хода",
      "Объём может снижаться",
      "Участники фиксируют прибыль",
      "Зона для нового решения",
    ],
    approach: "Смотреть, удерживается ли структура. Не путать коррекцию с разворотом.",
    screenerHint: "Смотрите: диапазон, уровни, глубина отката.",
    screenerModes: ["technical"],
    primaryMode: "technical",
    metrics: { volume: "падает", range: "сужается", logic: "возврат" },
    tone: "cyan",
    zoneColor: "rgba(34, 211, 238, 0.08)",
    nodeX: 450,
  },
  {
    id: "range",
    title: "Диапазон",
    meaning: "После коррекции цена ходит между максимумом и минимумом коррекции.",
    signs: [
      "Объём ещё выше обычного",
      "Диапазон шире старого боковика",
      "Границы становятся важными",
      "Много возвратных движений",
    ],
    approach: "Работа от границ или ожидание выхода.",
    screenerHint: "Смотрите: high/low, сделки у границ, спред.",
    screenerModes: ["technical"],
    primaryMode: "technical",
    metrics: { volume: "средний", range: "широкий", logic: "возврат" },
    tone: "muted",
    zoneColor: "rgba(100, 116, 139, 0.1)",
    nodeX: 550,
  },
  {
    id: "breakout",
    title: "Вынос",
    meaning: "Цена выносит high или low диапазона. Важно: возврат или невозврат.",
    signs: [
      "Прокол уровня",
      "Всплеск сделок",
      "Реакция на объёме",
      "Возврат внутрь или удержание снаружи",
    ],
    approach: "Если вернулась — возвратная логика. Если удержалась — появляется невозврат.",
    screenerHint: "Смотрите: сделки, оборот, удержание уровня.",
    screenerModes: ["in-play", "dangerous"],
    primaryMode: "in-play",
    metrics: { volume: "высокий", range: "расширяется", logic: "невозврат" },
    tone: "red",
    zoneColor: "rgba(248, 113, 113, 0.1)",
    nodeX: 650,
  },
  {
    id: "consolidation",
    title: "Консолидация",
    meaning: "После движения инструмент сжимается, волатильность и объём падают.",
    signs: [
      "Амплитуда сужается",
      "Объём снижается",
      "Рынок копит энергию",
      "Следующий выход может быть сильным",
    ],
    approach: "Ждать выход из сжатия, не торговать шум внутри.",
    screenerHint: "Смотрите: сужение диапазона, падение сделок.",
    screenerModes: ["technical"],
    primaryMode: "technical",
    metrics: { volume: "падает", range: "сжимается", logic: "ожидание" },
    tone: "muted",
    zoneColor: "rgba(100, 116, 139, 0.08)",
    nodeX: 750,
  },
];

const MODE_LABELS: Record<ScreenerMode, string> = {
  all: "Все",
  technical: "Техничные",
  spread: "Спредовые",
  "in-play": "В игре",
  beginner: "Для новичка",
  dangerous: "Опасные",
};

const TONE_TEXT: Record<CycleStage["tone"], string> = {
  cyan: "text-cyan",
  green: "text-green",
  amber: "text-amber",
  red: "text-red",
  muted: "text-terminal-muted",
};

interface InstrumentCycleMapProps {
  onModeSelect?: (mode: ScreenerMode) => void;
}

export function InstrumentCycleMap({ onModeSelect }: InstrumentCycleMapProps) {
  const [activeId, setActiveId] = useState<CycleStageId>("sideways");
  const [hoverId, setHoverId] = useState<CycleStageId | null>(null);

  const highlightId = hoverId ?? activeId;
  const active = STAGES.find((s) => s.id === activeId) ?? STAGES[0]!;

  const handleShowMode = useCallback(() => {
    onModeSelect?.(active.primaryMode);
  }, [active.primaryMode, onModeSelect]);

  return (
    <div className="mt-4 space-y-3">
      {/* Chart */}
      <div className="overflow-x-auto scrollbar-terminal rounded-lg border border-terminal-border/60 bg-[#070B12]">
        <div className="min-w-[720px] px-2 py-3 md:min-w-0 md:px-4">
          <CycleChart
            stages={STAGES}
            highlightId={highlightId}
            activeId={activeId}
            onHover={setHoverId}
            onSelect={setActiveId}
          />
        </div>
      </div>

      {/* Stage tabs — mobile-friendly */}
      <div className="flex gap-1 overflow-x-auto scrollbar-terminal pb-1">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onMouseEnter={() => setHoverId(stage.id)}
            onMouseLeave={() => setHoverId(null)}
            onClick={() => setActiveId(stage.id)}
            className={cn(
              "shrink-0 rounded border px-2 py-1 text-[10px] font-medium transition-colors",
              activeId === stage.id
                ? "border-cyan/40 bg-cyan/10 text-cyan"
                : "border-terminal-border/50 bg-[#080F1A] text-terminal-muted hover:border-terminal-border hover:text-terminal-text",
            )}
          >
            {stage.title}
          </button>
        ))}
      </div>

      {/* Active detail + metrics */}
      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
        <div className="rounded-lg border border-terminal-border/60 bg-[#080F1A] p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className={cn("text-sm font-semibold", TONE_TEXT[active.tone])}>
              {active.title}
            </h3>
            <span className="text-[10px] text-terminal-muted">
              {active.screenerModes.map((m) => MODE_LABELS[m]).join(" · ")}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-terminal-text/90">
            {active.meaning}
          </p>
          <ul className="mt-2 space-y-0.5 text-[11px] text-terminal-muted">
            {active.signs.map((s) => (
              <li key={s} className="flex gap-1.5">
                <span className="text-cyan/60">·</span>
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-cyan/85">{active.approach}</p>
          <p className="mt-2 text-[10px] text-terminal-muted">
            В скринере: {active.screenerHint}
          </p>
          {onModeSelect && (
            <button
              type="button"
              onClick={handleShowMode}
              className="mt-3 rounded border border-cyan/30 bg-cyan/10 px-3 py-1.5 text-[11px] font-medium text-cyan transition-colors hover:bg-cyan/15"
            >
              Показать подходящие → {MODE_LABELS[active.primaryMode]}
            </button>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-terminal-border/60 bg-[#080F1A] p-3">
          <p className="text-[10px] uppercase tracking-wider text-terminal-muted">
            Метрики этапа
          </p>
          <MetricRow label="Объём" value={active.metrics.volume} />
          <MetricRow label="Диапазон" value={active.metrics.range} />
          <MetricRow label="Логика" value={active.metrics.logic} />
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-[11px]">
      <span className="text-terminal-muted">{label}</span>
      <span className="font-mono text-terminal-text">{value}</span>
    </div>
  );
}

function CycleChart({
  stages,
  highlightId,
  activeId,
  onHover,
  onSelect,
}: {
  stages: CycleStage[];
  highlightId: CycleStageId;
  activeId: CycleStageId;
  onHover: (id: CycleStageId | null) => void;
  onSelect: (id: CycleStageId) => void;
}) {
  const segmentW = 100;

  return (
    <svg
      viewBox="0 0 800 130"
      className="h-[120px] w-full md:h-[140px]"
      role="img"
      aria-label="Жизненный цикл инструмента"
    >
      {/* Zone backgrounds */}
      {stages.map((stage, i) => (
        <rect
          key={`zone-${stage.id}`}
          x={i * segmentW}
          y={0}
          width={segmentW}
          height={130}
          fill={
            highlightId === stage.id
              ? stage.zoneColor.replace("0.1", "0.18").replace("0.12", "0.2").replace("0.08", "0.15")
              : stage.zoneColor
          }
          className="transition-opacity duration-200"
        />
      ))}

      {/* Stage separators */}
      {stages.slice(1).map((_, i) => (
        <line
          key={`sep-${i}`}
          x1={(i + 1) * segmentW}
          y1={4}
          x2={(i + 1) * segmentW}
          y2={126}
          stroke="rgba(20, 28, 42, 0.8)"
          strokeWidth={1}
        />
      ))}

      {/* Volume bars */}
      {VOLUME_BARS.map((bar, i) => (
        <rect
          key={`vol-${i}`}
          x={bar.x}
          y={bar.y}
          width={bar.w}
          height={bar.h}
          fill={bar.active ? "rgba(34, 211, 238, 0.25)" : "rgba(100, 116, 139, 0.2)"}
          rx={1}
        />
      ))}

      {/* Price path — full lifecycle */}
      <path
        d="M10 72 Q30 70 50 71 T90 70 Q110 68 130 55 L170 38 L210 32 L250 28 L290 18 L330 8 L370 22 L410 38 L450 42 Q490 44 530 43 L570 44 Q610 44 650 30 L670 22 L690 18 L710 28 L730 38 L750 48 L770 58 L790 68"
        fill="none"
        stroke="rgba(34, 211, 238, 0.35)"
        strokeWidth={1}
      />
      <path
        d="M10 72 Q30 70 50 71 T90 70 Q110 68 130 55 L170 38 L210 32 L250 28 L290 18 L330 8 L370 22 L410 38 L450 42 Q490 44 530 43 L570 44 Q610 44 650 30 L670 22 L690 18 L710 28 L730 38 L750 48 L770 58 L790 68"
        fill="none"
        stroke="rgba(34, 211, 238, 0.85)"
        strokeWidth={1.5}
        strokeDasharray="800"
        strokeDashoffset={0}
      />

      {/* Correction ~30% marker */}
      <line
        x1={330}
        y1={8}
        x2={330}
        y2={38}
        stroke="rgba(251, 191, 36, 0.4)"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <text x={334} y={24} fill="rgba(251, 191, 36, 0.7)" fontSize={7}>
        ~30%
      </text>

      {/* Range box */}
      <rect
        x={460}
        y={38}
        width={80}
        height={8}
        fill="none"
        stroke="rgba(100, 116, 139, 0.5)"
        strokeWidth={1}
        strokeDasharray="3 2"
      />

      {/* Breakout branches */}
      <path
        d="M650 30 Q660 42 670 48"
        fill="none"
        stroke="rgba(248, 113, 113, 0.5)"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <path
        d="M650 30 L690 18"
        fill="none"
        stroke="rgba(52, 211, 153, 0.6)"
        strokeWidth={1}
      />

      {/* Consolidation triangle */}
      <path
        d="M710 68 L750 48 L790 68 Z"
        fill="none"
        stroke="rgba(100, 116, 139, 0.4)"
        strokeWidth={1}
      />

      {/* Interactive nodes */}
      {stages.map((stage) => {
        const node = NODE_POSITIONS[stage.id];
        const isActive = activeId === stage.id;
        const isHighlight = highlightId === stage.id;
        return (
          <g
            key={stage.id}
            className="cursor-pointer"
            onMouseEnter={() => onHover(stage.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(stage.id)}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={isHighlight ? 10 : 7}
              fill={
                isActive
                  ? "rgba(34, 211, 238, 0.2)"
                  : "rgba(8, 15, 26, 0.9)"
              }
              stroke={
                stage.tone === "green"
                  ? "rgba(52, 211, 153, 0.9)"
                  : stage.tone === "amber"
                    ? "rgba(251, 191, 36, 0.9)"
                    : stage.tone === "red"
                      ? "rgba(248, 113, 113, 0.9)"
                      : isHighlight
                        ? "rgba(34, 211, 238, 0.9)"
                        : "rgba(100, 116, 139, 0.6)"
              }
              strokeWidth={isActive ? 2 : 1.5}
            />
            <text
              x={node.x}
              y={118}
              textAnchor="middle"
              fill={
                isHighlight ? "rgba(226, 232, 240, 0.95)" : "rgba(100, 116, 139, 0.8)"
              }
              fontSize={8}
              fontWeight={isActive ? 600 : 400}
            >
              {stage.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const NODE_POSITIONS: Record<CycleStageId, { x: number; y: number }> = {
  sideways: { x: 50, y: 71 },
  impulse: { x: 150, y: 38 },
  trend: { x: 250, y: 28 },
  acceleration: { x: 330, y: 8 },
  correction: { x: 410, y: 38 },
  range: { x: 500, y: 42 },
  breakout: { x: 670, y: 22 },
  consolidation: { x: 750, y: 58 },
};

/** Volume bar heights per segment — visual only */
const VOLUME_BARS = [
  { x: 12, y: 108, w: 8, h: 12, active: false },
  { x: 22, y: 105, w: 8, h: 15, active: false },
  { x: 112, y: 92, w: 8, h: 28, active: true },
  { x: 122, y: 88, w: 8, h: 32, active: true },
  { x: 212, y: 96, w: 8, h: 24, active: true },
  { x: 222, y: 94, w: 8, h: 26, active: true },
  { x: 312, y: 86, w: 8, h: 34, active: true },
  { x: 322, y: 84, w: 8, h: 36, active: true },
  { x: 402, y: 100, w: 8, h: 20, active: false },
  { x: 412, y: 102, w: 8, h: 18, active: false },
  { x: 492, y: 98, w: 8, h: 22, active: false },
  { x: 502, y: 96, w: 8, h: 24, active: false },
  { x: 612, y: 90, w: 8, h: 30, active: true },
  { x: 622, y: 88, w: 8, h: 32, active: true },
  { x: 712, y: 106, w: 8, h: 14, active: false },
  { x: 722, y: 108, w: 8, h: 12, active: false },
  { x: 772, y: 110, w: 8, h: 10, active: false },
  { x: 782, y: 111, w: 8, h: 9, active: false },
];

export { STAGES as CYCLE_STAGES };
