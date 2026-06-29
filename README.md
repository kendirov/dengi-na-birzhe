# Деньги на бирже

Интерактивное пособие для **отбора инструментов** внутридневной торговли на MOEX.



При открытии сайта пользователь сразу попадает в скринер — без маркетингового лендинга.



> **Disclaimer:** учебный проект. Не инвестиционная рекомендация.



## Стек



- Next.js 15 (App Router)

- TypeScript

- Tailwind CSS 4



Без backend, auth, CMS и базы данных на этапе MVP.



## Быстрый старт



```bash

npm install

cp .env.example .env.local   # опционально

npm run dev

```



Откройте [http://localhost:3000](http://localhost:3000) — сразу скринер.



## Сборка



```bash

npm run build

npm run lint

npm start

```



## Страницы



| URL | Назначение |

|-----|------------|

| `/` | Скринер (тот же экран, что `/screener`) |

| `/screener` | Скринер — alias для `/` |

| `/lesson/setup` | Первое занятие: терминал и рабочее место |

| `/lesson/orderbook` | Стакан, лента, кластеры |

| `/lesson/density` | Плотности и сценарии |

| `/lab` | Dev-карта (не в публичной навигации) |



## Данные

По умолчанию — **mock** (учебные данные, явно помечены в UI).

```env
MARKET_DATA_MODE=mock      # default — «Учебные данные»
MARKET_DATA_MODE=live      # MOEX ISS; при ошибке — пустой скринер
MARKET_DATA_MODE=fallback  # MOEX → при сбое mock с меткой «Резервные данные»

MOEX_BASE_URL=https://iss.moex.com
MOEX_HTTP_TIMEOUT_MS=12000
MARKET_DATA_REVALIDATE_SECONDS=900   # кэш 15 минут
```

Точка входа: `lib/data/provider.ts` → `getMarketInstruments()`.

**Live:** все акции TQBR с MOEX ISS (~400+ инструментов), кэш 15 минут.

**Проверка (dev):** `http://localhost:3000/api/market-data/debug`

Подробнее: [docs/DATA_MODES.md](docs/DATA_MODES.md)



## Деплой



[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)



Для Vercel рекомендуется `MARKET_DATA_MODE=mock`.



## Структура



```

app/           — страницы

components/    — screener, lesson, shell

lib/data/      — provider, mock, MOEX adapter

lib/screener/  — фильтры, scoring, enrich

docs/          — deployment, data modes, product map

```



## Следующий этап



1. Исторические обороты MOEX для 20д средних

2. Live refresh на скринере

3. Deep links `/screener?ticker=SBER`



## Лицензия



Private / educational project.

