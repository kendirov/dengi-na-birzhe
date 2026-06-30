# Pixel-Perfect Audit: `/stakan-lenta` vs `CiScalp.png`

**Дата аудита:** 2026-06-30  
**Референс (единственный источник правды):** `CiScalp.png` в корне репозитория  
**Статус:** только аудит, визуальные изменения не вносились

---

## Executive summary / Root cause

Терминал на `/stakan-lenta` **не может совпасть** с `CiScalp.png`, потому что одновременно нарушены три фундаментальных контракта:

1. **Неверный design canvas** — код и QA заточены под **1024×768**, референс — **984×1200** (другой aspect ratio, другая доля графика).
2. **Страница — не окно терминала** — терминал вложен в shell сайта «Деньги на бирже» (TopNav, заголовок секции, footer, disclaimer), а не рендерится как fullscreen chrome CScalp.
3. **Неверная модель кластеров и графика** — кластеры рисуются как **heatmap** (rgba-fill по intensity), график **закрыт по умолчанию** и при открытии занимает **92 px** вместо ~35–40% высоты окна на референсе.

Reference overlay дополнительно **растягивает** изображение 984×1200 в контейнер 1024×768 (`object-fit: fill`), поэтому pixel-diff и ручная сверка дают ложную картину даже при «правильных» токенах.

---

## 1. Где что находится

### Маршрут `/stakan-lenta`

| Слой | Файл | Роль |
|------|------|------|
| Page | `app/stakan-lenta/page.tsx` | Оборачивает контент в `SectionPageShell` |
| Client entry | `components/stakan-lenta/StakanLentaClient.tsx` | Рендерит `src/app/App.tsx` (активный тренажёр) |
| Trainer root | `src/app/App.tsx` | Provider, overlay, debug, `TerminalShell` |
| Terminal layout | `src/features/terminal/TerminalShell.tsx` | Grid: clusters · tape · rail · book + chart + tabs |

**Отдельный layout для `/stakan-lenta` отсутствует** — используется общий `app/layout.tsx` + `AppShell` через `SectionPageShell`.

### Две параллельные реализации (legacy vs active)

| | **Active (рендерится на странице)** | **Legacy (не подключена)** |
|---|-------------------------------------|----------------------------|
| Entry | `src/app/App.tsx` | `components/stakan-lenta/CScalpTerminal.tsx` |
| Canvas | 1024×768 + CSS scale | `max-w-[1280px]`, `height: 720` |
| Тема | `src/features/terminal/styles/tokens.css` | `lib/stakan-lenta/cscalp-theme.ts` |
| Кластеры | heatmap (`clusterEngine.cellFillStyle`) | footprint text (`CScalpClusters.tsx`) |

`StakanLentaClient` импортирует только `src/app/App.tsx`. Папка `components/stakan-lenta/*` **не используется** на текущем маршруте, но создаёт путаницу при аудите.

---

## 2. Референс vs текущие размеры

### Референс

| Параметр | Значение |
|----------|----------|
| Файл | `C:\Data\Dengi na birje\CiScalp.png` |
| Размер | **984 × 1200 px** |
| Содержимое | Полное окно CScalp: topbar, GAZP header, стакан/лента/кластеры, **график GAZP 5m**, нижние вкладки |

### Overlay / public reference

| Параметр | Значение |
|----------|----------|
| Путь в коде | `public/reference/cscalp-reference.png` (`REFERENCE_IMAGE_PATH`) |
| Фактический размер | **984 × 1200 px** (совпадает с `CiScalp.png`) |
| Ожидание в документации | `docs/VisualReferenceChecklist.md` требует crop **1024×768** — **противоречит approved reference** |

### Design canvas в коде

| Источник | Width | Height |
|----------|-------|--------|
| `--cscalp-design-w/h` (`tokens.css`) | **1024** | **768** |
| `CSCALP_DESIGN_WIDTH/HEIGHT` (`layout.ts`) | **1024** | **768** |
| Auto-scale padding | pad-x 24, pad-y **160** | учитывает chrome сайта, не CScalp |
| Legacy `CScalpTerminal` | max **1280** | **720** |
| Playwright `visual-qa.config.json` viewport | **1280** | **900** |
| Playwright `designSize` | **1024** | **768** |

### Пропорции зон (оценка по референсу 984×1200)

