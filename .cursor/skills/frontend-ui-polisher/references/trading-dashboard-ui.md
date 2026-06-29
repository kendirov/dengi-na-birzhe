# Trading Dashboard UI

## Screener layout

```
[Header 56px]
[Intro + MOEX status]
[Type cards: Техничные | Для стакана]
[Lessons strip]
[Toolbar: modes | search | filters]
[Table ~~~~~~~~~~~~ | Inspector]
```

## Table columns priority

1. Ticker (sticky left, cyan)
2. Price, change%
3. Trades, turnover
4. Spread, tick/lot, commission

## Inspector priority

1. Decision (study / orderbook / skip)
2. Error price summary
3. Checklist
4. Trade calculator

## Breakpoints

| Width | Behavior |
|-------|----------|
| <1280 | Inspector below table |
| 1280–1680 | Side by side |
| >1680 | Centered container, no infinite stretch |

## MOEX status

- Compact, top-right of intro
- Green dot = live moex
