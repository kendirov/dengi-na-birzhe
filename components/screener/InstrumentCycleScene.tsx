"use client";

import { useCallback, useMemo, useState } from "react";
import type { ScreenerMode } from "@/lib/types/screener";
import {
  CYCLE_PHASES,
  CHART,
  LEVELS,
  SCENE_CANDLES,
  getPhase,
  type CyclePhase,
  type CyclePhaseId,
  type SceneCandle,
} from "@/lib/screener/cycle-chart-data";
import { cn } from "@/lib/utils/format";

const MODE_LABELS: Record<ScreenerMode, string> = {
  all: "Все",
  technical: "Техничные",
  spread: "Спредовые",
  "in-play": "В игре",
  beginner: "Для новичка",
  dangerous: "Опасные",
};

const TONE_TEXT: Record<CyclePhase["tone"], string> = {
  cyan: "text-cyan",
  green: "text-green",
  amber: "text-amber",
  red: "text-red",
  muted: "text-terminal-muted",
  violet: "text-violet",
};

const TONE_STROKE: Record<CyclePhase["tone"], string> = {
  cyan: "rgba(34, 211, 238, 0.95)",
  green: "rgba(52, 211, 153, 0.95)",
  amber: "rgba(251, 191, 36, 0.95)",
  red: "rgba(248, 113, 113, 0.95)",
  muted: "rgba(148, 163, 184, 0.85)",
  violet: "rgba(167, 139, 250, 0.9)",
};

const CANDLE_UP = {
  body: "rgba(34, 211, 238, 0.85)",
  bodyDim: "rgba(34, 211, 238, 0.35)",
  wick: "rgba(34, 211, 238, 0.65)",
  wickDim: "rgba(34, 211, 238, 0.25)",
};

const CANDLE_DOWN = {
  body: "rgba(248, 113, 113, 0.8)",
  bodyDim: "rgba(248, 113, 113, 0.32)",
  wick: "rgba(248, 113, 113, 0.6)",
  wickDim: "rgba(248, 113, 113, 0.22)",
};

const CHART_BADGES = ["цена", "объём", "фазы", "возврат / невозврат"] as const;

interface InstrumentCycleSceneProps {
  activeMode?: ScreenerMode;
  onSelectMode?: (mode: ScreenerMode) => void;
}

/** @deprecated use onSelectMode */
type LegacyProps = { onModeSelect?: (mode: ScreenerMode) => void };

