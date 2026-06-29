# Project Standards — ScreenerPRO / Деньги на бирже

## Architecture

- **Frontend:** Next.js App Router, React 19, TypeScript strict
- **Data:** Provider pattern — `getMarketInstruments()` single entry
- **No hidden backend** until Supabase lands in `supabase/`
- **Max content width:** 1680px (`lib/constants/brand.ts`)

## UI

- Dark terminal aesthetic — rule `30-ui-expensive-minimalism`
- Screener first — no marketing landing on `/`
- Table 12–13px, inspector 320–340px
- MOEX status always visible

## Data

- Modes: `mock` | `live` | `fallback`
- Never fabricate prices/signals
- Signal = formula + source + period + false-positive risk
- Browser MOEX fallback on Vercel (`useClientMoexFallback`)

## Security

- No secrets in git
- Supabase MCP: dev readonly only
- No production migrations without approval

## Reporting

Every task ends with rule `50-output-format-root-cause`:
1. Root cause / goal
2. Done
3. Files
4. Verify
5. Risks
6. Next step

## Git

- Repo: kendirov/dengi-na-birzhe
- Commits: only when owner asks (user rule)
- No force push main

## Build/dev

```bash
npm run dev    # via scripts/ensure-next-dev.mjs
npm run build  # not parallel with dev
npm run lint
```

## Code style

- Match existing patterns in file before editing
- Minimal diff
- Russian UI copy for user-facing text
- English for code identifiers

## Testing (current gap)

- No automated tests yet
- Use `qa-verifier` manual + browser checklists
- Future: Playwright e2e in CI

## Documentation

| Doc | Location |
|-----|----------|
| Data modes | `docs/DATA_MODES.md` |
| Deploy | `docs/DEPLOYMENT.md` |
| Product map | `docs/PRODUCT_STRUCTURE.md` |
| Cursor OS | `.cursor/docs/CURSOR_OS.md` |
