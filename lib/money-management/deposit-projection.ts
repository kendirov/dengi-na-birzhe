export type WeekTemplateId = "good" | "mixed" | "weak";

export interface WeekTemplate {
  id: WeekTemplateId;
  label: string;
  profitableDays: number;
  losingDays: number;
  neutralDays: number;
}

export const WEEK_TEMPLATES: WeekTemplate[] = [
  {
    id: "good",
    label: "Хорошая неделя",
    profitableDays: 3,
    losingDays: 1,
    neutralDays: 1,
  },
  {
    id: "mixed",
    label: "Смешанная неделя",
    profitableDays: 2,
    losingDays: 2,
    neutralDays: 1,
  },
  {
    id: "weak",
    label: "Слабая неделя",
    profitableDays: 1,
    losingDays: 3,
    neutralDays: 1,
  },
];

export interface DepositProjectionInput {
  startDepositRub: number;
  targetRub: number;
  dailyDrawdownRub: number;
  profitableDaysPerWeek: number;
  losingDaysPerWeek: number;
  neutralDaysPerWeek: number;
  weeks: number;
}

export interface DepositDayPoint {
  day: number;
  week: number;
  depositRub: number;
  deltaRub: number;
  label: string;
}

export interface DepositProjectionResult {
  points: DepositDayPoint[];
  endDepositRub: number;
  changeRub: number;
  changePct: number;
  avgWeeklyRub: number;
  maxDrawdownRub: number;
}

function buildDayDeltas(input: DepositProjectionInput): number[] {
  const deltas: number[] = [];
  const {
    targetRub,
    dailyDrawdownRub,
    profitableDaysPerWeek,
    losingDaysPerWeek,
    neutralDaysPerWeek,
    weeks,
  } = input;

  for (let w = 0; w < weeks; w += 1) {
    for (let i = 0; i < profitableDaysPerWeek; i += 1) {
      deltas.push(targetRub);
    }
    for (let i = 0; i < losingDaysPerWeek; i += 1) {
      deltas.push(-dailyDrawdownRub);
    }
    for (let i = 0; i < neutralDaysPerWeek; i += 1) {
      deltas.push(0);
    }
  }
  return deltas;
}

export function calculateDepositProjection(
  input: DepositProjectionInput,
): DepositProjectionResult {
  const start = Math.max(0, input.startDepositRub);
  const deltas = buildDayDeltas(input);
  const points: DepositDayPoint[] = [
    {
      day: 0,
      week: 0,
      depositRub: start,
      deltaRub: 0,
      label: "Старт",
    },
  ];

  let deposit = start;
  let peak = start;
  let maxDrawdownRub = 0;

  deltas.forEach((delta, index) => {
    deposit += delta;
    peak = Math.max(peak, deposit);
    maxDrawdownRub = Math.max(maxDrawdownRub, peak - deposit);

    points.push({
      day: index + 1,
      week: Math.ceil((index + 1) / 5),
      depositRub: deposit,
      deltaRub: delta,
      label: `Д${index + 1}`,
    });
  });

  const endDepositRub = deposit;
  const changeRub = endDepositRub - start;
  const changePct = start > 0 ? (changeRub / start) * 100 : 0;
  const avgWeeklyRub = input.weeks > 0 ? changeRub / input.weeks : 0;

  return {
    points,
    endDepositRub,
    changeRub,
    changePct,
    avgWeeklyRub,
    maxDrawdownRub,
  };
}

export function getWeekTemplate(id: WeekTemplateId): WeekTemplate {
  return WEEK_TEMPLATES.find((t) => t.id === id) ?? WEEK_TEMPLATES[1];
}