export function InstrumentCycleScene({
  activeMode,
  onSelectMode,
  onModeSelect,
}: InstrumentCycleSceneProps & LegacyProps) {
  const handleMode = onSelectMode ?? onModeSelect;
  const [activeId, setActiveId] = useState<CyclePhaseId>("breakout");
  const [hoverId, setHoverId] = useState<CyclePhaseId | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    phaseId: CyclePhaseId;
  } | null>(null);

  const highlightId = hoverId ?? activeId;
  const active = getPhase(activeId);

  const handleShowMode = useCallback(() => {
    handleMode?.(active.primaryMode);
  }, [active.primaryMode, handleMode]);

  const realCandles = useMemo(
    () => SCENE_CANDLES.filter((c) => !c.ghost),
    [],
  );
  const ghostCandles = useMemo(
    () => SCENE_CANDLES.filter((c) => c.ghost),
    [],
  );

  return (
    <div className="mt-4 space-y-3">
      <ChartHeader active={active} highlightId={highlightId} />

      <div className="overflow-x-auto scrollbar-terminal rounded-lg border border-terminal-border/60 bg-[#080E18]">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="min-w-[720px] w-full h-auto"
          role="img"
          aria-label="Модель состояния инструмента"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => {
            setHoverId(null);
            setTooltip(null);
          }}
        >
          <defs>
            <linearGradient id="volSpike" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(180, 130, 20, 0.4)" />
              <stop offset="100%" stopColor="rgba(251, 191, 36, 0.95)" />
            </linearGradient>
            <linearGradient id="volNormal" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(180, 130, 20, 0.25)" />
              <stop offset="100%" stopColor="rgba(251, 191, 36, 0.65)" />
            </linearGradient>
            <linearGradient id="volLow" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(120, 90, 20, 0.15)" />
              <stop offset="100%" stopColor="rgba(180, 130, 20, 0.4)" />
            </linearGradient>
          </defs>

          <ChartGrid />

          {CYCLE_PHASES.map((phase) => (
            <PhaseZone
              key={phase.id}
              phase={phase}
              active={activeId === phase.id}
              highlighted={highlightId === phase.id}
              onHover={(id) => {
                setHoverId(id);
                if (id) setTooltip(null);
              }}
              onSelect={(id) => {
                setActiveId(id);
                setTooltip(null);
              }}
            />
          ))}

          <LevelAnnotations highlightId={highlightId} />

          {realCandles.map((candle, i) => (
            <CandleShape
              key={`c-${i}`}
              candle={candle}
              highlighted={highlightId === candle.phaseId}
              dimmed={highlightId !== candle.phaseId}
            />
          ))}

          {ghostCandles.map((candle, i) => (
            <CandleShape
              key={`g-${i}`}
              candle={candle}
              highlighted={highlightId === "breakout"}
              dimmed={highlightId !== "breakout"}
              ghost
            />
          ))}

          <PriceContour candles={realCandles} highlightId={highlightId} />

          {realCandles.map((candle, i) => (
            <VolumeBarShape
              key={`v-${i}`}
              candle={candle}
              highlighted={highlightId === candle.phaseId}
              dimmed={highlightId !== candle.phaseId}
            />
          ))}

          <VolumeSeparator />

          {CYCLE_PHASES.map((phase) => (
            <text
              key={`label-${phase.id}`}
              x={(phase.xStart + phase.xEnd) / 2}
              y={28}
              textAnchor="middle"
              fill={
                highlightId === phase.id
                  ? "rgba(226, 232, 240, 0.95)"
                  : "rgba(100, 116, 139, 0.7)"
              }
              fontSize={10}
              fontWeight={activeId === phase.id ? 600 : 400}
              className="pointer-events-none select-none"
            >
              {phase.title}
            </text>
          ))}

          <PhaseMarkers highlightId={highlightId} />

          {tooltip && (
            <PhaseTooltip
              phase={getPhase(tooltip.phaseId)}
              x={tooltip.x}
              y={tooltip.y}
            />
          )}

          {realCandles.map((candle, i) => (
            <rect
              key={`hit-${i}`}
              x={candle.cx - CHART.candleWidth}
              y={CHART.priceTop}
              width={CHART.candleWidth * 2}
              height={CHART.volumeBottom - CHART.priceTop}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => {
                setHoverId(candle.phaseId);
                setTooltip({
                  x: candle.cx,
                  y: candle.high - 8,
                  phaseId: candle.phaseId,
                });
              }}
              onClick={() => setActiveId(candle.phaseId)}
            />
          ))}
        </svg>
      </div>

      <div className="flex gap-1 overflow-x-auto scrollbar-terminal pb-1 md:hidden">
        {CYCLE_PHASES.map((phase) => (
          <PhaseTab
            key={phase.id}
            phase={phase}
            active={activeId === phase.id}
            onSelect={setActiveId}
          />
        ))}
      </div>

      <ActivePhaseCard
        phase={active}
        activeMode={activeMode}
        onShowMode={handleMode ? handleShowMode : undefined}
      />
    </div>
  );
}

function ChartHeader({
  active,
  highlightId,
}: {
  active: CyclePhase;
  highlightId: CyclePhaseId;
}) {
  const shown = highlightId !== active.id ? getPhase(highlightId) : active;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-terminal-text/90">
          Модель состояния инструмента
        </span>
        {CHART_BADGES.map((badge) => (
          <span
            key={badge}
            className="rounded border border-terminal-border/50 bg-[#060A12] px-1.5 py-0.5 text-[9px] text-terminal-muted"
          >
            {badge}
          </span>
        ))}
      </div>
      <div className="text-right">
        <p className={cn("text-[11px] font-semibold", TONE_TEXT[shown.tone])}>
          {shown.title}
        </p>
        <p className="text-[10px] text-terminal-muted">
          {shown.subtitle} · Кликните фазу, чтобы увидеть подход
        </p>
      </div>
    </div>
  );
}

function ChartGrid() {
  const hLines = [40, 80, 120, 160, 200, 240];
  const vLines = Array.from({ length: 13 }, (_, i) => i * 100);
  return (
    <g opacity={0.1}>
      {hLines.map((y) => (
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={CHART.width}
          y2={y}
          stroke="rgba(148, 163, 184, 0.8)"
          strokeWidth={0.5}
        />
      ))}
      {vLines.map((x) => (
        <line
          key={`v-${x}`}
          x1={x}
          y1={CHART.priceTop}
          x2={x}
          y2={CHART.volumeBottom}
          stroke="rgba(148, 163, 184, 0.6)"
          strokeWidth={0.5}
        />
      ))}
    </g>
  );
}

