import type { EnrichedInstrument } from "@/lib/types/instrument";
import {
  buildOrderBookUniverseContext,
  isFundLikeInstrument,
  isOrderBookCandidate,
} from "@/lib/screener/order-book";

export type TrainingRole = "technical" | "orderbook" | "beginner" | "dangerous";

export type TrainingVerdict = "yes" | "caution" | "no";

export interface TrainingPickMeta {
  role: TrainingRole;
  roleLabel: string;
  verdict: TrainingVerdict;
  verdictLabel: string;
  lesson: string;
}

export interface TrainingPick extends TrainingPickMeta {
  instrument: EnrichedInstrument;
}

const ROLE_LABELS: Record<TrainingRole, string> = {
  technical: "пример техничного",
  orderbook: "пример стакана",
  beginner: "пример новичку",
  dangerous: "пример опасного",
};

const PER_CATEGORY = 3;
const TARGET_TOTAL = 12;

function notFund(inst: EnrichedInstrument): boolean {
  return !isFundLikeInstrument(inst);
}

function isTechnicalExample(inst: EnrichedInstrument): boolean {
  return (
    notFund(inst) &&
    inst.technicalScore >= 58 &&
    inst.liquidityScore >= 50 &&
    (inst.dayRangePct ?? 0) >= 1.2 &&
    inst.trades >= 500 &&
    inst.turnoverRub >= 2_000_000 &&
    (inst.spreadPct === null || inst.spreadPct < 0.12)
  );
}

function isBeginnerExample(inst: EnrichedInstrument): boolean {
  return (
    notFund(inst) &&
    inst.beginnerScore >= 58 &&
    inst.lotValue <= 450_000 &&
    inst.trades >= 400 &&
    (inst.spreadPct === null || inst.spreadPct < 0.14) &&
    inst.tickValueRub !== null &&
    inst.tickValueRub <= 120
  );
}

function isDangerousExample(inst: EnrichedInstrument): boolean {
  const wideSpread = inst.spreadPct !== null && inst.spreadPct >= 0.08;
  const lowTrades = inst.trades < 1500;
  const expensiveLot = inst.lotValue >= 350_000;
  const badLiquidity = inst.liquidityScore < 45;
  return (
    inst.dangerousScore >= 50 &&
    (wideSpread || lowTrades || expensiveLot || badLiquidity)
  );
}

function technicalLesson(inst: EnrichedInstrument): string {
  return `Хороший пример для графика: диапазон ${inst.dayRangePct?.toFixed(1) ?? "—"}%, оборот и сделки есть, spread не главный риск.`;
}

function orderbookLesson(inst: EnrichedInstrument): string {
  const pts = inst.spreadTicks?.toFixed(0) ?? "—";
  return `Пример для стакана: spread ${pts} п., сделки и оборот есть — но bid/ask проверить в приводе.`;
}

function beginnerLesson(inst: EnrichedInstrument): string {
  return `Для тренировки: лот ${inst.lotValue <= 200_000 ? "понятный" : "умеренный"}, шаг/лот доступен, есть сделки для наблюдения.`;
}

function dangerousLesson(inst: EnrichedInstrument): string {
  const parts: string[] = [];
  if (inst.spreadPct !== null && inst.spreadPct >= 0.08) parts.push("широкий spread");
  if (inst.trades < 1500) parts.push("мало сделок");
  if (inst.lotValue >= 350_000) parts.push("дорогой лот");
  if (isFundLikeInstrument(inst)) parts.push("фонд/ETF — не для первых сделок");
  const why = parts.length ? parts.join(", ") : "плохие условия входа";
  return `Опасный пример: ${why}. Движение может быть, но вход дорогой или рискованный.`;
}

function pickUnique(
  candidates: EnrichedInstrument[],
  used: Set<string>,
  count: number,
  score: (i: EnrichedInstrument) => number,
): EnrichedInstrument[] {
  return [...candidates]
    .sort((a, b) => score(b) - score(a))
    .filter((i) => !used.has(i.ticker))
    .slice(0, count);
}

