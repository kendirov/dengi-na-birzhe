import type { EnrichedInstrument } from "@/lib/types/instrument";

import { formatRub, formatNumber } from "@/lib/utils/format";

export function buildWhyBullets(inst: EnrichedInstrument): string[] {
  const bullets: string[] = [];

  if (
    inst.trades >= 10000 &&
    inst.spreadPct !== null &&
    inst.spreadPct < 0.06
  ) {
    bullets.push("Много сделок, узкий спред, нормальный оборот.");
  } else if (
    inst.hasHistoricalBaseline &&
    inst.avgTurnover20d !== null &&
    inst.turnoverRub > inst.avgTurnover20d
  ) {
    bullets.push("Оборот выше среднего — инструмент активен сегодня.");
  } else if (!inst.hasHistoricalBaseline) {
    bullets.push(
      "Нет исторической базы — оценка по текущему обороту и сделкам.",
    );
  } else {
    bullets.push(
      `Оборот ${formatRub(inst.turnoverRub, true)}, ${formatNumber(inst.trades)} сделок.`,
    );
  }

  bullets.push(
    `Шаг/лот ${inst.tickValueRub !== null ? formatRub(inst.tickValueRub) : "—"} — рублей за 1 минимальный шаг цены.`,
  );

  if (inst.spreadPct !== null && inst.spreadRub !== null) {
    if (inst.spreadPct < 0.05) {
      bullets.push(`Спред ${inst.spreadRub.toFixed(2)} ₽ — вход недорогой.`);
    } else if (inst.spreadPct >= 0.1) {
      bullets.push(
        `Широкий спред ${inst.spreadRub.toFixed(2)} ₽ — учитывать при входе.`,
      );
    }
  } else {
    bullets.push("Спред в ISS недоступен — смотрите стакан в терминале.");
  }

  if (inst.dayRangePct !== null && inst.dayRangePct >= 3) {
    bullets.push(`Диапазон дня ${inst.dayRangePct.toFixed(1)}% — есть амплитуда.`);
  }

  return bullets.slice(0, 4);
}

export function buildRiskBullets(inst: EnrichedInstrument): string[] {
  const bullets: string[] = [];

  if (inst.lotValue >= 300_000) {
    bullets.push("Дорогой лот — ошибка быстро становится дорогой.");
  }

  if (inst.entryCostRub !== null) {
    bullets.push(`Вход ≈ ${formatRub(inst.entryCostRub)} (спред + комиссия).`);
  } else {
    bullets.push("Стоимость входа неизвестна — нет спреда в данных ISS.");
  }

  if (inst.spreadPct !== null && inst.spreadPct >= 0.08) {
    bullets.push("Широкий спред съедает мелкие движения.");
  }

  if (
    inst.hasHistoricalBaseline &&
    inst.avgTrades20d !== null &&
    inst.trades < inst.avgTrades20d * 0.7
  ) {
    bullets.push("Сделок меньше обычного — риск застрять.");
  }

  return bullets.slice(0, 3);
}

export const DEFAULT_LESSON_TIPS = [
  "Открыть стакан, оценить bid/ask — не входить вслепую.",
  "Поставить лимитку около лучшей цены.",
  "Посчитать стоимость шага и ошибки в рублях.",
  "Проверить ленту: есть ли принты.",
  "Заранее определить стоп и цель.",
];

export function buildWhyShort(inst: EnrichedInstrument): string {
  if (inst.inPlayScore >= 70) return "В игре: оборот и сделки";
  if (inst.technicalScore >= 70) return "Техничная: диапазон, ликвидность";
  if (inst.spreadTradingScore >= 70) {
    return "Спредовая: широкий спред + сделки + оборот";
  }
  if (inst.beginnerScore >= 70) return "Новичку: понятный лот";
  if (inst.dangerousScore >= 65) return "Осторожно: плохие условия";
  if (!inst.hasHistoricalBaseline) return "Нет исторической базы";
  return inst.explanation.slice(0, 60);
}