function PhaseZone({
  phase,
  active,
  highlighted,
  onHover,
  onSelect,
}: {
  phase: CyclePhase;
  active: boolean;
  highlighted: boolean;
  onHover: (id: CyclePhaseId | null) => void;
  onSelect: (id: CyclePhaseId) => void;
}) {
  const w = phase.xEnd - phase.xStart;
  const fillOpacity = highlighted ? 1.8 : 1;
  const baseColor = phase.zoneColor;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(phase.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(phase.id)}
    >
      <rect
        x={phase.xStart}
        y={0}
        width={w}
        height={CHART.height}
        fill={baseColor}
        opacity={highlighted ? Math.min(1, 0.22 * fillOpacity) : 0.08}
        className="transition-opacity duration-200"
      />
      {active && (
        <rect
          x={phase.xStart}
          y={0}
          width={w}
          height={2}
          fill={TONE_STROKE[phase.tone]}
        />
      )}
      {highlighted && (
        <rect
          x={phase.xStart}
          y={CHART.height - 2}
          width={w}
          height={2}
          fill={TONE_STROKE[phase.tone]}
          opacity={0.6}
        />
      )}
    </g>
  );
}

function LevelAnnotations({ highlightId }: { highlightId: CyclePhaseId }) {
  return (
    <g className="pointer-events-none">
      <LevelLine y={LEVELS.sidewaysHigh} label="боковик high" x1={8} x2={148} />
      <LevelLine
        y={LEVELS.sidewaysLow}
        label="боковик low"
        x1={8}
        x2={148}
        dashed
      />
      <LevelLine y={LEVELS.peakHigh} label="HIGH" x1={450} x2={570} tone="amber" />
      <LevelLine
        y={LEVELS.correctionLow}
        label="correction low"
        x1={570}
        x2={690}
        tone="cyan"
      />
      <LevelLine
        y={LEVELS.rangeHigh}
        label="верхняя граница"
        x1={692}
        x2={812}
      />
      <LevelLine
        y={LEVELS.rangeLow}
        label="нижняя граница"
        x1={692}
        x2={812}
        dashed
      />
      <rect
        x={692}
        y={LEVELS.rangeHigh}
        width={118}
        height={LEVELS.rangeLow - LEVELS.rangeHigh}
        fill="none"
        stroke="rgba(100, 116, 139, 0.35)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <LevelLine
        y={LEVELS.breakoutLevel}
        label="уровень выноса"
        x1={810}
        x2={990}
        tone="amber"
      />

      <line
        x1={518}
        y1={LEVELS.peakHigh}
        x2={662}
        y2={LEVELS.correctionLow}
        stroke="rgba(251, 191, 36, 0.45)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text x={560} y={68} fill="rgba(251, 191, 36, 0.75)" fontSize={9}>
        коррекция ~30%
      </text>

      {highlightId === "impulse" && (
        <text x={168} y={168} fill="rgba(251, 191, 36, 0.8)" fontSize={9}>
          объём ×5–10
        </text>
      )}
      {highlightId === "trend" && (
        <text x={340} y={48} fill="rgba(52, 211, 153, 0.75)" fontSize={9}>
          структура держится
        </text>
      )}
      {highlightId === "acceleration" && (
        <text x={468} y={16} fill="rgba(251, 191, 36, 0.85)" fontSize={9}>
          не догонять без плана
        </text>
      )}
      {highlightId === "consolidation" && (
        <text x={1040} y={36} fill="rgba(167, 139, 250, 0.75)" fontSize={9}>
          сжатие перед новым выходом
        </text>
      )}
    </g>
  );
}

function LevelLine({
  y,
  label,
  x1,
  x2,
  dashed,
  tone = "muted",
}: {
  y: number;
  label: string;
  x1: number;
  x2: number;
  dashed?: boolean;
  tone?: "muted" | "amber" | "cyan";
}) {
  const stroke =
    tone === "amber"
      ? "rgba(251, 191, 36, 0.45)"
      : tone === "cyan"
        ? "rgba(34, 211, 238, 0.4)"
        : "rgba(100, 116, 139, 0.35)";
  return (
    <g>
      <line
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke={stroke}
        strokeWidth={1}
        strokeDasharray={dashed ? "4 3" : undefined}
      />
      <text x={x1 + 4} y={y - 4} fill="rgba(100, 116, 139, 0.65)" fontSize={8}>
        {label}
      </text>
    </g>
  );
}

function isBullish(candle: SceneCandle): boolean {
  return candle.close < candle.open;
}

