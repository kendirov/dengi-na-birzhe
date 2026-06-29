"use client";

import { useCallback, useMemo, useState } from "react";
import type { ScreenerMode } from "@/lib/types/screener";
import {
  CYCLE_PHASES_LIVE,
  CHART,
  CHART_SCALE,
  LEVELS_Y,
  SCENE_CANDLES,
  getPhase,
  type CyclePhase,
  type CyclePhaseId,
  type SceneCandle,
} from "@/lib/screener/cycle-chart-data";
import { cn } from "@/lib/utils/format";

const MODE_LABELS: Record<ScreenerMode, string> = {
  all: "Все",
  training: "Обучение",
  technical: "Техничные",
  spread: "Стакан",
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
  body: "rgba(34, 211, 238, 0.88)",
  bodyDim: "rgba(34, 211, 238, 0.28)",
  wick: "rgba(148, 163, 184, 0.55)",
  wickDim: "rgba(148, 163, 184, 0.22)",
};

const CANDLE_DOWN = {
  body: "rgba(248, 113, 113, 0.82)",
  bodyDim: "rgba(248, 113, 113, 0.26)",
  wick: "rgba(148, 163, 184, 0.5)",
  wickDim: "rgba(148, 163, 184, 0.2)",
};

const VOL_NORMAL = "rgba(245, 158, 11, 0.45)";
const VOL_HIGH = "rgba(245, 158, 11, 0.85)";
const VOL_LOW = "rgba(245, 158, 11, 0.22)";

