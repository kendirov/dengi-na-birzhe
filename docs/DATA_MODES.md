# Режимы данных — Market Lab

Как проект получает котировки и что показывает UI.

## Переменные окружения

```env
MARKET_DATA_MODE=mock      # по умолчанию
MARKET_DATA_MODE=live
MARKET_DATA_MODE=fallback

MOEX_BASE_URL=https://iss.moex.com
MOEX_HTTP_TIMEOUT_MS=12000
MARKET_DATA_REVALIDATE_SECONDS=900   # 900 = 15 минут кэша
```

Точка входа: `lib/data/provider.ts` → `getMarketInstruments()`.

## Режимы

| Режим | Запрос к MOEX | `status.source` | UI (DataStatusStrip) | Строки при сбое MOEX |
|-------|---------------|-----------------|----------------------|----------------------|
| **mock** | Нет | `mock` | Учебные данные | — (всегда 15 mock-тикеров) |
| **live** | Да | `moex` или `error` | MOEX ISS / Ошибка данных | **Пустая таблица**, mock не подставляется |
| **fallback** | Да | `moex` или `fallback` | MOEX ISS / Резервные данные | Mock + текст причины |

**Правило:** mock и fallback **никогда** не показываются как «MOEX ISS live».

## Что считается live

- `status.source === "moex"` и `status.isLive === true`
- Данные пришли из `lib/data/moex-adapter.ts` (ISS TQBR, **все** бумаги board)
- Цена, оборот, сделки, high/low — с биржи
- Спред — из BID/OFFER, если есть; иначе `—` в таблице
- `avgTurnover20d` / `avgTrades20d` — пока `null` (нет исторической базы)
- `baselineStatus: "missing"` для live; scoring использует percentile текущего рынка

## Кэш 15 минут

- TTL задаётся `MARKET_DATA_REVALIDATE_SECONDS=900`
- Реализация: `unstable_cache` + in-memory слой для diagnostics (`cache: hit|miss|stale|none`)
- Fetch к MOEX также с `next: { revalidate: 900 }`
- В UI: «обновлено HH:MM», «кэш hit/miss»

## Проверка локально

### mock (default)

```bash
# .env.local
MARKET_DATA_MODE=mock
npm run dev
```

Ожидание на `/`:
- полоска «Учебные данные»
- 15 инструментов из `mock-instruments.ts`

### live

```bash
MARKET_DATA_MODE=live
npm run dev
```

Если MOEX доступен:
- «MOEX ISS», `source=moex`, `isLive=true`
- 400+ строк TQBR, реальные LAST, VALTODAY, NUMTRADES

Если MOEX недоступен (VPN, firewall, выходной без данных):
- «Ошибка данных», пустая таблица
- mock **не** показывается
- Для разработки без MOEX: `MARKET_DATA_MODE=fallback`

### fallback

```bash
MARKET_DATA_MODE=fallback
npm run dev
```

- сначала MOEX; при успехе — как live
- при сбое — «Резервные данные» + mock + `fallbackReason`

### Debug endpoint (только development)

```
GET http://localhost:3000/api/market-data/debug
GET http://localhost:3000/api/market-data/debug?mode=mock
GET http://localhost:3000/api/market-data/debug?mode=fallback
```

Ответ:

```json
{
  "status": { "source": "moex", "isLive": true, ... },
  "diagnostics": { "fetchMs": 3, "cache": "hit", "rowsRaw": 494, ... },
  "rowsCount": 485,
  "sample": [ ... первые 3 инструмента ... ]
}
```

## MOEX endpoint

```
GET https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json
  ?iss.meta=off
  &iss.only=securities,marketdata
```

Парсер: `lib/data/moex-adapter.ts` — все бумаги TQBR, без фильтра watchlist.

## TODO (следующий этап)

1. Исторические обороты MOEX для `avgTurnover20d` / `avgTrades20d`
2. Режим «Объём выше нормы» (нужна 20д база)
3. Периодический refresh в live-режиме (client poll / ISR)

## Связанные файлы

- `lib/data/config.ts` — чтение env
- `lib/data/provider.ts` — ветвление mock / live / fallback
- `lib/data/moex-adapter.ts` — ISS fetch + parse + cache
- `components/screener/DataStatusStrip.tsx` — честная подпись в UI
- `app/api/market-data/debug/route.ts` — dev-диагностика
