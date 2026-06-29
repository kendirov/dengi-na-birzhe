# Agent Workflow

## 1. Новая фича (код)

```
Product Manager → Architect → Implement → Verifier
```

| Step | Agent/Command | Output |
|------|---------------|--------|
| 1 | product-manager | Scope, trader value |
| 2 | architect | File list, risks |
| 3 | build-feature | Code diff |
| 4 | verify-ui | Pass/fail |

**Skills:** screener-widget-builder | frontend-ui-polisher | supabase-migration-safe

---

## 2. Рыночный брифинг

```
Trading Editor → create-market-brief → content-repurposer (Telegram)
```

**Skill:** market-brief-editor  
**Rule:** 20-trading-data-safety (fact vs interpretation)

---

## 3. Урок

```
Trading Editor → create-lesson → Presentation Designer (slides)
```

**Skills:** trading-lesson-builder, presentation-diagram-generator  
**Routes:** `/lesson/*`, `/workspace`, CourseLessonsStrip

---

## 4. Презентация / схема

```
create-slide-block → Figma MCP (optional)
```

**Skill:** presentation-diagram-generator

---

## 5. UI-полировка

```
frontend-ui agent → frontend-ui-polisher → verify-ui
```

**Rule:** 30-ui-expensive-minimalism

---

## 6. QA gate

```
verifier agent + qa-verifier skill
```

Mandatory before claiming done:
- `npm run lint`
- `npm run build`
- UI smoke (Playwright MCP)

---

## 7. Безопасная миграция Supabase

```
security-auditor → supabase-migration-safe → verifier
```

Only dev/staging. Rollback SQL required.

---

## Subagents (Cursor Task tool)

| Task | subagent_type |
|------|---------------|
| Code review PR | bugbot |
| Security diff | security-review |
| Explore codebase | explore |
| Shell/build | shell |

## Report format

Always rule `50-output-format-root-cause.mdc`