interface InstrumentCycleSceneProps {
  activeMode?: ScreenerMode;
  onSelectMode?: (mode: ScreenerMode) => void;
}

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

      <div className="overflow-x-auto scrollbar-terminal rounded-lg border border-terminal-border/60 bg-[#04070D]">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="min-w-[840px] w-full h-auto"
          role="img"
          aria-label="Учебный replay: фазы рынка"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => {
            setHoverId(null);
            setTooltip(null);
          }}
        >
          <rect x={0} y={0} width={CHART.width} height={CHART.height} fill="#070B12" />

          <ChartGrid />
          <PriceScaleLabels />

          {CYCLE_PHASES_LIVE.map((phase) => (
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
          <ConsolidationWedge highlightId={highlightId} />

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

          {realCandles.map((candle, i) => (
            <VolumeBarShape
              key={`v-${i}`}
              candle={candle}
              highlighted={highlightId === candle.phaseId}
              dimmed={highlightId !== candle.phaseId}
            />
          ))}

          <VolumeSeparator highlightId={highlightId} />

          {CYCLE_PHASES_LIVE.map((phase) => (
            <text
              key={`label-${phase.id}`}
              x={(phase.xStart + phase.xEnd) / 2}
              y={18}
              textAnchor="middle"
              fill={
                highlightId === phase.id
                  ? "rgba(226, 232, 240, 0.95)"
                  : "rgba(100, 116, 139, 0.65)"
              }
              fontSize={10}
              fontWeight={highlightId === phase.id ? 600 : 400}
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
              x={candle.cx - CHART.candleWidth - 2}
              y={CHART.priceTop}
              width={CHART.candleWidth * 2 + 4}
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
        {CYCLE_PHASES_LIVE.map((phase) => (
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
      <div>
        <span className="text-[11px] font-medium text-terminal-text/90">
          Рыночный replay — фазы инструмента
        </span>
        <p className="mt-0.5 text-[10px] text-terminal-muted">
          Свечи + объём. Наведите или кликните фазу.
        </p>
      </div>
      <div className="text-right">
        <p className={cn("text-[11px] font-semibold", TONE_TEXT[shown.tone])}>
          {shown.title}
        </p>
        <p className="text-[10px] text-terminal-muted">{shown.subtitle}</p>
      </div>
    </div>
  );
}

function ChartGrid() {
  const hCount = 6;
  const hLines = Array.from({ length: hCount }, (_, i) =>
    CHART.priceTop + (CHART.priceHeight / (hCount - 1)) * i,
  );
  const vCount = 14;
  const vStep = (CHART.width - CHART.paddingLeft - CHART.paddingRight) / vCount;

  return (
    <g opacity={0.08} className="pointer-events-none">
      {hLines.map((y) => (
        <line
          key={`h-${y}`}
          x1={CHART.paddingLeft}
          y1={y}
          x2={CHART.width - CHART.paddingRight}
          y2={y}
          stroke="rgba(148, 163, 184, 0.9)"
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: vCount + 1 }, (_, i) => {
        const x = CHART.paddingLeft + vStep * i;
        return (
          <line
            key={`v-${x}`}
            x1={x}
            y1={CHART.priceTop}
            x2={x}
            y2={CHART.volumeBottom}
            stroke="rgba(148, 163, 184, 0.7)"
            strokeWidth={0.5}
          />
        );
      })}
    </g>
  );
}

function PriceScaleLabels() {
  const { minPrice, maxPrice } = CHART_SCALE;
  const steps = 5;
  const labels = Array.from({ length: steps }, (_, i) => {
    const price = maxPrice - ((maxPrice - minPrice) / (steps - 1)) * i;
    const y = CHART.priceTop + (CHART.priceHeight / (steps - 1)) * i;
    return { price, y };
  });

  return (
    <g className="pointer-events-none select-none">
      {labels.map(({ price, y }) => (
        <text
          key={price}
          x={CHART.width - CHART.paddingRight + 8}
          y={y + 3}
          fill="rgba(100, 116, 139, 0.55)"
          fontSize={8}
          fontFamily="monospace"
        >
          {price.toFixed(0)}
        </text>
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
  const isWarning = phase.id === "acceleration" || phase.id === "breakout";

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(phase.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(phase.id)}
    >
      <rect
        x={phase.xStart}
        y={CHART.priceTop}
        width={w}
        height={CHART.priceBottom - CHART.priceTop}
        fill={phase.zoneColor}
        opacity={highlighted ? 0.35 : 0.1}
        className="transition-opacity duration-200"
      />
      {active && (
        <rect
          x={phase.xStart}
          y={CHART.priceTop}
          width={w}
          height={2}
          fill={TONE_STROKE[phase.tone]}
        />
      )}
      {highlighted && (
        <rect
          x={phase.xStart}
          y={CHART.priceTop}
          width={w}
          height={CHART.priceBottom - CHART.priceTop}
          fill="none"
          stroke={isWarning ? "rgba(251, 191, 36, 0.35)" : "rgba(34, 211, 238, 0.25)"}
          strokeWidth={1}
        />
      )}
    </g>
  );
}

function LevelAnnotations({ highlightId }: { highlightId: CyclePhaseId }) {
  const L = LEVELS_Y;
  const rangePhase = CYCLE_PHASES_LIVE.find((p) => p.id === "wideRange");
  const rangeX1 = rangePhase?.xStart ?? 700;
  const rangeX2 = rangePhase?.xEnd ?? 900;

  return (
    <g className="pointer-events-none select-none">
      <LevelLine y={L.sidewaysHigh} label="боковик high" x1={CHART.paddingLeft} x2={rangeX1 * 0.35} />
      <LevelLine y={L.sidewaysLow} label="боковик low" x1={CHART.paddingLeft} x2={rangeX1 * 0.35} dashed />

      <LevelLine y={L.peakHigh} label="HIGH" x1={420} x2={560} tone="amber" />
      <LevelLine y={L.correctionLow} label="correction low" x1={560} x2={680} tone="cyan" />

      <rect
        x={rangeX1}
        y={L.rangeHigh}
        width={rangeX2 - rangeX1}
        height={L.rangeLow - L.rangeHigh}
        fill="rgba(100, 116, 139, 0.06)"
        stroke="rgba(100, 116, 139, 0.4)"
        strokeWidth={1}
        strokeDasharray="5 4"
      />
      <LevelLine y={L.rangeHigh} label="верх диапазона" x1={rangeX1} x2={rangeX2} />
      <LevelLine y={L.rangeLow} label="низ диапазона" x1={rangeX1} x2={rangeX2} dashed />

      <LevelLine y={L.breakoutLevel} label="уровень выноса" x1={rangeX2 - 20} x2={CHART.width - 120} tone="amber" />

      <line
        x1={520}
        y1={L.peakHigh}
        x2={640}
        y2={L.correctionLow}
        stroke="rgba(251, 191, 36, 0.5)"
        strokeWidth={1.2}
        strokeDasharray="4 3"
      />
      <text x={548} y={(L.peakHigh + L.correctionLow) / 2} fill="rgba(251, 191, 36, 0.8)" fontSize={9}>
        коррекция ~30%
      </text>

      {highlightId === "impulse" && (
        <text x={200} y={CHART.priceTop + 24} fill="rgba(245, 158, 11, 0.9)" fontSize={9}>
          объём ×5–10
        </text>
      )}
      {highlightId === "rangeBase" && (
        <text x={CHART.paddingLeft} y={CHART.priceBottom - 8} fill="rgba(100, 116, 139, 0.75)" fontSize={9}>
          низкий объём
        </text>
      )}
      {highlightId === "consolidation" && (
        <text x={1180} y={CHART.priceTop + 20} fill="rgba(167, 139, 250, 0.8)" fontSize={9}>
          объём снижается
        </text>
      )}
    </g>
  );
}

function ConsolidationWedge({ highlightId }: { highlightId: CyclePhaseId }) {
  const phase = CYCLE_PHASES_LIVE.find((p) => p.id === "consolidation");
  if (!phase) return null;
  const x1 = phase.xStart + 10;
  const x2 = phase.xEnd - 10;
  const yTopStart = LEVELS_Y.rangeHigh - 20;
  const yTopEnd = LEVELS_Y.peakHigh + 30;
  const yBotStart = LEVELS_Y.correctionLow + 10;
  const yBotEnd = LEVELS_Y.rangeLow - 15;
  const active = highlightId === "consolidation";

  return (
    <g opacity={active ? 0.55 : 0.25} className="pointer-events-none">
      <polygon
        points={`${x1},${yTopStart} ${x2},${yTopEnd} ${x2},${yBotEnd} ${x1},${yBotStart}`}
        fill="none"
        stroke="rgba(167, 139, 250, 0.45)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
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
      ? "rgba(251, 191, 36, 0.5)"
      : tone === "cyan"
        ? "rgba(34, 211, 238, 0.45)"
        : "rgba(100, 116, 139, 0.38)";
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
      <text x={x1 + 4} y={y - 4} fill="rgba(100, 116, 139, 0.6)" fontSize={8}>
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
  const bodyH = Math.max(Math.abs(candle.close - candle.open), 1.4);
  const opacity = ghost ? 0.5 : dimmed ? 0.32 : 1;
  const bodyFill = ghost ? "none" : highlighted ? palette.body : palette.bodyDim;
  const wickStroke = highlighted ? palette.wick : palette.wickDim;
  const width = ghost ? CHART.candleWidth - 1 : CHART.candleWidth;

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
        x={candle.cx - width / 2}
        y={bodyTop}
        width={width}
        height={bodyH}
        fill={bodyFill}
        stroke={ghost ? "rgba(248, 113, 113, 0.55)" : "none"}
        strokeWidth={ghost ? 0.8 : 0}
        strokeDasharray={ghost ? "2 1" : undefined}
        rx={0.5}
      />
    </g>
  );
}

function volumeFill(volume: number, highlighted: boolean, dimmed: boolean): string {
  if (dimmed) return VOL_LOW;
  if (volume >= 0.75) return VOL_HIGH;
  if (volume >= 0.35) return highlighted ? "rgba(245, 158, 11, 0.72)" : VOL_NORMAL;
  return VOL_LOW;
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
  const isConsolidation = candle.phaseId === "consolidation";

  return (
    <rect
      x={candle.cx - CHART.candleWidth / 2}
      y={CHART.volBaseY - h}
      width={CHART.candleWidth}
      height={Math.max(h, 1)}
      fill={volumeFill(candle.volume, highlighted, dimmed || isConsolidation)}
      opacity={dimmed ? 0.35 : highlighted ? 1 : 0.78}
      rx={0.5}
      className="transition-opacity duration-200"
    />
  );
}

function VolumeSeparator({ highlightId }: { highlightId: CyclePhaseId }) {
  const phase = getPhase(highlightId);
  return (
    <g className="pointer-events-none select-none">
      <line
        x1={CHART.paddingLeft}
        y1={CHART.volumeTop}
        x2={CHART.width - CHART.paddingRight}
        y2={CHART.volumeTop}
        stroke="rgba(30, 41, 59, 0.95)"
        strokeWidth={1}
      />
      <text x={CHART.paddingLeft} y={CHART.volumeTop + 14} fill="rgba(100, 116, 139, 0.65)" fontSize={9}>
        объём
      </text>
      {phase.volumeHint && (
        <text
          x={CHART.paddingLeft + 48}
          y={CHART.volumeTop + 14}
          fill="rgba(245, 158, 11, 0.75)"
          fontSize={9}
        >
          · {phase.volumeHint}
        </text>
      )}
    </g>
  );
}

function PhaseMarkers({ highlightId }: { highlightId: CyclePhaseId }) {
  const breakoutPhase = CYCLE_PHASES_LIVE.find((p) => p.id === "breakout");
  const bx = breakoutPhase ? (breakoutPhase.xStart + breakoutPhase.xEnd) / 2 : 950;
  const breakoutOn = highlightId === "breakout";

  return (
    <g className="pointer-events-none select-none">
      <MarkerTag x={bx - 40} y={LEVELS_Y.breakoutLevel + 28} label="возврат" tone="red" active={breakoutOn} />
      <MarkerTag x={bx + 30} y={LEVELS_Y.breakoutLevel - 12} label="невозврат" tone="green" active={breakoutOn} />
      {highlightId === "impulse" && (
        <MarkerTag x={210} y={CHART.priceBottom - 16} label="импульс" tone="cyan" active />
      )}
      {highlightId === "wideRange" && (
        <MarkerTag x={780} y={LEVELS_Y.rangeHigh - 10} label="границы" tone="muted" active />
      )}
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
    cyan: "rgba(34, 211, 238, 0.85)",
    green: "rgba(52, 211, 153, 0.9)",
    red: "rgba(248, 113, 113, 0.9)",
    amber: "rgba(251, 191, 36, 0.9)",
    muted: "rgba(100, 116, 139, 0.75)",
    violet: "rgba(167, 139, 250, 0.85)",
  };
  return (
    <text x={x} y={y} fill={colors[tone]} fontSize={8} fontWeight={active ? 600 : 400} opacity={active ? 1 : 0.6}>
      {label}
    </text>
  );
}

function PhaseTooltip({ phase, x, y }: { phase: CyclePhase; x: number; y: number }) {
  const tx = Math.min(Math.max(x - 72, 8), CHART.width - 152);
  const ty = Math.max(y - 68, 24);
  return (
    <g className="pointer-events-none">
      <rect
        x={tx}
        y={ty}
        width={144}
        height={58}
        rx={4}
        fill="rgba(4, 7, 13, 0.94)"
        stroke="rgba(34, 211, 238, 0.28)"
        strokeWidth={1}
      />
      <text x={tx + 8} y={ty + 14} fill="rgba(226, 232, 240, 0.95)" fontSize={9} fontWeight={600}>
        {phase.title}
      </text>
      <text x={tx + 8} y={ty + 28} fill="rgba(100, 116, 139, 0.9)" fontSize={8}>
        {phase.subtitle}
      </text>
      <text x={tx + 8} y={ty + 44} fill="rgba(34, 211, 238, 0.75)" fontSize={8}>
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

        <div className="rounded border border-cyan/20 bg-cyan/[0.04] px-2.5 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-terminal-muted">
            Что смотреть в скринере
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-cyan/90">
            {phase.screenerModeLabel}. {phase.instrumentPickHint}
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
            Режим «{phase.screenerModeLabel.split("/")[0]?.trim()}» — ниже
          </p>
        )}
      </div>
    </div>
  );
}

export type { CyclePhaseId };
