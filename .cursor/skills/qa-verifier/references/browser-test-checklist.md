# Browser Test Checklist (Playwright MCP)

## Setup

Use Playwright MCP or Cursor Browser agent.

## Script outline

1. Navigate `/screener`
2. Wait for table rows > 0 OR error state
3. Screenshot viewport
4. Click first data row
5. Assert inspector shows ticker
6. Click mode «Для стакана» (spread)
7. Check console — no uncaught errors
8. Navigate `/money-management` — placeholder visible
9. Navigate `/workspace` — 8 zone cards

## Network

- MOEX ISS or fallback — no infinite spinner > 30s
- No 500 on page routes

## Mobile (optional)

- Horizontal scroll on lessons strip
- Nav scroll works

## Fail criteria

- Runtime error overlay
- Empty table in live mode with no error message
- Broken CSS (unstyled HTML)
