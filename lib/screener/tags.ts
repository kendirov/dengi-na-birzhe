import type { EnrichedInstrument, VisualTag } from "@/lib/types/instrument";
import { median } from "@/lib/screener/percentile";

export const VISUAL_TAG_LABELS: Record<VisualTag, string> = {
  money: "деньги",
  tape: "лента",
  "narrow-spread": "узкий спред",
  "wide-spread": "широкий спред",
  "cheap-lot": "дешёвый лот",
  "expensive-lot": "дорогой лот",
  technical: "техничная",
  "spread-trading": "спредовая",
  "in-play": "в игре",
  beginner: "новичку",
  dangerous: "опасно",
  "high-range": "high range",
};

export const VISUAL_TAG_TONE: Record<
  VisualTag,
  "cyan" | "green" | "red" | "amber" | "violet" | "muted"
> = {
  money: "green",
  tape: "cyan",
  "narrow-spread": "cyan",
  "wide-spread": "amber",
  "cheap-lot": "green",
  "expensive-lot": "red",
  technical: "cyan",
  "spread-trading": "amber",
  "in-play": "violet",
  beginner: "green",
  dangerous: "red",
  "high-range": "violet",
};

export function buildVisualTags(
  inst: EnrichedInstrument,
  medians: {
    spreadPct: number;
    lotValue: number;
    turnover: number;
    trades: number;
    dayRange: number;
  },
): VisualTag[] {
  const tags: VisualTag[] = [];

  if (inst.turnoverRub >= medians.turnover * 1.1) tags.push("money");
  if (inst.trades >= medians.trades * 1.1) tags.push("tape");
  if (
    inst.spreadPct !== null &&
    medians.spreadPct > 0 &&
    inst.spreadPct <= medians.spreadPct * 0.85
  ) {
    tags.push("narrow-spread");
  }
  if (
    inst.spreadPct !== null &&
    medians.spreadPct > 0 &&
    inst.spreadPct >= medians.spreadPct * 1.2
  ) {
    tags.push("wide-spread");
  }
  if (inst.lotValue <= medians.lotValue * 0.7) tags.push("cheap-lot");
  if (inst.lotValue >= medians.lotValue * 1.5) tags.push("expensive-lot");
  if (inst.technicalScore >= 65) tags.push("technical");
  if (inst.spreadTradable && inst.spreadTradingScore >= 60) tags.push("spread-trading");
  if (inst.inPlayScore >= 65) tags.push("in-play");
  if (inst.beginnerScore >= 65) tags.push("beginner");
  if (inst.dangerousScore >= 60) tags.push("dangerous");
  if (inst.dayRangePct !== null && inst.dayRangePct >= medians.dayRange * 1.15) {
    tags.push("high-range");
  }

  return tags;
}

export function computeMedians(instruments: EnrichedInstrument[]) {
  const spreadValues = instruments
    .map((i) => i.spreadPct)
    .filter((v): v is number => v !== null);
  const dayRangeValues = instruments
    .map((i) => i.dayRangePct)
    .filter((v): v is number => v !== null);

  return {
    spreadPct: median(spreadValues.length ? spreadValues : [0]),
    lotValue: median(instruments.map((i) => i.lotValue)),
    turnover: median(instruments.map((i) => i.turnoverRub)),
    trades: median(instruments.map((i) => i.trades)),
    dayRange: median(dayRangeValues.length ? dayRangeValues : [0]),
  };
}

export function buildTypeLabels(inst: EnrichedInstrument): string[] {
  const labels: string[] = [];
  if (inst.technicalScore >= 60) labels.push("техничная");
  if (inst.spreadTradable && inst.spreadTradingScore >= 60) labels.push("стакан");
  if (inst.inPlayScore >= 65) labels.push("в игре");
  if (inst.beginnerScore >= 65) labels.push("новичку");
  if (inst.dangerousScore >= 60) labels.push("опасная");
  return labels.length ? labels : ["смешанная"];
}