export function buildTrainingSelection(
  instruments: EnrichedInstrument[],
): TrainingPick[] {
  const orderBookCtx = buildOrderBookUniverseContext(instruments);
  const used = new Set<string>();
  const picks: TrainingPick[] = [];

  const add = (
    list: EnrichedInstrument[],
    role: TrainingRole,
    verdict: TrainingVerdict,
    verdictLabel: string,
    lessonFn: (i: EnrichedInstrument) => string,
    score: (i: EnrichedInstrument) => number,
    count = PER_CATEGORY,
  ) => {
    const selected = pickUnique(list, used, count, score);
    for (const inst of selected) {
      used.add(inst.ticker);
      picks.push({
        instrument: inst,
        role,
        roleLabel: ROLE_LABELS[role],
        verdict,
        verdictLabel,
        lesson: lessonFn(inst),
      });
    }
  };

  add(
    instruments.filter(isTechnicalExample),
    "technical",
    "yes",
    "почему да",
    technicalLesson,
    (i) => i.technicalScore,
  );

  add(
    instruments.filter((i) => isOrderBookCandidate(i, orderBookCtx) && notFund(i)),
    "orderbook",
    "caution",
    "почему осторожно",
    orderbookLesson,
    (i) => i.spreadTradingScore,
  );

  add(
    instruments.filter(isBeginnerExample),
    "beginner",
    "yes",
    "почему да",
    beginnerLesson,
    (i) => i.beginnerScore,
  );

  add(
    instruments.filter(isDangerousExample),
    "dangerous",
    "no",
    "почему нет",
    dangerousLesson,
    (i) => i.dangerousScore,
  );

  if (picks.length < TARGET_TOTAL) {
    const remaining = instruments.filter((i) => !used.has(i.ticker));
    const fallbackRoles: TrainingRole[] = [
      "technical",
      "orderbook",
      "beginner",
      "dangerous",
    ];
    for (const role of fallbackRoles) {
      if (picks.filter((p) => p.role === role).length >= PER_CATEGORY) continue;
      const need = PER_CATEGORY - picks.filter((p) => p.role === role).length;
      const pool = remaining.filter((i) => !used.has(i.ticker));
      const score =
        role === "technical"
          ? (i: EnrichedInstrument) => i.technicalScore
          : role === "orderbook"
            ? (i: EnrichedInstrument) => i.spreadTradingScore
            : role === "beginner"
              ? (i: EnrichedInstrument) => i.beginnerScore
              : (i: EnrichedInstrument) => i.dangerousScore;
      const lessonFn =
        role === "technical"
          ? technicalLesson
          : role === "orderbook"
            ? orderbookLesson
            : role === "beginner"
              ? beginnerLesson
              : dangerousLesson;
      const verdict =
        role === "dangerous" ? "no" : role === "orderbook" ? "caution" : "yes";
      const verdictLabel =
        role === "dangerous"
          ? "почему нет"
          : role === "orderbook"
            ? "почему осторожно"
            : "почему да";

      for (const inst of pickUnique(pool, used, need, score)) {
        used.add(inst.ticker);
        picks.push({
          instrument: inst,
          role,
          roleLabel: ROLE_LABELS[role],
          verdict,
          verdictLabel,
          lesson: lessonFn(inst),
        });
      }
    }
  }

  const roleOrder: TrainingRole[] = [
    "technical",
    "orderbook",
    "beginner",
    "dangerous",
  ];
  return picks.sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
  );
}

export function trainingMetaMap(
  picks: TrainingPick[],
): Map<string, TrainingPickMeta> {
  return new Map(picks.map((p) => [p.instrument.ticker, p]));
}

export function getTrainingInstruments(
  instruments: EnrichedInstrument[],
): EnrichedInstrument[] {
  return buildTrainingSelection(instruments).map((p) => p.instrument);
}
