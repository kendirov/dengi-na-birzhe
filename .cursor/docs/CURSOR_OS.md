# Cursor OS — Деньги на бирже / ScreenerPRO

Операционная система для работы Cursor как **продуктовой агентной фабрики**, не просто IDE.

## Что создано

| Layer | Path | Count |
|-------|------|-------|
| Rules | `.cursor/rules/` | 9 files (00–60 + legacy) |
| Skills | `.cursor/skills/*/` | 8 skills + references |
| Agents | `.cursor/agents/` | 8 personas |
| Commands | `.cursor/commands/` | 8 workflows |
| MCP | `.cursor/mcp.json` + template | 8 live + 2 future |
| Docs | `.cursor/docs/` | This OS |

## Аудит проекта (baseline)

- **Stack:** Next.js 15.5, React 19, TS 5.9, Tailwind 4
- **Data:** MOEX ISS via `lib/data/provider.ts` (mock/live/fallback)
- **Routes:** screener, lessons, workspace, money-management (placeholders)
- **No:** Supabase in app, CI/tests, Python backend
- **Prod:** Vercel — https://dengi-na-birzhe.vercel.app/

## Как пользоваться

### Новая фича скринера
```
@build-feature + screener-widget-builder skill
```

### Рыночный брифинг
```
@create-market-brief
```

### Урок / слайд
```
@create-lesson / @create-slide-block
```

### Проверка перед «готово»
```
@verify-ui → qa-verifier skill → verifier agent
```

### Архитектура
Read `@architect` agent + rule `10-architecture`

## Rules priority

1. `00-product-principles` — продукт
2. `20-trading-data-safety` — данные
3. `60-security-and-secrets` — безопасность
4. `50-output-format` — отчёт
5. Legacy: `autonomous-workflow` — автономность для владельца

## Reload

После изменения `.cursor/mcp.json`: **Reload Window**

## Related

- [AGENT_WORKFLOW.md](./AGENT_WORKFLOW.md)
- [MCP_SETUP.md](./MCP_SETUP.md)
- [PROJECT_STANDARDS.md](./PROJECT_STANDARDS.md)
- [SCREENERPRO_ROADMAP.md](./SCREENERPRO_ROADMAP.md)
