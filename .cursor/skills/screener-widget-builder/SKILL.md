---
name: screener-widget-builder
description: >-
  Разработка новых виджетов и сигналов для ScreenerPRO/MOEX-скринера.
  Используй при добавлении колонок, фильтров, скоринга, intraday-сигналов,
  oversold/volume/momentum виджетов.
---

# Screener Widget Builder

## Когда использовать

- Новый торговый сигнал или колонка в скринере
- Фильтр, сортировка, режим отбора
- Виджет: oversold, 52W low, anomalous volume, momentum, spread expansion

## Алгоритм

1. **Торговая идея** — что трейдер должен увидеть за 3 секунды?
2. **Формула** — записать в `references/signal-formulas.md` стиль
3. **Данные** — что есть в `EnrichedInstrument` / MOEX ISS / будущий Supabase?
4. **Backend** — enrich в `lib/data/enrich.ts` или `lib/screener/` (не ломать provider)
5. **Frontend** — колонка в `ScreenerTable`, фильтр в `ScreenerToolbar`, tag в `InstrumentTag`
6. **States** — loading / error / empty / mock label
7. **Риск ложного сигнала** — описать в UI tooltip или inspector

## Файлы проекта

| Задача | Файл |
|--------|------|
| Provider | `lib/data/provider.ts` |
| Enrich | `lib/data/enrich.ts` |
| Filters/scoring | `lib/screener/filter-modes.ts` |
| Types | `lib/types/instrument.ts`, `lib/types/screener.ts` |
| Table | `components/ScreenerTable.tsx` |
| Toolbar | `components/screener/ScreenerToolbar.tsx` |
| Inspector | `components/InstrumentInspector.tsx` |

## Примеры виджетов

См. `references/widget-checklist.md`

## Проверка

- `npm run build` && `npm run lint`
- MOEX live: `/api/market-data/debug` (dev only)
- Не менять scoring существующих режимов без явной задачи

## Output

- Формула + источник + период + latency
- Diff файлов
- Риск ложного сигнала