function CandleShape({
  candle,
  highlighted,
  dimmed,
  ghost,
}: {
  candle: SceneCandle;
  highlighted: boolean;
  dimmed: boolean;
  ghost?: boolean;
}) {
  const bull = isBullish(candle);
  const palette = bull ? CANDLE_UP : CANDLE_DOWN;
  const bodyTop = Math.min(candle.open, candle.close);
  const bodyH = Math.max(Math.abs(candle.close - candle.open), 1.2);
  const opacity = ghost ? 0.45 : dimmed ? 0.35 : 1;
  const bodyFill = ghost
    ? "none"
    : highlighted
      ? palette.body
      : palette.bodyDim;
  const wickStroke = highlighted ? palette.wick : palette.wickDim;

  return (
    <g opacity={opacity} className="transition-opacity duration-200">
      <line
        x1={candle.cx}
        y1={candle.high}
        x2={candle.cx}
        y2={candle.low}
        stroke={wickStroke}
        strokeWidth={ghost ? 0.8 : 1}
        strokeDasharray={ghost ? "2 2" : undefined}
      />
      <rect
        x={candle.cx - CHART.candleWidth / 2}
        y={bodyTop}
        width={CHART.candleWidth}
        height={bodyH}
        fill={bodyFill}
        stroke={ghost ? palette.wick : highlighted ? palette.body : "none"}
        strokeWidth={ghost ? 0.8 : 0}
        strokeDasharray={ghost ? "2 1" : undefined}
        rx={0.5}
      />
    </g>
  );
}

