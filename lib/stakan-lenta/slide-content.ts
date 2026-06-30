export const SLIDE_SECTIONS = [
  {
    id: "stakan",
    title: "Биржевой стакан",
    intro: "Заявки на покупку и продажу. Видны цены, объёмы и плотности.",
    zone: "stakan" as const,
  },
  {
    id: "lenta",
    title: "Лента сделок",
    intro:
      "Фактические сделки. Зелёные — покупки по ask, красные — продажи по bid.",
    zone: "lenta" as const,
  },
  {
    id: "klastera",
    title: "Кластера",
    intro:
      "Объём по цене и времени. Помогают видеть, где прошли основные сделки.",
    zone: "klastera" as const,
  },
] as const;

export type SlideSectionId = (typeof SLIDE_SECTIONS)[number]["id"];
export type SlideZone = (typeof SLIDE_SECTIONS)[number]["zone"];

export { DRIVE_VOLUME_KEYS, type DriveVolumeKey } from "./cscalp-theme";
