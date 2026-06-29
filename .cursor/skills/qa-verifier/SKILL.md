---
name: qa-verifier
description: >-
  Проверка качества: build, lint, typecheck, UI, console/network errors.
  Скептическая верификация — не доверять заявлениям без доказательств.
---

# QA Verifier

## Обязательные команды

```bash
npm run lint
npm run build
```

Не запускать build параллельно с dev.

## UI verification

- Dev: http://localhost:3000/screener
- Prod: https://dengi-na-birzhe.vercel.app/screener
- Playwright MCP или Cursor Browser
- Console errors = fail
- MOEX status shows source + row count

## Routes smoke test

- `/`, `/screener`, `/money-management`, `/workspace`
- `/lesson/orderbook`, `/lesson/density`, `/lesson/setup`

## Data verification

- Dev: `GET /api/market-data/debug` (404 in production — expected)
- source: moex | mock | fallback
- rowsCount > 0 in live mode

## Checklists

- `references/manual-qa-checklist.md`
- `references/browser-test-checklist.md`

## Report

Pass/fail per item. Screenshot or log if fail.
