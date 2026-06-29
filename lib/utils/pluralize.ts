/** Russian plural forms: [one, few, many] — 1 акция, 2 акции, 5 акций */
export function pluralizeRu(
  count: number,
  forms: [string, string, string],
): string {
  const n = Math.abs(Math.trunc(count));
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export function pluralizeStocks(count: number): string {
  return `${count} ${pluralizeRu(count, ["акция", "акции", "акций"])}`;
}
