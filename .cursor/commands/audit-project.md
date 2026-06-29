# Command: audit-project

Полный аудит репозитория.

## Scope

1. Stack & versions (`package.json`)
2. Routes (`app/`)
3. Data layer (`lib/data/`)
4. Components structure
5. Tests / CI (missing?)
6. Docs
7. Cursor OS completeness
8. MCP status
9. Tech debt (legacy adapters, unused home/)

## Output

- Executive summary (10 lines)
- Gaps & risks
- Quick wins (1–2 days)
- Roadmap alignment with SCREENERPRO_ROADMAP.md

## Do not

- Change production env
- Run destructive commands
- Commit

## Reference

Last audit baseline in `.cursor/docs/CURSOR_OS.md`
