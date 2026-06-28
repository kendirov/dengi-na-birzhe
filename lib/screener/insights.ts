import type { EnrichedInstrument } from "@/lib/types/instrument";
import type { ScreenerMode } from "@/lib/types/screener";

import { formatRub, formatNumber } from "@/lib/utils/format";

export function buildBeginnerExplanation(
  inst: EnrichedInstrument,
  mode: ScreenerMode,
): string[] {
  const baselineNote = !inst.hasHistoricalBaseline
    ? "Исторической базы нет — оценка по текущим оборотам и сделкам."
    : null;

  switch (mode) {
    case "technical": {
      const bullets: string[] = [];
      if (inst.dayRangePct !== null) {
        bullets.push(`Есть дневной диапазон: ${inst.dayRangePct.toFixed(1)}%.`);
      }
      bullets.push(`Оборот есть: ${formatRub(inst.turnoverRub, true)}.`);
      bullets.push(`Сделок достаточно: ${formatNumber(inst.trades)}.`);
      if (inst.spreadPct !== null && inst.spreadPct < 0.08) {
        bullets.push("Spread не главный риск.");
      } else if (inst.spreadRub === null) {
        bullets.push("Spread в ISS недоступен — смотрите стакан.");
      } else {
        bullets.push("Spread учитывать при входе.");
      }
      bullets.push("Можно смотреть уровни и high/low.");
      if (baselineNote) bullets.push(baselineNote);
      return bullets.slice(0, 5);
    }
    case "spread": {
      const bullets: string[] = [];
      if (inst.spreadTicks !== null) {
        bullets.push(`Spread: ${inst.spreadTicks.toFixed(0)} пунктов.`);
      } else {
        bullets.push("Spread недоступен в ISS — проверить в приводе.");
      }
      if (inst.tickValueRub !== null) {
        bullets.push(`Цена шага: ${formatRub(inst.tickValueRub)} на 1 лот.`);
      }
      bullets.push(`Сделок достаточно: ${formatNumber(inst.trades)}.`);
      bullets.push(`Оборот есть: ${formatRub(inst.turnoverRub, true)}.`);
      if (inst.commissionMarketTicks !== null) {
        bullets.push(
          `Комиссия съедает ${inst.commissionMarketTicks.toFixed(1)} пунктов.`,
        );
      }
      return bullets.slice(0, 5);
    }
    case "beginner": {
      const bullets: string[] = [
        `Цена лота понятная: ${formatRub(inst.lotValue)}.`,
      ];
      if (inst.tickValueRub !== null) {
        bullets.push(`Шаг/лот: ${formatRub(inst.tickValueRub)}.`);
      }
      if (inst.spreadPct !== null && inst.spreadPct < 0.1) {
        bullets.push("Spread не экстремальный.");
      } else if (inst.spreadRub === null) {
        bullets.push("Spread в ISS нет — проверить в приводе.");
      } else {
        bullets.push("Spread заметный — учитывать при тренировке.");
      }
      bullets.push("Есть сделки для наблюдения.");
      bullets.push("Можно тренировать лимитки.");
      if (baselineNote) bullets.push(baselineNote);
      return bullets.slice(0, 5);
    }
    case "in-play": {
      const bullets: string[] = [
        `Оборот: ${formatRub(inst.turnoverRub, true)}.`,
        `Сделок: ${formatNumber(inst.trades)}.`,
      ];
      if (inst.dayRangePct !== null) {
        bullets.push(`Диапазон дня: ${inst.dayRangePct.toFixed(1)}%.`);
      }
      if (inst.hasHistoricalBaseline && inst.avgTurnover20d !== null) {
        const ratio = inst.turnoverRub / inst.avgTurnover20d;
        if (ratio > 1.1) {
          bullets.push("Оборот выше среднего — инструмент активен.");
        } else {
          bullets.push("Активность есть, но без явного всплеска.");
        }
      } else if (baselineNote) {
        bullets.push(baselineNote);
      }
      bullets.push("Список для наблюдения, не сигнал.");
      return bullets.slice(0, 5);
    }
    case "dangerous": {
      const bullets: string[] = [];
      if (inst.spreadPct !== null && inst.spreadPct >= 0.06) {
        bullets.push("Spread широкий.");
      }
      if (inst.trades < 3000) bullets.push("Сделок мало.");
      if (
        inst.hasHistoricalBaseline &&
        inst.avgTurnover20d !== null &&
        inst.turnoverRub < inst.avgTurnover20d * 0.6
      ) {
        bullets.push("Оборот слабый относительно базы.");
      } else if (inst.turnoverRub < 20_000_000) {
        bullets.push("Оборот слабый.");
      }
      if (isExpensiveErrorHint(inst)) bullets.push("Цена ошибки высокая.");
      bullets.push("Нужен план, иначе пропустить.");
      return bullets.slice(0, 5);
    }
    default:
      return buildWhyBullets(inst).slice(0, 4);
  }
}

function isExpensiveErrorHint(inst: EnrichedInstrument): boolean {
  if (inst.tickValueRub !== null && inst.tickValueRub >= 40) return true;
  if (inst.lotValue >= 350_000) return true;
  return false;
}

export function buildSpreadWhyBullets(inst: EnrichedInstrument): string[] {
  const bullets: string[] = [];

  if (inst.spreadTicks !== null && inst.spreadTicks >= 2) {
    bullets.push(
      `Спред ${inst.spreadTicks.toFixed(0)} пунктов — есть пространство между bid/ask.`,
    );
  }

  if (inst.trades > 0) {
    bullets.push(`Сделок достаточно: ${formatNumber(inst.trades)}.`);
  }

  bullets.push(`Оборот есть: ${formatRub(inst.turnoverRub, true)}.`);

  if (inst.tickValueRub !== null) {
    bullets.push(
      `Цена шага понятная: ${formatRub(inst.tickValueRub)} на 1 лот.`,
    );
  }

  if (inst.commissionMarketTicks !== null) {
    bullets.push(
      `Комиссия съедает ${inst.commissionMarketTicks.toFixed(1)} пунктов.`,
    );
  }

  return bullets.slice(0, 5);
}

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
    const pointsLabel =
      inst.spreadTicks !== null
        ? ` (${inst.spreadTicks.toFixed(0)} п.)`
        : "";
    if (inst.spreadPct < 0.05) {
      bullets.push(`Спред ${inst.spreadRub.toFixed(2)} ₽${pointsLabel} — вход недорогой.`);
    } else if (inst.spreadPct >= 0.1) {
      bullets.push(
        `Широкий спред ${inst.spreadRub.toFixed(2)} ₽${pointsLabel} — учитывать при входе.`,
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
  if (inst.spreadTradable && inst.spreadTradingScore >= 60) {
    return `Спредовая: ${inst.spreadTicks?.toFixed(0) ?? "—"} п., сделки и оборот`;
  }
  if (inst.spreadTradingScore >= 70) {
    return "Спредовая: широкий спред + сделки + оборот";
  }
  if (inst.beginnerScore >= 70) return "Новичку: понятный лот";
  if (inst.dangerousScore >= 65) return "Осторожно: плохие условия";
  if (!inst.hasHistoricalBaseline) return "Нет исторической базы";
  return inst.explanation.slice(0, 60);
}
