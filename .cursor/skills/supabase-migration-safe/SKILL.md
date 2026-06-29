---
name: supabase-migration-safe
description: >-
  Безопасные миграции Supabase: schema, RLS, indexes, types, rollback.
  Используй когда появится supabase/ в проекте или при работе через Supabase MCP.
---

# Supabase Migration Safe

## Принципы

- **Только dev/staging** через MCP (`read_only=true` по умолчанию)
- **Никогда** production data без explicit approval
- Каждая миграция = up + rollback SQL

## Workflow

1. **Inspect** — Supabase MCP: `list_tables`, schema
2. **Plan** — что меняется, impact на RLS
3. **Create** — `supabase/migrations/YYYYMMDDHHMMSS_name.sql`
4. **Indexes** — только после EXPLAIN
5. **RLS** — checklist в `references/rls-checklist.md`
6. **Types** — `generate_typescript_types`
7. **Test** — query на staging
8. **Warn** — production risk в отчёте

## Структура (когда создадим)

```
supabase/
  migrations/
  seed.sql
  config.toml
```

## Checklists

- `references/migration-checklist.md`
- `references/rls-checklist.md`

## Текущий статус проекта

Supabase **не подключён** в application code. MCP настроен для будущего ScreenerPRO backend.
