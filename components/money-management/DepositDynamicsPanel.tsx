"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateDepositProjection,
  getWeekTemplate,
  WEEK_TEMPLATES,
  type WeekTemplateId,
} from "@/lib/money-management/deposit-projection";
import type { DailyPlanUiInput, DailyPlanUiResult } from "@/lib/money-management/types";
import { formatPercent, formatRub } from "@/lib/money-management/format";
import { TrainerInput } from "@/components/trainer";
import { cn } from "@/lib/utils/format";

interface DepositDynamicsPanelProps {
  planInput: DailyPlanUiInput;
  plan: DailyPlanUiResult;
}

const HORIZON_OPTIONS = [4, 8, 12] as const;

export function DepositDynamicsPanel({
  planInput,
  plan,
}: DepositDynamicsPanelProps) {
  const [weeks, setWeeks] = useState<(typeof HORIZON_OPTIONS)[number]>(8);
  const [templateId, setTemplateId] = useState<WeekTemplateId>("mixed");
  const [profitableDays, setProfitableDays] = useState(2);
  const [losingDays, setLosingDays] = useState(2);
  const [neutralDays, setNeutralDays] = useState(1);

  const applyTemplate = (id: WeekTemplateId) => {
    const t = getWeekTemplate(id);
    setTemplateId(id);
    setProfitableDays(t.profitableDays);
    setLosingDays(t.losingDays);
    setNeutralDays(t.neutralDays);
  };

  const projection = useMemo(
    () =>
      calculateDepositProjection({
        startDepositRub: planInput.depositRub,
        targetRub: plan.targetRub,
        dailyDrawdownRub: plan.dailyDrawdownRub,
        profitableDaysPerWeek: profitableDays,
        losingDaysPerWeek: losingDays,
        neutralDaysPerWeek: neutralDays,
        weeks,
      }),
    [
      planInput.depositRub,
      plan.targetRub,
      plan.dailyDrawdownRub,
      profitableDays,
      losingDays,
      neutralDays,
      weeks,
    ],
  );

  const chartData = projection.points.map((p) => ({
    ...p,
    fill: p.deltaRub > 0 ? "#34d399" : p.deltaRub < 0 ? "#f87171" : "#64748b",
  }));

  return (
    <div className="space-y-3 rounded-xl border border-terminal-border/70 bg-terminal-card/30 px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-terminal-text">
          Динамика депозита
        </h2>
        <div className="flex gap-1">
          {HORIZON_OPTIONS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeeks(w)}
              className={cn(
                "rounded border px-2 py-1 font-mono text-[10px] transition-colors",
                weeks === w
                  ? "border-cyan/40 bg-cyan/10 text-cyan"
                  : "border-terminal-border text-terminal-muted hover:text-terminal-text",
              )}
            >
              {w} нед.
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {WEEK_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => applyTemplate(t.id)}
            className={cn(
              "rounded border px-2.5 py-1 font-mono text-[10px] transition-colors",
              templateId === t.id
                ? "border-green/35 bg-green/10 text-green"
                : "border-terminal-border text-terminal-muted hover:text-terminal-text",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <TrainerInput
          label="Прибыльных дней / нед."
          value={profitableDays}
          onChange={setProfitableDays}
          min={0}
          max={5}
          step={1}
          tone="green"
        />
        <TrainerInput
          label="Убыточных дней / нед."
          value={losingDays}
          onChange={setLosingDays}
          min={0}
          max={5}
          step={1}
          tone="red"
        />
        <TrainerInput
          label="Нейтральных дней / нед."
          value={neutralDays}
          onChange={setNeutralDays}
          min={0}
          max={5}
          step={1}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={{ stroke: "#141c2a" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={{ stroke: "#141c2a" }}
                tickLine={false}
                width={56}
                tickFormatter={(v) => `${Math.round(v)}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#08111e",
                  border: "1px solid #141c2a",
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
                formatter={(value) => [
                  formatRub(typeof value === "number" ? value : 0),
                  "Депозит",
                ]}
                labelFormatter={(label) => `День ${label}`}
              />
              <ReferenceLine
                y={planInput.depositRub}
                stroke="#64748b"
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="depositRub"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const color =
                    payload.deltaRub > 0
                      ? "#34d399"
                      : payload.deltaRub < 0
                        ? "#f87171"
                        : "#64748b";
                  return (
                    <circle
                      key={`dot-${payload.day}`}
                      cx={cx}
                      cy={cy}
                      r={payload.day === 0 ? 0 : 3}
                      fill={color}
                      stroke={color}
                    />
                  );
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 rounded-lg border border-terminal-border/60 bg-terminal-bg/40 p-2.5">
          <MetricRow
            label={`Итог через ${weeks} нед.`}
            value={formatRub(projection.endDepositRub)}
            tone={projection.changeRub >= 0 ? "green" : "red"}
          />
          <MetricRow
            label="Изменение"
            value={`${projection.changeRub >= 0 ? "+" : ""}${formatRub(projection.changeRub)}`}
            tone={projection.changeRub >= 0 ? "green" : "red"}
          />
          <MetricRow
            label="Доходность"
            value={formatPercent(projection.changePct)}
            tone={projection.changePct >= 0 ? "green" : "red"}
          />
          <MetricRow
            label="Средний нед. результат"
            value={`${projection.avgWeeklyRub >= 0 ? "+" : ""}${formatRub(projection.avgWeeklyRub)}`}
          />
          <MetricRow
            label="Макс. ожид. просадка"
            value={formatRub(projection.maxDrawdownRub)}
            tone="red"
          />
          <div className="border-t border-terminal-border/50 pt-2 font-mono text-[10px] text-terminal-muted">
            Старт: {formatRub(planInput.depositRub)} → Финиш:{" "}
            {formatRub(projection.endDepositRub)}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "red";
}) {
  const color =
    tone === "green" ? "text-green" : tone === "red" ? "text-red" : "text-terminal-text";

  return (
    <div className="flex items-baseline justify-between gap-2 font-mono text-[11px]">
      <span className="text-terminal-muted">{label}</span>
      <span className={cn("tabular-nums font-semibold", color)}>{value}</span>
    </div>
  );
}