| Зона | Референс (≈) | Текущий код |
|------|--------------|-------------|
| Topbar | ~26 px, фиолетовый `#1e1b33` | 26 px, `#1e1b4b` |
| Instrument header (GAZP) | ~24 px, только символ слева | 24 px + позиция, feedback, chart toggle |
| Main (кластеры + лента + rail + стакан) | ~55–60% высоты (~660–720 px) | `flex: 1` ≈ **696 px** только если chart **закрыт** |
| График GAZP 5m | ~35–40% (~430–480 px), **всегда виден** | **скрыт** (`chartOpen: false`); при открытии **92 px** (embedded) |
| Bottom tabs | ~22 px | 22 px |
| Ширина стакана | ~21–23% (~210–230 px) | `--cscalp-col-book: 212px` ✓ близко |
| Ширина кластеров | ~38% (~370–390 px) | `--cscalp-col-clusters: 336px` ✗ уже |
| Ширина rail | ~4% (~40 px) | 42 px ✓ |
| Лента (flex) | ~35% (~340 px) | 1024−336−42−212 = **434 px** ✗ шире |

**Aspect ratio:** референс **0.82** (portrait-tall), canvas **1.33** (landscape) — overlay физически не может совпасть без смены canvas или crop референса под новую политику (но approved reference = 984×1200).

---

## 3. Почему терминал внутри сайта, а не полноценное окно

Цепочка обёрток:

```
app/layout.tsx
  └─ AppShell (TopNav + main + footer)
       └─ SectionPageShell (h1 «Стакан и лента», subtitle)
            └─ StakanLentaClient → CScalpTrainerApp
                 └─ .cscalp-trainer-root (disclaimer внизу)
                      └─ .cscalp-trainer-stage (padding, stage-bg)
                           └─ scaled .cscalp-terminal-window 1024×768
```

**Причины расхождения с CScalp:**

1. `SectionPageShell` → `AppShell` — навигация «Деньги на бирже», footer «учебное пособие», `maxWidth: CONTENT_MAX_WIDTH`, padding `px-4 py-8`.
2. Заголовок страницы (`<h1>`, subtitle) над терминалом — на референсе отсутствует.
3. `.cscalp-disclaimer` под терминалом — лишний текст вне окна CScalp.
4. `CSCALP_VIEWPORT_PAD_Y = 160` в scale-расчёте — зарезервировано под site chrome + заголовок, терминал **уменьшается**, а не занимает viewport как нативное окно.
5. Нет dedicated `app/stakan-lenta/layout.tsx` с `fullWidth` / без `AppShell`.
6. В режимах explain/presenter/scenario — `LessonOverlay`, `PracticePanel`, debug bars **вне** pixel window.

**Что нужно для «окна терминала»:** отдельный layout (без TopNav/footer/h1), stage на весь viewport, опционально отдельный route или `AppShell fullWidth` + zero padding.

---

## 4. График по умолчанию

| | Референс | Код |
|---|----------|-----|
| Видимость | GAZP, 5m — открыт, свечи + volume + price axis | `chartOpen: false` в `createInitialState()` |
| Toggle | N/A (всегда в layout) | Кнопка ▣ в `InstrumentHeader` |
| Высота | ~430–480 px из 1200 | `--cscalp-chart-h-embedded: 92px`, presentation 196px |
| Тип | Candlestick 5m | Line segments + volume bars (`MiniChart.tsx`) |
| Label | «GAZP, 5m» | «GAZP, 5m · mock» |

Файлы: `terminalStore.tsx` (initial state), `MiniChart.tsx`, `InstrumentHeader.tsx`, `tokens.css` (`--cscalp-chart-h-*`).

---

## 5. Почему кластеры выглядят как heatmap, а не footprint CScalp

### Референс (CScalp footprint)

- Фон ячеек **тёмный/прозрачный**, без заливки по intensity.
- Числа объёма — **цветной текст** (зелёный/красный/серый для мелких).
- POC — **рамка** (белая / красная / зелёная), не заливка.
- Footer: время, total vol, delta, max vol **по колонкам** (как на скрине).

### Active implementation

`src/features/terminal/engine/clusterEngine.ts` → `cellFillStyle()`:

```ts
const alpha = 0.12 + level.intensity * 0.55;
background: `rgba(62, 207, 110, ${alpha})` // или red
```

