# Command: create-market-brief

Сгенерируй рыночный брифинг из входных данных.

## Input

Пользователь даёт: заметки, новости, скрин, или «сделай брифинг на сегодня».

## Steps

1. Skill: `market-brief-editor`
2. Structure: `skills/market-brief-editor/references/brief-structure.md`
3. Separate news vs price reaction
4. MOEX context if data available (debug API / screener)
5. Optional: `content-repurposer` → Telegram version

## Output

- Markdown brief
- Timestamp analysis
- Scenarios (not predictions)
- Risks
- Disclaimer

## Data

Не выдумывать котировки. Если данных нет — пометить [TODO: data] и указать источник.
