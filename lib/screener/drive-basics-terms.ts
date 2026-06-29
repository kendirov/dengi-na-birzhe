export type DriveTermId =
  | "ticker"
  | "instrument"
  | "lot"
  | "lotValue"
  | "tickSize"
  | "tickValue"
  | "bid"
  | "ask"
  | "spread"
  | "tape"
  | "commissionLimit"
  | "commissionMarket"
  | "turnover"
  | "trades"
  | "range";

export const DRIVE_TERM_LABELS: Record<DriveTermId, string> = {
  ticker: "Тикер",
  instrument: "Инструмент",
  lot: "Лот",
  lotValue: "Цена лота",
  tickSize: "Шаг цены",
  tickValue: "Цена шага",
  bid: "Bid",
  ask: "Ask",
  spread: "Spread",
  tape: "Лента",
  commissionLimit: "Комиссия лимит",
  commissionMarket: "Комиссия рынок",
  turnover: "Оборот",
  trades: "Сделки",
  range: "Диапазон",
};

export const DRIVE_TERM_DESCRIPTIONS: Record<DriveTermId, string> = {
  ticker: "Короткий код инструмента на бирже. Например, SBER.",
  instrument: "Полное или краткое название бумаги.",
  lot: "Минимальный торговый размер. Если лот 10, одна заявка = 10 акций.",
  lotValue:
    "Стоимость одного лота: цена × размер лота. Показывает, сколько денег нужно на вход.",
  tickSize: "Минимальное изменение цены инструмента.",
  tickValue: "Сколько рублей даёт один шаг цены при позиции 1 лот.",
  bid: "Лучшая заявка на покупку. По этой цене рынок готов купить.",
  ask: "Лучшая заявка на продажу. По этой цене рынок готов продать.",
  spread:
    "Разница между ask и bid. Это базовая стоимость быстрого входа/выхода.",
  tape: "Поток сделок: время, цена, объём и сторона. Показывает, кто агрессивнее — покупатели или продавцы.",
  commissionLimit:
    "Комиссия за заявку, которая добавляет ликвидность. В учебной модели — maker.",
  commissionMarket:
    "Комиссия за заявку, которая забирает ликвидность. В учебной модели — taker.",
  turnover: "Денежный объём торгов. Показывает, есть ли в инструменте деньги.",
  trades: "Количество принтов в ленте. Показывает, живой инструмент или нет.",
  range: "Сколько цена прошла внутри дня от low до high.",
};

/** Tooltips for ScreenerTable headers — same wording as DriveBasicsPanel */
export const TABLE_HEADER_TOOLTIPS: Record<string, string> = {
  ticker: DRIVE_TERM_DESCRIPTIONS.ticker,
  name: DRIVE_TERM_DESCRIPTIONS.instrument,
  lotValue: DRIVE_TERM_DESCRIPTIONS.lotValue,
  tickSize: DRIVE_TERM_DESCRIPTIONS.tickSize,
  tickValueRub: DRIVE_TERM_DESCRIPTIONS.tickValue,
  spreadTicks: DRIVE_TERM_DESCRIPTIONS.spread,
  commissionLimitTicks: DRIVE_TERM_DESCRIPTIONS.commissionLimit,
  commissionMarketTicks: DRIVE_TERM_DESCRIPTIONS.commissionMarket,
  turnoverRub: DRIVE_TERM_DESCRIPTIONS.turnover,
  trades: DRIVE_TERM_DESCRIPTIONS.trades,
  dayRangePct: DRIVE_TERM_DESCRIPTIONS.range,
};

export const STORAGE_KEY_DRIVE_BASICS = "marketlab_show_drive_basics";