`ClusterPanel.tsx` применяет `background` + `color` из `cellFillStyle` — классический **heatmap**.

POC (`isPoc`) добавляет только `box-shadow` inset white — но под цветной заливкой это не совпадает с референсом.

### Legacy (правильнее по модели, но не используется)

`components/stakan-lenta/CScalpClusters.tsx`:

- Без background fill.
- `color` по buy/sell/neutral.
- `boxShadow` для POC white/red/green.

**Root cause heatmap:** активный `clusterEngine.cellFillStyle` + отсутствие split buy/sell в ячейке (показывается `totalVol`, на референсе часто доминирующая сторона).

---

## 6. Почему Reference Overlay использует «неправильный» размер

| Проблема | Детали |
|----------|--------|
| Контейнер overlay | `.cscalp-terminal` = **1024×768** |
| Изображение | **984×1200** |
| CSS | `.cscalp-reference-overlay img { width:100%; height:100%; object-fit: fill; }` — **принудительное растягивание** |
| Документация vs факт | Checklist/README говорят «crop 1024×768», файл в `public/reference/` — **984×1200** |
| Visual QA config | `designSize: 1024×768`, `referenceFile` — 984×1200 → pixelmatch некорректен |
| Scale mode | Auto-scale viewport ≠ 1:1 даже с `?reference=1` (нет принудительного `scale=1` в URL sync по умолчанию) |

Файлы: `ReferenceOverlay.tsx`, `terminal.css` (`.cscalp-reference-overlay`), `visualQAMetrics.ts`, `scripts/visual-qa.config.json`, `docs/VisualReferenceChecklist.md`.

---

## 7. Что не совпадает с `CiScalp.png` (чеклист)

### Layout & chrome

- [ ] Canvas 1024×768 vs 984×1200
- [ ] Site TopNav, page title, footer, trainer disclaimer
- [ ] Terminal window border-radius 6px + shadow (на референсе — нативное окно ОС)
- [ ] Instrument header перегружен (position, feedback, chart btn) vs минимальный «GAZP»

### Topbar

- [ ] Оттенок фиолетового: `#1e1b4b` vs `#1e1b33`
- [ ] Иконки 📌🔇 — placeholder символы, не asset CScalp
- [ ] Logo — CSS gradient placeholder

### Grid / widths

- [ ] Кластеры 336px — уже референса (~374–390px)
- [ ] Лента flex ~434px — шире референса (~340px)
- [ ] Main height без chart не эквивалентен main+chart на референсе

### Стакан

- [ ] Ask/bid bg `#2d1a1a` / `#1a2e1a` vs tokens `#2d1a1a` / `#1a2d23` (bid чуть другой)
- [ ] Density bars — tan `#9a8260` vs `--cscalp-density` (близко, нужна сверка opacity)
- [ ] Количество видимых строк / scroll position

### Лента

- [ ] Bubbles overlay на стакане справа (на референсе — поверх DOM между кластерами и стаканом)
- [ ] Размеры bubble 12–22px — нужна сверка с референсом на конкретных принтах

### Кластеры

- [ ] **Heatmap fill** вместо text footprint
- [ ] Footer stats layout/typography
- [ ] Time labels: в коде footer внизу колонок; на legacy — header сверху (оба не verified pixel-perfect)

### График

- [ ] **Закрыт по умолчанию**
- [ ] Высота 92px vs ~430px+
- [ ] Line chart vs candlestick
- [ ] Candle countdown «04:37», price box на оси — отсутствуют или упрощены

### Bottom tabs

- [ ] «Screener» + «Вкладка (1)» — есть
- [ ] Settings icon справа — placeholder ☰

### Цвета (global)

- [ ] Workspace `#0c0d12` vs референс `#0b0b14`
- [ ] Cluster green/red — более neon в tokens vs приглушённый CScalp

---

## 8. Карта файлов по ответственности

### Layout

- `app/stakan-lenta/page.tsx`
- `components/shell/SectionPageShell.tsx`
- `components/AppShell.tsx`
- `components/TopNav.tsx`
- `src/app/App.tsx`
- `src/features/terminal/TerminalShell.tsx`
- `src/features/terminal/styles/terminal.css`
- `src/features/terminal/constants/layout.ts`

### Цвета / design tokens

