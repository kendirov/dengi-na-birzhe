# Interaction Model

## Tape (лента принтов) — связь со стаканом

Лента — **не таблица**, а поток круглых принтов между кластерами и стаканом, синхронизированный с price ladder построчно.

### Трейдерский смысл

| Что видите | Что это значит |
|------------|----------------|
| **Лимитки в стакане** | Заявки ждут исполнения — объём «лежит» в bid/ask строках |
| **Зелёный круг в ленте** | Агрессивная **покупка** — кто-то забрал ask (market buy) |
| **Красный круг** | Агрессивная **продажа** — удар по bid |
| **Выкуп плотности** | Объём в стакане **уменьшается**, в ленте появляется **крупный принт** на этом уровне |
| **Замедление ленты у уровня** | Много мелких принтов, цена **не уходит** — absorption / пауза, возможная слабость импульса |

### TapePrint (mock)

`id · side · price · qty · timestamp · intensity · isLarge · laneX · opacity`

- Размер круга ∝ √qty; `isLarge` ≥ 200 lot
- Новый print справа (~85%), **drift влево** + fade за ~5.2 s
- Market action пользователя → новый print + изменение стакана

### Scenario modes (tape)

| Mode | Поведение |
|------|-----------|
| **normal** | Редкие мелкие принты (1–58 lot) |
| **active** | Частые принты, больше объёма |
| **absorption** | Много принтов **в один уровень** (bestBid), стакан почти не двигается |
| **breakoutAttempt** | Серия зелёных принтов → сдвиг bestBid/bestAsk **+0.01** |

Debug panel: `?debug=1` — select mode, Add Buy/Sell Print, Run 10s Simulation.

---

## Order book — главный интерактив

Режимы **Terminal** и **Practice** — полная торговая логика. Explain/Presenter — только просмотр (клики заблокированы).

### Mouse

| Действие | Зона | Эффект |
|----------|------|--------|
| **ЛКМ** | Ask (≥ bestAsk, есть askSize) | Market **BUY** на рабочий объём |
| **ЛКМ** | Bid (≤ bestBid) | Limit **BUY** на цену строки |
| **ПКМ** | Bid (есть bidSize) | Market **SELL** |
| **ПКМ** | Ask (≥ bestAsk) | Limit **SELL** на цену строки |
| **СКМ / ×** | User order marker | Отмена заявки |
| **ПКМ** | anywhere in book | `preventDefault` — без browser menu |

### Keyboard (Terminal / Practice)

| Key | Действие |
|-----|----------|
| **1–5** | Рабочий объём: 50 / 100 / 200 / 400 / 800 |
| **T** | Market BUY |
| **Y** | Market SELL |
| **F** | Снять все лимитные заявки |
| **D** | Закрыть позицию по рынку + снять лимиты |
| **Shift** | Центрировать стакан на current price |

Rail-кнопки **D / L / F** — визуальный режим (L default). Hotkeys **F** и **D** — торговые действия.

### Визуальный feedback

- **User order marker** — бирюзовая метка `B qty` / `S qty` + кнопка ×
- **Position** — instrument strip: side, qty, avg, PnL points
- **lastFeedback** — последнее действие в header
- **Tape bubble** — каждая market/user сделка
- **Clusters** — последняя колонка обновляется от сделок

## Data model

```typescript
PriceLevel { price, askSize, bidSize, askHeat, bidHeat, isBestAsk, isBestBid, isCurrentPrice, userOrder? }
UserOrder { id, side, price, qty, type, status }
Position { side: long|short|flat, qty, avgPrice, pnlPoints }
```

Mock ladder GAZP: **102.18 → 101.39**, bestAsk **101.75**, bestBid **101.73**, current **101.74**.

Engine: `src/features/terminal/engine/orderEngine.ts`  
Mock: `src/features/terminal/data/mockMarket.ts`

## Manual test scenarios

### 1. Купить лимиткой

1. Режим **Terminal**, объём **100** (клавиша `2`)
2. **ЛКМ** на строке **101.70** (bid-зона, ≤ bestBid)
3. ✓ Метка `B 100` на 101.70, feedback «Limit BUY…»

### 2. Продать лимиткой

1. Объём **200** (`3`)
2. **ПКМ** на строке **101.80** (ask-зона, ≥ bestAsk)
3. ✓ Метка `S 200` на 101.80

### 3. Купить по рынку

1. Объём **400** (`4`)
2. **ЛКМ** на best ask **101.75** или hotkey **T**
3. ✓ Зелёный bubble в ленте, position **long**, askSize уменьшился

### 4. Продать по рынку

1. Открыть long (шаг 3)
2. **ПКМ** на best bid **101.73** или hotkey **Y**
3. ✓ Красный bubble, position уменьшается / flat

### 5. Отменить F

1. Поставить 2 лимитки (buy + sell)
2. Нажать **F**
3. ✓ Все markers исчезли, feedback «Все лимитные заявки сняты»

### 6. Закрыть D

1. Market buy → long
2. Нажать **D**
3. ✓ Market sell на qty позиции, position flat, лимиты сняты

### 7. Сменить объём 1–5

1. Нажимать **1**…**5**
2. ✓ Rail key подсвечен (50…800), header показывает `100L` и т.д.
3. Новая заявка использует выбранный объём

### 8. Центрировать Shift

1. Прокрутить стакан
2. **Shift**
3. ✓ Scroll центрирует строку **101.74** (current)

## Trainer modes (lesson overlay)

| Mode | Order book |
|------|------------|
| Terminal | Full |
| Practice | Full |
| Explain | View only |
| Presenter | View only |
| Scenario | Paused random tape |

## Sim engine

1. Random tape (not paused): `randomTapeBubble` → `applyMarketOrderToLadder` → bubble + cluster
2. User trades: `applyBookAction` → BOOK_TRADE reducer
3. Bubble TTL 3.5s, fade 1.2s

## Data boundaries

- No network I/O
- Single instrument GAZP mock
- Disclaimer always visible
