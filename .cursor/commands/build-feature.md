# Command: build-feature

Реализуй новую фичу end-to-end.

## Алгоритм

1. **Понять задачу** — продуктовая цель, не только код
2. **Inspect** — grep/read релевантные файлы (см. architect.md)
3. **Plan** — 3–7 шагов, минимальный scope
4. **Implement** — diff, следуй rules 10/20/30
5. **Verify** — lint, build, manual QA если UI
6. **Report** — format rule 50

## Skills по типу

| Тип | Skill |
|-----|-------|
| Screener widget | screener-widget-builder |
| UI polish | frontend-ui-polisher |
| Lesson | trading-lesson-builder |
| Supabase | supabase-migration-safe |

## Subagent

При большой фиче: architect → implement → verifier

## Stop conditions

- Нужен production secret → TODO, не блокировать весь прогресс
- Breaking data change → спросить через report risk, не молча ломать
