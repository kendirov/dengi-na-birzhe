# Deployment — Market Lab



Инструкция для локальной разработки, GitHub и Vercel.



## Требования



- Node.js 20+

- npm 10+



## 1. Установка



```bash

git clone <your-repo-url>

cd market-lab

npm install

```



## 2. Переменные окружения



```bash

cp .env.example .env.local

```



| Переменная | Значение | Описание |

|------------|----------|----------|

| `MARKET_DATA_MODE` | `mock` | **Рекомендуется для MVP и Vercel** |

| `MARKET_DATA_MODE` | `live` | Только MOEX; при ошибке — пустой скринер |

| `MARKET_DATA_MODE` | `fallback` | MOEX, при сбое — mock с «Резервные данные» |

| `MOEX_BASE_URL` | `https://iss.moex.com` | ISS API |

| `MOEX_HTTP_TIMEOUT_MS` | `12000` | Таймаут запроса |

| `MARKET_DATA_REVALIDATE_SECONDS` | `900` | Кэш MOEX (15 минут) |



Подробнее о режимах: [DATA_MODES.md](./DATA_MODES.md)



### Рекомендация для первого деплоя



```

MARKET_DATA_MODE=mock

```



UI показывает **Учебные данные** и не зависит от iss.moex.com.



## 3. Локальная разработка



```bash

npm run dev

```



Проверьте:



- `/` — скринер с вводным блоком

- `/screener` — тот же экран

- `/lesson/setup`, `/lesson/orderbook`, `/lesson/density`



## 4. Production build



```bash

npm run build

npm run lint

npm start

```



## 5. Деплой на Vercel



1. Import GitHub repository

2. Framework: **Next.js**

3. Env: `MARKET_DATA_MODE=mock`

4. Deploy



## 6. Что проверить после deploy



| Проверка | Ожидание |

|----------|----------|

| `/` | Скринер, полоска «Учебные данные», 15 строк |

| `/screener` | То же, что `/` |

| Nav | Скринер, уроки — без «Главная» |

| Режимы | Фильтры и подборка работают |

| Уроки | Интерактивы кликабельны |



### Live MOEX (позже)



1. `MARKET_DATA_MODE=live` или `fallback`

2. Redeploy

3. Проверьте strip: **Данные MOEX** / **Резервные учебные данные** / **Ошибка данных**



Если iss.moex.com недоступен из региона Vercel — используйте `fallback`, не `live`.



## 7. Troubleshooting



**Пустой скринер**



- `MARKET_DATA_MODE=live` без доступа к MOEX → переключите на `mock` или `fallback`



**Build failed**



- Node 20+ в Project Settings

- `npm run build` локально

