import type { EnrichedInstrument } from "@/lib/types/instrument";
import { formatRub, formatNumber } from "@/lib/utils/format";

export type InstrumentDecisionStatus = "study" | "orderbook" | "skip";

export interface InstrumentDecision {
  status: InstrumentDecisionStatus;
  label: string;
  message: string;
}

export interface ErrorPriceSummary {
  oneStepRub: number | null;
  fiveStepRub: number | null;
  spreadPoints: number | null;
  spreadRub: number | null;
  limitEntryPoints: number | null;
  marketEntryPoints: number | null;
  limitEntryRub: number | null;
  marketEntryRub: number | null;
}

export function buildErrorPriceSummary(
  inst: EnrichedInstrument,
): ErrorPriceSummary {
  const oneStepRub = inst.tickValueRub;
  const fiveStepRub = oneStepRub !== null ? oneStepRub * 5 : null;
  const spreadPoints = inst.spreadTicks;
  const limitEntryPoints = inst.commissionLimitTicks;
  const marketEntryPoints =
    spreadPoints !== null && inst.commissionMarketTicks !== null
      ? spreadPoints + inst.commissionMarketTicks
      : inst.entryCostMarketTicks;

  return {
    oneStepRub,
    fiveStepRub,
    spreadPoints,
    spreadRub: inst.spreadRub,
    limitEntryPoints,
    marketEntryPoints,
    limitEntryRub: inst.commissionLimitRub,
    marketEntryRub: inst.entryCostMarketRub,
  };
}

function hasLiveQuotes(inst: EnrichedInstrument): boolean {
  return inst.bid !== null && inst.ask !== null && inst.spreadRub !== null;
}

function isExtremeSpread(inst: EnrichedInstrument): boolean {
  if (inst.spreadPct !== null && inst.spreadPct >= 0.12) return true;
  if (inst.spreadTicks !== null && inst.spreadTicks >= 8) return true;
  return false;
}

function isLowActivity(inst: EnrichedInstrument): boolean {
  if (inst.trades < 800) return true;
  if (inst.turnoverRub < 5_000_000) return true;
  return false;
}

function isExpensiveError(inst: EnrichedInstrument): boolean {
  if (inst.tickValueRub !== null && inst.tickValueRub >= 50) return true;
  if (inst.lotValue >= 400_000) return true;
  if (
    inst.entryCostMarketRub !== null &&
    inst.entryCostMarketRub >= inst.lotValue * 0.002
  ) {
    return true;
  }
  return false;
}

export function getInstrumentDecision(
  inst: EnrichedInstrument,
): InstrumentDecision {
  if (!hasLiveQuotes(inst)) {
    return {
      status: "orderbook",
      label: "Только через стакан",
      message:
        "Спред недоступен: MOEX не отдал bid/ask по инструменту. Проверьте в приводе.",
    };
  }

  if (isLowActivity(inst) || isExtremeSpread(inst) || isExpensiveError(inst)) {
    const parts: string[] = [];
    if (isLowActivity(inst)) parts.push("мало сделок или слабый оборот");
    if (isExtremeSpread(inst)) parts.push("spread слишком широкий");
    if (isExpensiveError(inst)) parts.push("цена ошибки высокая");
    if (!hasLiveQuotes(inst)) parts.push("нет нормального spread");

    return {
      status: "skip",
      label: "Пропустить",
      message: `Пропустить: ${parts.slice(0, 2).join("; ")}.`,
    };
  }

  const spreadNoticeable =
    inst.spreadTicks !== null && inst.spreadTicks >= 2;

  if (spreadNoticeable) {
    return {
      status: "orderbook",
      label: "Только через стакан",
      message: `Только через стакан: spread ${inst.spreadTicks!.toFixed(0)} п., нужно проверить bid/ask и ленту.`,
    };
  }

  const tickLabel =
    inst.tickValueRub !== null ? formatRub(inst.tickValueRub) : "понятная";

  return {
    status: "study",
    label: "Можно изучать",
    message: `Можно изучать: ${formatNumber(inst.trades)} сделок, оборот ${formatRub(inst.turnoverRub, true)}, шаг/лот ${tickLabel}.`,
  };
}

export const ORDER_BOOK_CHECKLIST = [
  "Проверить bid/ask",
  "Проверить, не снялись ли плотности",
  "Проверить, есть ли сделки в ленте",
  "Не входить, если spread расширился перед входом",
] as const;

export const DRIVE_CHECKLIST = [
  "Bid/Ask живые, не пустые.",
  "Спред не расширился перед входом.",
  "В ленте есть сделки, а не одиночные принты.",
  "Плотность не снялась при подходе цены.",
  "Понимаю, где выход, если цена пошла против.",
  "Комиссия и spread не съедают идею.",
] as const;