- `src/features/terminal/styles/tokens.css` — **primary**
- `src/features/terminal/styles/terminal.css` — component styles
- `lib/stakan-lenta/cscalp-theme.ts` — legacy only

### Кластеры

- `src/features/terminal/components/ClusterPanel.tsx` — **active UI**
- `src/features/terminal/engine/clusterEngine.ts` — seed data, **cellFillStyle (heatmap)**
- `components/stakan-lenta/CScalpClusters.tsx` — legacy footprint style
- `lib/stakan-lenta/cscalp-mock-data.ts` — legacy data

### Стакан

- `src/features/terminal/components/OrderBook.tsx`
- `src/features/terminal/engine/orderEngine.ts`
- `src/features/terminal/data/mockMarket.ts`
- `components/stakan-lenta/CScalpOrderBook.tsx` — legacy

### Лента

- `src/features/terminal/components/TapePanel.tsx`
- `src/features/terminal/engine/tapeEngine.ts`
- `components/stakan-lenta/CScalpTapeBubbles.tsx` — legacy

### График

- `src/features/terminal/components/MiniChart.tsx`
- `src/features/terminal/engine/chartEngine.ts`
- `src/features/terminal/components/InstrumentHeader.tsx` — toggle

### Topbar / tabs / rail

- `src/features/terminal/components/TopBar.tsx`
- `src/features/terminal/components/BottomTabs.tsx`
- `src/features/terminal/components/WorkingVolumePanel.tsx`
- `src/features/terminal/components/InstrumentHeader.tsx`

### Reference overlay & Visual QA

- `src/features/terminal/components/ReferenceOverlay.tsx`
- `src/features/terminal/components/ReferenceDebugControls.tsx`
- `src/features/terminal/components/VisualQAPanel.tsx`
- `src/features/terminal/visual/visualQAMetrics.ts`
- `src/features/terminal/hooks/useDebugQuery.ts`
- `scripts/visual-qa.config.json`
- `scripts/visual-qa.mjs`
- `docs/VisualReferenceChecklist.md`
- `public/reference/cscalp-reference.png`

### State / modes (влияют на вид)

- `src/features/terminal/state/terminalStore.tsx`
- `src/features/terminal/components/LessonOverlay.tsx`
- `src/features/terminal/components/PracticePanel.tsx`

---

## 9. План исправления (строго по приоритету)

### Phase 0 — Контракт размеров (блокер)

1. Зафиксировать **984×1200** как `--cscalp-design-w/h` (или explicit `REFERENCE_WIDTH/HEIGHT`).
2. Синхронизировать: `layout.ts`, `tokens.css`, `MiniChart` VIEW_W, `visual-qa.config.json`, `VisualReferenceChecklist.md`.
3. Скопировать/слинковать `CiScalp.png` → `public/reference/cscalp-reference.png` (если должны быть идентичны).
4. Overlay: `object-fit: contain` **или** 1:1 canvas без stretch; overlay только при совпадающих размерах.

### Phase 1 — Fullscreen terminal route

1. `app/stakan-lenta/layout.tsx` — без `AppShell`, `min-h-screen`, stage-bg на весь viewport.
2. Убрать `SectionPageShell` h1/subtitle с pixel route (или вынести в `?guide=1`).
3. Убрать/спрятать `.cscalp-disclaimer` в pixel mode.
4. Пересчитать `CSCALP_VIEWPORT_PAD_Y` → 0 или minimal для fullscreen.
5. URL `?reference=1` → force `scale=1` для QA.

### Phase 2 — Вертикальная сетка (main + chart)

1. `chartOpen: true` by default.
2. Задать `--cscalp-chart-h` ≈ **430–480px** (измерить по референсу в px).
3. `terminal__main` = оставшаяся высота после topbar + instrument + chart + bottom.
4. Пересчитать `--cscalp-row-h` и число видимых строк стакана под новую main height.

### Phase 3 — Горизонтальная сетка

1. Измерить в референсе (984px): clusters, tape, rail, book в px.
2. Обновить `--cscalp-col-clusters`, `--cscalp-col-book`, `--cscalp-col-rail`, `--cscalp-col-cluster-cell`.
3. Tape остаётся `minmax(0, 1fr)` или фиксированная ширина — по замеру.

### Phase 4 — Footprint clusters (не heatmap)

