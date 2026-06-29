# Widget Checklist

## Перед разработкой

- [ ] Торговая гипотеза одним предложением
- [ ] Формула сигнала (математика)
- [ ] Источник данных (MOEX field / computed / external)
- [ ] Период lookback
- [ ] Задержка данных (real-time / 15min cache)
- [ ] Риск ложного сигнала

## Реализация

- [ ] Тип добавлен в `EnrichedInstrument` если нужно
- [ ] Enrich не ломает mock mode
- [ ] Колонка sortable если имеет смысл
- [ ] Tooltip на header
- [ ] Режимы technical/spread/training учтены
- [ ] Inspector показывает контекст

## UI

- [ ] 12–13px таблица, не ломает layout
- [ ] Цвет: cyan ticker, amber spread/cost
- [ ] Empty state при null данных

## Примеры виджетов (backlog)

| Виджет | Формула (черновик) | Данные |
|--------|-------------------|--------|
| Oversold ATR | price vs SMA ± k×ATR | OHLC history (TODO) |
| 52W / hist low | price / min(252d) | Historical (TODO) |
| Anomalous volume | turnover > N× median | trades, turnoverRub |
| Momentum 5/15/60m | Δ% за окно | Intraday (TODO) |
| Spread expansion | spreadTicks > p75 sector | spreadTicks |
| Sector strength | vs sector ETF/index | Sector map (TODO) |
| News vs price | news time vs move | External (TODO) |
| VWAP distance | (price - VWAP) / VWAP | VWAP (TODO) |
| Max intraday DD | (high - price) / high | day high/low |
