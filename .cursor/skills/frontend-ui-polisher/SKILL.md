---
name: frontend-ui-polisher
description: >-
  Полировка UI trading dashboard: таблицы, фильтры, контраст, responsive,
  loading/error/empty. Expensive minimalism для /screener и уроков.
---

# Frontend UI Polisher

## Когда использовать

- Визуальный шум, плохая иерархия
- Таблица/инспектор на большом мониторе
- Новая страница-заготовка (/workspace, /money-management)

## Алгоритм

1. Audit экрана — что главное за 3 сек?
2. Убрать лишний текст и отступы
3. Проверить контраст (WCAG AA где возможно)
4. Таблица: font 12–13px, sticky header, selected row
5. States: loading, error, empty, mock label
6. Responsive: xl grid, mobile scroll
7. Verify: `verify-ui` command + Playwright MCP

## References

- `references/expensive-minimalism-ui.md`
- `references/trading-dashboard-ui.md`

## Файлы

- `components/ScreenerTable.tsx`
- `components/InstrumentInspector.tsx`
- `components/screener/ScreenerIntroPanel.tsx`
- `app/globals.css` — `.screener-table`
- `lib/constants/brand.ts` — CONTENT_MAX_WIDTH 1680px

## Не ломать

- MOEX data flow
- Scoring logic
