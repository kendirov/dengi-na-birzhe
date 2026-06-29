# MCP Setup — Cursor

> Активный конфиг: [`.cursor/mcp.json`](../mcp.json)  
> Шаблон: [`.cursor/mcp/mcp.template.json`](../mcp/mcp.template.json)  
> Детали: [`.cursor/mcp/README.md`](../mcp/README.md)

## Быстрый старт (порядок подключения)

| # | Server | Действие |
|---|--------|----------|
| 1 | **Context7** | `npx ctx7 setup --cursor --mcp -p -y` → OAuth |
| 2 | **GitHub** | PAT → Settings → MCP → github → Edit |
| 3 | **Vercel** | Connect OAuth |
| 4 | **Playwright** | Enable in MCP list (auto) |
| 5 | **Supabase** | Connect OAuth → dev project + `read_only` |
| 6 | Figma / Sentry / Notion | Connect when needed |

После каждого: **Reload Window**.

---

## Context7

- OAuth URL: `https://mcp.context7.com/mcp/oauth`
- Промпт: `use context7 with /vercel/next.js for ...`
- API key alt: context7.com/dashboard → header `CONTEXT7_API_KEY`

## Supabase

```
https://mcp.supabase.com/mcp?read_only=true&project_ref=YOUR_REF&features=database,docs,development,debugging
```

⚠️ **Только dev/test. Не production.**

## GitHub + Bugbot

- PAT: https://github.com/settings/tokens
- Bugbot: repo Settings → Integrations → Cursor Bugbot
- PR review: comment `/review`

## Playwright + Cursor Browser

- Playwright MCP: browser automation
- Cursor Browser: enable in Agent settings for quick checks

## Figma

- Connect OAuth or chat: `/add-plugin figma`

## Vercel

- Project: `dengi-na-birzhe`
- CLI alt: `npx add-mcp https://mcp.vercel.com`

## Sentry / Notion

- OAuth via MCP Connect when prod monitoring / content base needed

## Future local MCPs

| Server | Path | Status |
|--------|------|--------|
| moex-market-data-mcp | `tools/mcp/moex-market-data/` | TODO |
| telegram-source-mcp | `tools/mcp/telegram-source/` | TODO |

Do not enable in `mcp.json` until implemented.

---

## Риски

| Risk | Mitigation |
|------|------------|
| Production Supabase data | read_only + dev project only |
| Secrets in git | Use Cursor UI / mcp.local.json |
| Live exchange/trading keys | Never add |
| MCP SQL write | Approve each tool call manually |
| Browser automation on prod | Prefer localhost for tests |

## Troubleshooting

- Red MCP dot → Reload Window, check Node 18+
- Missing webpack chunk → delete `.next`, restart dev (see ensure-next-dev.mjs)
- Context7 rate limit → API key from dashboard

Legacy copy also at repo root: `docs/MCP_SETUP.md` (points here).
