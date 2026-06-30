# Деньги на бирже

Интерактивное пособие для **отбора инструментов** и **обучения внутридневной торговле** на MOEX.

> **Disclaimer:** учебный проект. Mock-данные и реконструкция терминала. **Не инвестиционная рекомендация. Не реальная торговля.**

Production: https://dengi-na-birzhe.vercel.app/

---

## Что это

| Часть | URL | Описание |
|-------|-----|----------|
| **Скринер** | `/`, `/screener` | Отбор акций MOEX (mock / live / fallback) |
| **CScalp Trainer** | `/stakan-lenta` | Учебный терминал: стакан, лента, кластеры, уроки, практика, сценарии |
| **Уроки (legacy)** | `/lesson/*` | Отдельные страницы курса |
| **Money management** | `/money-management` | Калькулятор риска |

Тренажёр `/stakan-lenta` — **sandbox без live API**: все цены и принты — учебная реконструкция GAZP.

---

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # опционально, для скринера
npm run dev
```

| URL | Назначение |
|-----|------------|
| http://localhost:3000/screener | Скринер |
| http://localhost:3000/stakan-lenta | CScalp Trainer |
| http://localhost:3000/stakan-lenta?mode=terminal | Только терминал |
| http://localhost:3000/stakan-lenta?debug=1 | Dev-панели (лентa, референс) |
| http://localhost:3000/stakan-lenta?debug=1&reference=1 | Visual QA checklist |

---

## Сборка и проверки

```bash
npm run build      # production build + TypeScript
npm run lint       # ESLint
npm run test:visual # screenshot + pixel diff (Playwright)
npx playwright install chromium  # первый запуск visual test
```

---

## Режимы тренажёра (`/stakan-lenta`)

| Режим | URL param | Назначение |
|-------|-----------|------------|
| **Терминал** | `mode=terminal` (default) | Свободная работа со стаканом |
| **Объяснение** | `mode=explain&lesson=anatomy` | Пошаговый тур с подсветкой |
| **Практика** | `mode=practice` | 10 механических заданий |
| **Сценарий** | `mode=scenario` | Рыночные ситуации (плотность, выкуп, …) |
| **Преподаватель** | `mode=presenter` | Тур + заметки справа |

Уроки: `lesson=anatomy` (15 шагов), `lesson=first-trade` (7 шагов). Шаг: `&step=3`.

---

## Горячие клавиши (тренажёр)

| Клавиша | Действие |
|---------|----------|
| `1`–`5` | Рабочий объём 50 / 100 / 200 / 400 / 800 |
| `F` | Снять все лимитные заявки |
| `D` | Закрыть позицию (объём = рабочий) |
| `T` | Market buy |
| `Y` | Market sell |
| `Shift` | Центрировать стакан |

ЛКМ / ПКМ по строке стакана — лимит или market (режим L/F). **ПКМ не открывает browser context menu** — перехвачен в стакане.

Hotkeys активны в режимах **Терминал** и **Практика**. `Shift` перехватывается — может конфликтовать с расширениями браузера; в полях ввода отключены.

---

## Как добавить урок

1. Шаги — `src/features/terminal/data/lessons.ts` (`LESSONS.anatomy`, `LESSONS["first-trade"]`).
2. Поля шага: `targetSelector` → `data-tour-id` в компонентах, `calloutPosition`, `highlightType`, `expectedAction`.
3. Логика перехода — `src/features/terminal/engine/lessonEngine.ts`.
4. Якоря UI: `TopBar`, `OrderBook`, `TapePanel`, `ClusterPanel`, `WorkingVolumePanel`, `InstrumentHeader`.

Документация: `.cursor/skills/trading-lesson-builder/SKILL.md`

---

## Как добавить сценарий

1. Объект в `src/features/terminal/data/scenarios.ts` → массив `MARKET_SCENARIOS`.
2. Event types и JSON-формат — `docs/ScenarioAuthoring.md`.
3. Движок — `src/features/terminal/engine/scenarioEngine.ts`.

---

## Reference overlay (pixel tuning)

1. Положите approved скрин **1024×768** в `public/reference/cscalp-reference.png`.
2. Откройте `/stakan-lenta?debug=1`.
3. Панель «Референс overlay»: show/hide, opacity 0–100%, Difference.
4. Overlay **не показывается**, если файла нет (HEAD 404).
5. Без `?debug=1` панели и overlay **скрыты** — production UI не затронут.

Подробнее: `docs/VisualReferenceChecklist.md`

---

## Visual QA

```bash
# UI checklist
/stakan-lenta?debug=1&reference=1

# Автотест
npm run test:visual
```

Результаты: `artifacts/screenshots/current.png`, `diff.png`. Порог: `scripts/visual-qa.config.json` (`failOnDiff: false` до approved reference).

---

## Данные скринера

```env
MARKET_DATA_MODE=mock      # default
MARKET_DATA_MODE=live      # MOEX ISS
MARKET_DATA_MODE=fallback  # live → mock при сбое
```

Тренажёр `/stakan-lenta` **не использует** MOEX — только `src/features/terminal/data/mockMarket.ts`.

Подробнее: [docs/DATA_MODES.md](docs/DATA_MODES.md)

---

## Assets (placeholders → production)

| Asset | Где менять |
|-------|------------|
| Логотип topbar | `--cscalp-logo-*` в `tokens.css` |
| Иконки pin/mute/filter | `TopBar.tsx`, `BottomTabs.tsx` |
| Reference screenshot | `public/reference/cscalp-reference.png` |
| Brand colors | `src/features/terminal/styles/tokens.css` |

---

## Структура (ключевые пути)

```
app/                          — Next.js pages
src/features/terminal/        — CScalp Trainer
  data/lessons.ts             — уроки
  data/scenarios.ts           — рыночные сценарии
  data/mockMarket.ts          — mock стакан GAZP
  engine/                     — tape, order, scenario, practice
  styles/tokens.css           — pixel tokens (tuning)
  components/                 — UI
lib/data/                     — MOEX provider (скрiner only)
docs/                         — ScenarioAuthoring, VisualReference, TeacherScript
scripts/visual-qa.mjs         — screenshot test
```

---

## Ограничения

- Тренажёр — **учебная реконструкция**, не CScalp и не брокерский терминал.
- Нет реальных заявок, ключей API, подключения к бирже из `/stakan-lenta`.
- Скринер может работать с MOEX ISS; тренажёр — всегда mock.
- Reference placeholder не 1024×768 — overlay/diff приблизительные до замены файла.
- Анимация ленты использует seeded PRNG (повторяемо), не live поток.

---

## Деплой

[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) · Vercel: `MARKET_DATA_MODE=mock` или `live` для скринера.

---

## Лицензия

Private / educational project.
