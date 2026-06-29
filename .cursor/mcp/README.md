# MCP Configuration

## Files

| File | Purpose |
|------|---------|
| `../mcp.json` | **Active** Cursor MCP config (project-level) |
| `mcp.template.json` | Full template with future servers |
| `../mcp.local.json` | Local secrets override (gitignored) |

Copy template → `mcp.json` only when adding new servers. **Never commit real tokens.**

---

## Server guide

### Context7 (priority 1)
- **URL:** `https://mcp.context7.com/mcp/oauth`
- **Auth:** OAuth in Cursor Connect
- **Use:** Next.js, React, Tailwind, Playwright, Supabase docs via `use context7`
- **Setup:** `npx ctx7 setup --cursor --mcp -p -y`

### Supabase (priority 2 — when DB exists)
- **URL:** `https://mcp.supabase.com/mcp?read_only=true&project_ref=...`
- **Auth:** OAuth
- **Use:** schema, SQL, migrations, types, advisors
- **Risk:** ⚠️ DEV/STAGING ONLY — never production data

### GitHub (priority 2)
- **URL:** `https://api.githubcopilot.com/mcp/`
- **Auth:** PAT in `Authorization: Bearer ...`
- **Use:** PR, issues, Actions, Bugbot `/review`
- **Repo:** kendirov/dengi-na-birzhe

### Playwright (priority 3)
- **Command:** `npx -y @playwright/mcp@latest`
- **Use:** /screener UI automation, console/network checks

### Figma (priority 4 — design work)
- **URL:** `https://mcp.figma.com/mcp`
- **Auth:** OAuth or `/add-plugin figma`

### Vercel (priority 2)
- **URL:** `https://mcp.vercel.com`
- **Auth:** OAuth
- **Use:** deployments, logs for dengi-na-birzhe

### Sentry (optional)
- **URL:** `https://mcp.sentry.dev/mcp`
- **Use:** prod errors, traces

### Notion (optional)
- **URL:** `https://mcp.notion.com/mcp`
- **Use:** courses, specs, content plan

### moex-market-data-mcp (future)
- **Local:** `./tools/mcp/moex-market-data/index.js`
- **Status:** NOT IMPLEMENTED — placeholder in template
- **Goal:** Wrap `lib/data/` as MCP tools for agents

### telegram-source-mcp (future)
- **Local:** `./tools/mcp/telegram-source/index.js`
- **Status:** NOT IMPLEMENTED
- **Env:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` — never commit

---

## Activation

1. Edit `../mcp.json` or copy from template
2. Cursor → Settings → Tools & MCP → Connect each server
3. Reload Window
4. Verify green dot + test prompt

## Risks

| Risk | Mitigation |
|------|------------|
| Prod DB via Supabase MCP | read_only + dev project_ref |
| Secrets in git | mcp.local.json, Cursor UI for PAT |
| Live trading keys | Never add to MCP |
| Dangerous SQL | Manual approve each MCP tool call |

See `.cursor/docs/MCP_SETUP.md` for step-by-step.
