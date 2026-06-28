# Product Structure — Market Lab



Карта MVP: страницы, компоненты, data layer.



## Страницы



| Route | Файл | Назначение |

|-------|------|------------|

| `/` | `app/page.tsx` | Скринер (основной экран) |

| `/screener` | `app/screener/page.tsx` | Тот же скринер через `ScreenerScreen` |

| `/lesson/setup` | `app/lesson/setup/page.tsx` | Первое занятие |

| `/lesson/orderbook` | `app/lesson/orderbook/page.tsx` | Стакан, лента |

| `/lesson/density` | `app/lesson/density/page.tsx` | Плотности |

| `/lab` | `app/lab/page.tsx` | Dev map (hidden from nav) |



**Routing:** вариант A — `/` и `/screener` рендерят один `ScreenerScreen`, без redirect.



## Layout и shell



- `app/layout.tsx` — fonts, metadata

- `components/AppShell.tsx` — nav + footer + disclaimer

- `components/TopNav.tsx` — Скринер, уроки (без «Главная»)



## Screener



- `ScreenerScreen` — server wrapper, `getMarketInstruments()`

- `ScreenerIntroPanel` — компактный учебный блок сверху

- `ScreenerClient` — orchestration

- `ScreenerToolbar` — режимы, поиск, фильтры

- `ScreenerTable` — плотная таблица

- `InstrumentInspector` — главное / почему / риск / занятие / калькулятор

- `DataStatusStrip` — честный источник данных



### Home (legacy)



`components/home/*` — старый лендинг, **не используется** на `/`. Оставлен для возможного переиспользования блоков.



## Data layer



```

lib/data/

  types.ts

  config.ts

  provider.ts        ← getMarketInstruments()

  mock-instruments.ts

  moex-adapter.ts    ← ISS TQBR (all board securities + 15m cache)

  enrich.ts

  app/api/market-data/debug/route.ts  ← dev diagnostics

```



### Data modes



| Mode | UI label | Rows on MOEX fail |

|------|----------|-------------------|

| mock | Учебные данные | 15 mock tickers |

| live | MOEX ISS / Ошибка данных | Empty + error |

| fallback | Резервные данные | Mock + reason |

**Live:** ~485 TQBR instruments, cache 15 min (`MARKET_DATA_REVALIDATE_SECONDS=900`).



См. [DATA_MODES.md](./DATA_MODES.md)



## Screener logic



```

lib/screener/

  filter-modes.ts

  scoring.ts

  tags.ts

  insights.ts

  calculator.ts

```



## UX-акценты



1. **Пункт/лот** — cyan в таблице

2. **Спред** — amber, если дорогой

3. **DataStatusStrip** — всегда виден

4. Уроки — интерактив, короткие тексты



## Related docs



- [DATA_MODES.md](./DATA_MODES.md)

- [DEPLOYMENT.md](./DEPLOYMENT.md)

- [../README.md](../README.md)