1. Переписать `cellFillStyle` → transparent bg, text color by dominant side, neutral for small vol.
2. POC borders: white/red/green inset box-shadow без fill.
3. Показывать dominant side volume (как legacy `CScalpClusters`), не только totalVol.
4. Footer columns — сверить порядок stats с референсом.

### Phase 5 — Стакан, лента, цвета

1. Подогнать ask/bid/density colors к референсу.
2. Tape bubble positions — lane X по референсу (между clusters и book).
3. Row height / font 8–10px — compact density.

### Phase 6 — График

1. Candlestick SVG (или canvas) вместо line segments.
2. Header «GAZP, 5m», volume subpane, price axis, current price box, candle timer.
3. Убрать «· mock» и dev tools в pixel mode.

### Phase 7 — Assets & polish

1. Logo, window controls, bottom-right settings icon.
2. Topbar exact menu spacing (`--cscalp-menu-gap`).

### Phase 8 — QA pipeline

1. `visual-qa.config.json` → designSize 984×1200, viewport ≥ 984×1200.
2. Playwright screenshot full `.cscalp-terminal-window` at scale=1.
3. Обновить `VisualReferenceChecklist.md` — убрать противоречие «crop 1024×768».

### Phase 9 — Legacy cleanup

1. Удалить или пометить deprecated `components/stakan-lenta/CScalpTerminal.tsx` и связанные файлы, чтобы не дублировать правки.

---

## 10. FACTUAL REPORT

| Вопрос | Ответ |
|--------|--------|
| **Где референс** | `CiScalp.png` (корень репо); копия для overlay: `public/reference/cscalp-reference.png` |
| **Размер референса** | **984 × 1200 px** |
| **Текущий design canvas терминала** | **1024 × 768 px** (`tokens.css`, `layout.ts`, `.cscalp-terminal-window`) |
| **Legacy alternate canvas** | max-width **1280 px**, height **720 px** (`CScalpTerminal.tsx`) — не на маршруте |
| **Playwright QA viewport** | **1280 × 900**, designSize **1024 × 768** |
| **График по умолчанию** | **Закрыт** (`chartOpen: false` в `terminalStore.tsx`) |
| **Reference overlay** | Растягивает 984×1200 → 1024×768 через `object-fit: fill` |

### Главные расхождения (top 7)

1. Design canvas **1024×768** ≠ reference **984×1200**
2. Терминал в **shell сайта** (TopNav, h1, footer), не fullscreen CScalp window
3. **График закрыт** и слишком низкий (92px) vs ~40% высоты на референсе
4. Кластеры — **heatmap rgba**, не text footprint CScalp
5. Reference overlay **distorted stretch**
6. Ширины колонок (clusters/tape) не совпадают с пропорциями референса
7. Дублирование кодовой базы: active `src/features/terminal` vs unused `components/stakan-lenta`

### Файлы для изменения (минимальный critical path)

1. `src/features/terminal/styles/tokens.css`
2. `src/features/terminal/constants/layout.ts`
3. `src/features/terminal/styles/terminal.css` (overlay, chart height, grid)
4. `src/features/terminal/state/terminalStore.tsx` (chartOpen default, scale padding)
5. `src/features/terminal/TerminalShell.tsx`
6. `src/features/terminal/engine/clusterEngine.ts` + `ClusterPanel.tsx`
7. `src/features/terminal/components/MiniChart.tsx`
8. `app/stakan-lenta/page.tsx` + новый `app/stakan-lenta/layout.tsx`
9. `components/shell/SectionPageShell.tsx` / `AppShell.tsx` (fullscreen mode)
10. `src/features/terminal/components/ReferenceOverlay.tsx`
11. `scripts/visual-qa.config.json`
12. `public/reference/cscalp-reference.png` (sync with `CiScalp.png`)
13. `docs/VisualReferenceChecklist.md`

---

## Как проверять после исправлений

1. `npm run dev` → http://localhost:3000/stakan-lenta?debug=1&reference=1
2. Overlay opacity 50%, difference mode — **нет geometric skew**
3. Fullscreen: нет TopNav/h1/footer
4. График GAZP 5m виден без клика
5. Кластеры: текст на тёмном фоне, POC — рамки, без green/red wash
6. `npm run test:visual` — diff ratio против 984×1200

---

*Аудит выполнен без изменения UI. Следующий шаг — Phase 0 + Phase 1 (контракт размеров + fullscreen layout).*
