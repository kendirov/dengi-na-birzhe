# Signal Formulas — стиль документирования

Каждый сигнал описывается так:

```
## [Название]

**Формула:** ...
**Источник:** MOEX ISS field / computed / Supabase
**Период:** ...
**Задержка:** cache 15min / realtime
**Порог:** ...
**Ложный сигнал:** когда срабатывает ошибочно
**UI:** колонка / tag / filter id
```

## Уже в проекте

### Spread tradable
- spreadTicks, tickValueRub, commissionMarketTicks
- Режим `spread` в filter-modes

### Technical emphasis
- trades, turnoverRub, dayRangePct, changePct
- Режим `technical`

### Tick value / lot
- tickValueRub = tickSize × lotSize × price (approx)
- Источник: ISS + enrich

### Training picks
- 12 учебных тикеров, verdict yes/caution/no
- `lib/screener/training-picks.ts`

## Шаблон нового сигнала

```typescript
// lib/screener/signals/example-signal.ts
export function computeExampleSignal(inst: EnrichedInstrument): number | null {
  if (inst.price === null) return null;
  // formula
  return value;
}
```

Не добавлять в production scoring без review и формулы в этом файле.
