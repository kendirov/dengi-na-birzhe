# Visual Reference Checklist

Pixel-perfect сверка учебного терминала с референсом CScalp (GAZP mock).

## Canvas & window

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Базовый размер | `--cscalp-design-w` 1024px × `--cscalp-design-h` 768px | ✅ |
| Масштаб | `--cscalp-scale` + `transform: scale()` | ✅ |
| Фон вокруг окна | `--cscalp-stage-bg` `#060608` | ✅ |
| Фон окна | `--cscalp-window-bg` `#0c0d12` | ✅ |
| Рабочая область | `--cscalp-workspace-bg` `#0c0d12` | ✅ |
| Border radius окна | `--cscalp-radius-window` 6px | ✅ |
| Shadow окна | `--cscalp-shadow-window` | ✅ |
| Скролл страницы | `overflow: hidden` на `.cscalp-trainer-root` | ✅ |
| Reflow внутри canvas | запрещён — только scale | ✅ |

## Top bar

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Высота | `--cscalp-topbar-h` **26px** | ✅ |
| Цвет фона | `--cscalp-topbar-bg` **`#1e1b4b`** (фиолетовый) | ✅ |
| Spacing меню | `--cscalp-menu-gap` **7px** | ✅ |
| Font size меню | `--cscalp-font-size-xs` 10px | ✅ |
| Логотип | `--cscalp-logo-size` 16px placeholder | ☐ TODO asset |
| Пункты меню | Подключения … О проекте | ✅ |
| Badge «Сообщения» | `--cscalp-volume-warning` orange | ✅ |
| Справа | 📌 время 🔇 — □ × | ✅ |

## Grid & borders

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Толщина линий | `--cscalp-border-w` **1px** | ✅ |
| Цвет grid/border | `--cscalp-grid-line` / `--cscalp-border` **`#2a2a2a`** | ✅ |
| Колонки main | clusters 336 · tape flex · rail 42 · book 212 | ✅ |

## Typography

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Font stack UI | `--cscalp-font-ui` Arial / Segoe UI / system | ✅ |
| Font mono | `--cscalp-font-mono` Consolas / Courier | ✅ |
| Terminal size | `--cscalp-font-size` 12px, sm 11px, xs 10px | ✅ |
| Line height | `--cscalp-line-height` **1.15** (compact) | ✅ |
| Text primary | `--cscalp-text-primary` | ✅ |
| Text secondary | `--cscalp-text-secondary` | ✅ |

## Order book (стакан)

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Высота строки | `--cscalp-row-h` **13px** | ✅ |
| Ask zone bg | `--cscalp-ask-bg` **`#2d1a1a`** | ✅ |
| Bid zone bg | `--cscalp-bid-bg` **`#1a2d23`** | ✅ |
| Best ask | `--cscalp-ask-active` **`#8b2525`** | ✅ |
| Best bid | `--cscalp-bid-active` **`#1f6b3a`** | ✅ |
| Current price line | `--cscalp-price-line` на best ask row | ✅ |
| Density / warning vol | `--cscalp-volume-warning`, `--cscalp-density` | ✅ |
| Price column | `--cscalp-col-price` 50px, comma decimal | ✅ |

## Tape (лента)

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Фон | `--cscalp-tape-bg` | ✅ |
| Buy circle | `--cscalp-tape-green` **`#2a9d4a`** | ✅ |
| Sell circle | `--cscalp-tape-red` **`#c43030`** | ✅ |
| Min/max diameter | `--cscalp-tape-bubble-min` 12px · max 22px | ✅ |
| Bubble font | `--cscalp-tape-bubble-font` 9px | ✅ |
| Cluster cell width | `--cscalp-col-cluster-cell` 34px | ✅ |
| Привязка к строке цены | y = row index × `--cscalp-row-h` | ✅ |

## Clusters

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Buy fill | `--cscalp-cluster-green` | ✅ |
| Sell fill | `--cscalp-cluster-red` | ✅ |
| Panel bg | `--cscalp-panel-muted` | ✅ |
| POC borders | `--cscalp-poc-white/red/green` | ✅ |
| Footer totals | green / red rows | ✅ |

## Working volumes (rail)

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Width | `--cscalp-col-rail` 42px | ✅ |
| Active key | `--cscalp-vol-key-active` **`#0078d7`** | ✅ |
| Keys 50–800 | bottom stack | ✅ |

## Bottom tabs

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Высота строки | `--cscalp-bottom-h` **22px** | ✅ |
| Фон | `--cscalp-bottom-bar` **`#181920`** | ✅ |
| Слева | «Screener» | ✅ |
| Активная вкладка | «Вкладка (1)» highlighted | ✅ |
| Справа | icon placeholder ☰ | ☐ TODO asset |

## Instrument strip

| Параметр | Token / значение | Статус |
|----------|------------------|--------|
| Height | `--cscalp-instrument-h` 24px | ✅ |
| Symbol GAZP | `--cscalp-font-size` | ✅ |

## Explain mode (non-shell)

| Параметр | Token | Статус |
|----------|-------|--------|
| Active ring | `--cscalp-highlight-ring` | ✅ |
| Dim | `--cscalp-dim-opacity` | ✅ |

## Assets TODO

- [ ] `--cscalp-logo-bg` → approved SVG logo
- [ ] Bottom-right filter icon
- [ ] Pin / mute icons
- [ ] Side-by-side screenshot diff vs CScalp GAZP

## Reference overlay (dev)

| Параметр | Значение |
|----------|----------|
| Файл | `public/reference/cscalp-reference.png` |
| URL overlay | `?debug=1` — controls; opacity 0–100%; difference mode |
| Visual QA panel | `?debug=1&reference=1` — checklist + scale=1 |
| Playwright | `npm run test:visual` → `artifacts/screenshots/current.png` |

Референс должен быть **обрезан до 1024×768** (только окно терминала). Текущий placeholder — полный скрин; замените на approved crop.

## Как доводить пиксель-перфект

1. **Включить overlay** — `/stakan-lenta?debug=1`, убедиться что `public/reference/cscalp-reference.png` на месте.
2. **Opacity 50%** — slider в панели Reference overlay; включите **Difference** для контрастных расхождений.
3. **Сначала topbar / window** — `--cscalp-topbar-h`, `--cscalp-topbar-bg`, `--cscalp-menu-gap`, radius/shadow окна.
4. **Потом стакан** — `--cscalp-row-h`, `--cscalp-col-price`, ask/bid colors, `--cscalp-price-line`.
5. **Потом лента** — bubble min/max, colors, drift (анимации — в конце).
6. **Потом кластеры** — `--cscalp-col-cluster-cell`, POC borders, footer stats.
7. **Потом нижние вкладки** — `--cscalp-bottom-h`, `--cscalp-bottom-bar`.
8. **Только после статики — анимации** (лента, tape sim, scenario playback).

Checklist в UI: `?debug=1&reference=1`. Правки — в `src/features/terminal/styles/tokens.css`.

## Verification

1. `npm run dev` → http://localhost:3000/stakan-lenta
2. Сравнить с референс-скрином: фиолетовый topbar, тёмный workspace, ask/bid зоны
3. Resize окна — scale без reflow, без scroll внутри terminal-window
4. Bottom: Screener + Вкладка (1) + icon справа
5. Visual QA: `?debug=1&reference=1` — checklist справа
6. `npm run test:visual` — screenshot + pixel diff (`scripts/visual-qa.config.json`)
