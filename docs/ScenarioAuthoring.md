# Scenario Authoring — рыночные сценарии CScalp Trainer

Документ для авторов учебных сценариев в режиме **Scenario** (`/stakan-lenta` → кнопка **Scenario**).

Сценарии — это JSON-подобные объекты в `src/features/terminal/data/scenarios.ts`. Движок воспроизведения: `src/features/terminal/engine/scenarioEngine.ts`.

## Структура сценария

```json
{
  "id": "bid-density",
  "name": "Плотность в bid",
  "description": "Краткое описание для панели преподавателя",
  "durationMs": 22000,
  "events": []
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | string | Уникальный slug (латиница, kebab-case) |
| `name` | string | Название в селекторе |
| `description` | string | Подзаголовок в панели управления |
| `durationMs` | number | Общая длительность таймлайна (мс) |
| `events` | array | События, отсортированные по `atMs` |

## Event types

Каждое событие обязательно содержит `atMs` (мс от старта) и `type`.

### `reset`

Восстанавливает стакан, ленту, кластеры и график к **baseline** (снимок при старте сценария).

```json
{ "atMs": 0, "type": "reset" }
```

Рекомендуется ставить первым событием каждого сценария.

### `addTapePrint`

Добавляет принт в ленту и обновляет последний кластер.

```json
{
  "atMs": 1500,
  "type": "addTapePrint",
  "side": "buy",
  "price": 101.75,
  "qty": 141,
  "isLarge": false
}
```

- `side`: `"buy"` | `"sell"`
- `price`: число, шаг 0.01 (GAZP sandbox)
- `qty`: объём лота
- `isLarge` (optional): крупный принт в UI

### `changeLevelVolume`

Меняет объём на уровне стакана.

```json
{ "atMs": 300, "type": "changeLevelVolume", "price": 101.62, "bidVol": 8500 }
```

```json
{ "atMs": 1700, "type": "changeLevelVolume", "price": 101.75, "deltaAsk": -120 }
```

- `askVol` / `bidVol` — абсолютное значение
- `deltaAsk` / `deltaBid` — приращение (если абсолют не задан)

После изменения пересчитываются heat и best bid/ask.

### `moveBestBidAsk`

Сдвигает спред: задаёт цены best ask / best bid и текущую цену.

```json
{
  "atMs": 6500,
  "type": "moveBestBidAsk",
  "bestAsk": 101.76,
  "bestBid": 101.74,
  "currentPrice": 101.75
}
```

Если на новых уровнях нет объёма — движок подставит минимальный mock-объём.

### `addUserOrder`

Добавляет учебную заявку пользователя (видна в стакане).

```json
{
  "atMs": 2500,
  "type": "addUserOrder",
  "side": "buy",
  "price": 101.75,
  "qty": 400,
  "orderType": "market"
}
```

- `orderType`: `"limit"` | `"market"` | `"stop"` (default `"limit"`)

### `fillUserOrder`

Помечает заявку исполненной.

```json
{ "atMs": 3600, "type": "fillUserOrder", "price": 101.75 }
```

или `{ "orderId": "sc-o-..." }`.

### `addClusterVolume`

Наращивает объём в последней (или указанной) свече кластера.

```json
{
  "atMs": 1400,
  "type": "addClusterVolume",
  "price": 101.75,
  "deltaSell": 141,
  "candleIndex": 9
}
```

- `buyVol` / `sellVol` — абсолют
- `deltaBuy` / `deltaSell` — приращение
- `candleIndex` (optional): 0–9, default — последняя колонка

### `showLessonCallout`

Показывает пояснение преподавателя поверх терминала.

```json
{
  "atMs": 900,
  "type": "showLessonCallout",
  "callout": {
    "title": "Плотность в bid",
    "text": "Крупный объём может удержать цену.",
    "targetSelector": "bid-zone",
    "calloutPosition": "left"
  }
}
```

### `pause`

Останавливает воспроизведение (как кнопка «Пауза»).

```json
{ "atMs": 21800, "type": "pause" }
```

## Привязка callout к элементу UI

Callout ищет элемент по атрибуту `data-tour-id` внутри терминала.

| targetSelector | Зона |
|----------------|------|
| `bid-zone` | Bid-половина стакана |
| `ask-zone` | Ask-половина стакана |
| `spread` | Линия текущей цены |
| `tape` | Лента сделок |
| `clusters` | Панель кластеров |
| `working-volume` | Рабочий объём / hotkeys |
| `orderbook` | Весь стакан |
| `instrument-gazp` | Шапка инструмента |

`calloutPosition`: `top` | `bottom` | `left` | `right` | `top-left` | `top-right` | `bottom-left` | `bottom-right`.

Если `targetSelector` не задан — callout показывается в левом верхнем углу терминала.

Новые якоря: добавьте `data-tour-id="my-zone"` в компонент и используйте тот же id в JSON.

## Добавление нового сценария

1. Откройте `src/features/terminal/data/scenarios.ts`.
2. Добавьте объект в массив `MARKET_SCENARIOS`.
3. Первое событие: `{ "atMs": 0, "type": "reset" }`.
4. Расставьте события по времени; `durationMs` ≥ максимального `atMs`.
5. Завершите сценарий `{ "type": "pause" }` или дождитесь конца таймлайна.

Цены sandbox GAZP: спред по умолчанию **101.75 / 101.73**, шаг **0.01**, диапазон **102.18–101.39**.

## Проверка сценария

### Ручная проверка в UI

1. `npm run dev`
2. Откройте `/stakan-lenta`
3. Нажмите **Scenario**
4. Выберите сценарий в селекторе
5. Проверьте:
   - **Старт / Пауза** — таймлайн идёт / стоит
   - **Шаг** — следующее событие без ожидания
   - **Сначала** — reset + replay с 0
   - **0.5x / 1x / 2x** — скорость
   - **Скрыть / Показать пояснения** — callout on/off

### Сборка

```bash
npm run build
```

### Чеклист качества

- [ ] `reset` в начале
- [ ] Callout привязан к существующему `data-tour-id`
- [ ] Принты не противоречат side/price (buy на ask, sell на bid — учебная условность)
- [ ] `durationMs` покрывает все события
- [ ] Пояснения на русском, без торговых рекомендаций
- [ ] Mock-данные не выдаются за live MOEX

## Presenter controls (UI)

Панель `ScenarioPresenter`:

| Control | Action |
|---------|--------|
| Селектор | `SCENARIO_SELECT` |
| Старт / Пауза | `SCENARIO_PLAY_PAUSE` |
| Шаг | `SCENARIO_STEP` |
| Сначала | `SCENARIO_RESTART` |
| 0.5x / 1x / 2x | `SCENARIO_SET_SPEED` |
| Скрыть/Показать пояснения | `SCENARIO_TOGGLE_ANNOTATIONS` |

## Архитектура

```
scenarios.ts          — данные (MARKET_SCENARIOS)
scenarioEngine.ts     — applyScenarioEvent, tick, step, restart
terminalStore.tsx     — reducer + interval tick (50ms × speed)
ScenarioPresenter.tsx — панель преподавателя
ScenarioCallout.tsx   — overlay пояснений
```

Baseline сохраняется при `SCENARIO_START` и используется событиями `reset` и кнопкой «Сначала».