function PriceContour({
  candles,
  highlightId,
}: {
  candles: SceneCandle[];
  highlightId: CyclePhaseId;
}) {
  const phase = getPhase(highlightId);
  const segment = candles.filter((c) => c.phaseId === highlightId);
  if (segment.length < 2) return null;

  const d = segment
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.cx} ${(c.high + c.low) / 2}`)
    .join(" ");

  return (
    <path
      d={d}
      fill="none"
      stroke={TONE_STROKE[phase.tone]}
      strokeWidth={1.2}
      strokeLinecap="round"
      opacity={0.55}
      className="transition-[stroke] duration-200"
    />
  );
}

function VolumeBarShape({
  candle,
  highlighted,
  dimmed,
}: {
  candle: SceneCandle;
  highlighted: boolean;
  dimmed: boolean;
}) {
  const h = candle.volume * CHART.volMaxH;
  const fill =
    candle.volume > 0.7
      ? "url(#volSpike)"
      : candle.volume > 0.35
        ? "url(#volNormal)"
        : "url(#volLow)";

  return (
    <rect
      x={candle.cx - CHART.candleWidth / 2 - 0.5}
      y={CHART.volBaseY - h}
      width={CHART.candleWidth + 1}
      height={h}
      fill={fill}
      opacity={dimmed ? 0.3 : highlighted ? 1 : 0.75}
      rx={0.5}
      className="transition-opacity duration-200"
    />
  );
}

function VolumeSeparator() {
  return (
    <g className="pointer-events-none">
      <line
        x1={0}
        y1={CHART.volumeTop - 4}
        x2={CHART.width}
        y2={CHART.volumeTop - 4}
        stroke="rgba(30, 41, 59, 0.9)"
        strokeWidth={1}
      />
      <text x={8} y={CHART.volumeTop + 10} fill="rgba(100, 116, 139, 0.7)" fontSize={9}>
        объём
      </text>
    </g>
  );
}

function PhaseMarkers({ highlightId }: { highlightId: CyclePhaseId }) {
  const breakoutOn = highlightId === "breakout";
  return (
    <g className="pointer-events-none select-none">
      <MarkerTag x={844} y={96} label="возврат" tone="red" active={breakoutOn} />
      <MarkerTag
        x={920}
        y={48}
        label="невозврат"
        tone="green"
        active={breakoutOn}
      />
      <MarkerTag x={168} y={152} label="импульс" tone="cyan" active={highlightId === "impulse"} />
      <MarkerTag x={340} y={56} label="уровень" tone="muted" active={highlightId === "wideRange"} />
      <MarkerTag
        x={1080}
        y={48}
        label="сжатие"
        tone="violet"
        active={highlightId === "consolidation"}
      />
    </g>
  );
}

function MarkerTag({
  x,
  y,
  label,
  tone,
  active,
}: {
  x: number;
  y: number;
  label: string;
  tone: "cyan" | "green" | "red" | "amber" | "muted" | "violet";
  active: boolean;
}) {
  const colors: Record<typeof tone, string> = {
    cyan: "rgba(34, 211, 238, 0.8)",
    green: "rgba(52, 211, 153, 0.85)",
    red: "rgba(248, 113, 113, 0.85)",
    amber: "rgba(251, 191, 36, 0.85)",
    muted: "rgba(100, 116, 139, 0.75)",
    violet: "rgba(167, 139, 250, 0.8)",
  };
  return (
    <text
      x={x}
      y={y}
      fill={colors[tone]}
      fontSize={8}
      fontWeight={active ? 600 : 400}
      opacity={active ? 1 : 0.65}
    >
      {label}
    </text>
  );
}

function PhaseTooltip({
  phase,
  x,
  y,
}: {
  phase: CyclePhase;
  x: number;
  y: number;
}) {
  const tx = Math.min(Math.max(x - 70, 8), CHART.width - 148);
  const ty = Math.max(y - 72, 8);
  return (
    <g className="pointer-events-none">
      <rect
        x={tx}
        y={ty}
        width={140}
        height={64}
        rx={4}
        fill="rgba(5, 7, 13, 0.92)"
        stroke="rgba(34, 211, 238, 0.25)"
        strokeWidth={1}
      />
      <text x={tx + 8} y={ty + 14} fill="rgba(226, 232, 240, 0.95)" fontSize={9} fontWeight={600}>
        {phase.title}
      </text>
      <text x={tx + 8} y={ty + 28} fill="rgba(100, 116, 139, 0.9)" fontSize={8}>
        {phase.subtitle}
      </text>
      <text x={tx + 8} y={ty + 42} fill="rgba(34, 211, 238, 0.75)" fontSize={8}>
        {phase.logic}
      </text>
      <text x={tx + 8} y={ty + 56} fill="rgba(100, 116, 139, 0.8)" fontSize={8}>
        {phase.screenerModeLabel}
      </text>
    </g>
  );
}

function PhaseTab({
  phase,
  active,
  onSelect,
}: {
  phase: CyclePhase;
  active: boolean;
  onSelect: (id: CyclePhaseId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(phase.id)}
      className={cn(
        "shrink-0 rounded border px-2 py-1 text-[10px] font-medium transition-colors",
        active
          ? "border-cyan/40 bg-cyan/10 text-cyan"
          : "border-terminal-border/50 bg-[#080F1A] text-terminal-muted",
      )}
    >
      {phase.title}
    </button>
  );
}

function ActivePhaseCard({
  phase,
  activeMode,
  onShowMode,
}: {
  phase: CyclePhase;
  activeMode?: ScreenerMode;
  onShowMode?: () => void;
}) {
  const modeActive = activeMode === phase.primaryMode;
  return (
    <div className="grid gap-3 rounded-lg border border-terminal-border/60 bg-[#060A12] p-4 md:grid-cols-[1fr_auto]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={cn("text-sm font-semibold", TONE_TEXT[phase.tone])}>
            {phase.title}
          </h3>
          <span className="rounded border border-terminal-border/50 px-1.5 py-0.5 text-[10px] text-terminal-muted">
            {phase.logic}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
            Что происходит
          </p>
          <p className="mt-1 text-xs leading-relaxed text-terminal-text/90">
            {phase.happening}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
            Признаки
          </p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-terminal-muted">
            {phase.signs.map((s) => (
              <li key={s} className="flex gap-1.5">
                <span className="text-cyan/60">—</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
            Что делать
          </p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-terminal-muted">
            {phase.actions.map((a) => (
              <li key={a} className="flex gap-1.5">
                <span className="text-cyan/60">—</span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border border-terminal-border/50 bg-[#080E18]/60 px-2.5 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
            Что это значит для выбора инструмента
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-cyan/85">
            {phase.instrumentPickHint}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-end gap-2">
        {onShowMode ? (
          <button
            type="button"
            onClick={onShowMode}
            className={cn(
              "whitespace-nowrap rounded border px-3 py-2 text-[11px] font-medium transition-colors",
              modeActive
                ? "border-green/40 bg-green/10 text-green"
                : "border-cyan/30 bg-cyan/10 text-cyan hover:bg-cyan/15",
            )}
          >
            Режим: {MODE_LABELS[phase.primaryMode]}
            {modeActive ? " ✓" : ""}
          </button>
        ) : (
          <p className="text-[10px] text-terminal-muted">
            Выберите режим «{phase.screenerModeLabel.split("/")[0]?.trim()}» ниже
          </p>
        )}
      </div>
    </div>
  );
}

export type { CyclePhaseId };
