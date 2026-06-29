# Command: verify-ui

Проверь интерфейс фактически, не на словах.

## Steps

1. Skill: `qa-verifier`
2. `npm run lint` && `npm run build` (not parallel with dev)
3. Routes from manual-qa-checklist.md
4. Playwright MCP or Cursor Browser:
   - /screener table loads
   - select row → inspector
   - console errors
5. Screenshot mental note or describe viewport state

## URLs

- Local: http://localhost:3000/screener
- Prod: https://dengi-na-birzhe.vercel.app/screener

## Report

Pass/fail table. Any console/network errors quoted.

## Agent

Use `verifier.md` persona — skeptical.
