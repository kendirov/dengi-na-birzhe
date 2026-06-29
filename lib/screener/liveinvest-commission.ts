/** LiveInvestGroup commission row — shared between server fetch and client enrich. */

export type LiveInvestCommission = {
  ticker: string;
  commissionMarketRub: number | null;
  commissionLimitRub: number | null;
  commissionMarketPoints: number | null;
  commissionLimitPoints: number | null;
  source: "liveinvest";
};

export type LiveInvestCommissionMap = ReadonlyMap<string, LiveInvestCommission>;

export function serializeLiveInvestMap(
  map: LiveInvestCommissionMap,
): Record<string, LiveInvestCommission> {
  return Object.fromEntries(map.entries());
}

export function deserializeLiveInvestMap(
  record: Record<string, LiveInvestCommission> | undefined,
): LiveInvestCommissionMap {
  if (!record) return new Map();
  return new Map(Object.entries(record));
}
