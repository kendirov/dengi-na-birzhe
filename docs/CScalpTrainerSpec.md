# CScalp Trainer — Product Spec

> **Sandbox-симулятор** для обучения стакану, ленте, кластерам и заявкам.  
> Не торговый терминал. Не подключение к бирже. Все данные — deterministic mock.

## Цель продукта

Интерактивная презентация интерфейса CScalp для уроков, вебинаров и самостоятельной практики трейдера. Визуальная и поведенческая близость к терминалу CScalp достигается через фиксированный layout 1024×768, CSS-токены и mock-движок сделок.

## Фокус тренажёра (приоритет зон)

Обучение строится **слева направо и сверху вниз по важности сигнала**:

1. **Стакан** — где стоят заявки, спред, плотности, исполнение.
2. **Лента** — факт сделок, агрессия, крупные принты.
3. **Кластера** — объём по цене и времени, POC, delta по колонке.
4. **График** — **вспомогательный** контекст (тренд, last, volume strip). Не заменяет чтение стакана.

График не подключён к TradingView и не является источником торговых сигналов в тренажёре.

## Режимы

| Режим | ID | Поведение |
|-------|-----|-----------|
| **Terminal** | `terminal` | Чистый терминал без подсветок и подписей. Live mock tape + клики по стакану исполняют рыночные заявки. |
| **Explain** | `explain` | Подсветка активной зоны (стакан / лента / кластера / объём / график), остальные зоны приглушены. Callout-подписи. |
| **Practice** | `practice` | Пользователь кликает в стакан; симуляция market order на выбранный рабочий объём. Подсказка в presenter-bar. |
| **Scenario** | `scenario` | Заранее записанный сценарий (`SCENARIOS` в `lessons.ts`): keyframes сделок по таймлайну. |
| **Presenter** | `presenter` | Пошаговая лекция: Next / Back по `LESSON_STEPS`, синхронная подсветка зон. |

## Архитектура

```
src/app/App.tsx                    — entry, CSS import, TerminalProvider
src/features/terminal/
  TerminalShell.tsx                — scaled canvas + grid layout
  components/                      — UI panels (TopBar, OrderBook, MiniChart, …)
  data/mockMarket.ts               — deterministic GAZP mock + sim helpers
  data/lessons.ts                  — steps, scenarios, mode labels
  engine/chartEngine.ts            — 60-point line series, tail sync with book
  engine/clusterEngine.ts          — cluster candles + POC
  engine/tapeEngine.ts               — tape prints + scenarios
  state/terminalStore.tsx          — React Context + useReducer
  styles/tokens.css                — design tokens (colors, sizes)
  styles/terminal.css              — BEM layout, no UI library
  types.ts                         — domain types
```

Интеграция в Next.js: `app/stakan-lenta/page.tsx` → `StakanLentaClient` → `src/app/App.tsx`.

## Данные

- **Источник:** только mock-слой — GAZP, MOEX-like плотности, кластера, tape seeds, chart series.
- **Запрещено:** live API, MOEX ISS, WebSocket, TradingView, реальные цены.
- **Метки:** disclaimer «mock · учебная реконструкция» всегда виден.

## Layout

- Design canvas: **1024 × 768 px**
- Масштаб: `transform: scale(var(--trainer-scale))` от ширины viewport
- Grid main: clusters 336 | tape flex | rail 42 | book 212
- Row height: 13 px (стакан ↔ кластера ↔ лента синхронны по цене)
- **MiniChart:** dock под main grid (embedded ~92px или presentation ~196px), toggle кнопкой ▣ в InstrumentHeader

## MiniChart (mock)

| Свойство | Значение |
|----------|----------|
| Точек | 60 × 5m |
| Хвост | последние 10 точек синхронизируются с `currentPrice` / best bid·ask |
| Рендер | SVG line segments (green/red), grid, volume strip, last price line |
| Режимы | `embedded` (terminal) / `presentation` (explain/presenter) |
| Рисование | horizontal level, rectangle zone, arrow, clear all — для урока |
| Сценарии | volume strip усилен при `active` / `breakoutAttempt` tape mode |

## Референсы CScalp (логика UI)

- [Описание интерфейса](https://fsr-develop.ru/opisanie-interfeisa-cscalp)
- [Лента сделок](https://fsr-develop.ru/kak-rabotaet-lenta-sdelok-v-cscalp)
- [Кластера](https://fsr-develop.ru/kak-rabotayut-klastery-v-cscalp)
- [Сделка](https://fsr-develop.ru/kak-sovreshit-sdelku-cscalp)
- [Горячие клавиши](https://fsr-develop.ru/gorjachie-klavishi-na-stakan-v-cscalp)
- [Chart Privod](https://fsr-develop.ru/chart-privod-bondar)

## TODO (assets)

- [ ] `--trainer-logo-url` — утверждённый логотип CScalp / проекта
- [ ] Иконки вкладок bottom bar
- [ ] Иконки instrument header (settings, chart, lot/$)
- [ ] Pixel-diff против эталонного скрина CScalp GAZP

## Не в scope v1

- TradingView / live chart feed
- Реальные hotkeys (F/D/L только UI toggle)
- Limit/stop заявки, DOM depth > mock
- Multi-instrument, multi-tab workspace
- Privod Bondar journal integration
- Запись/воспроизведение пользовательских сценариев
