# ScreenerPRO Roadmap

Product: **Деньги на бирже** — MOEX intraday screener + trading education.

---

## Horizon 1 — Quick wins (1–2 days)

| Item | Value | Path |
|------|-------|------|
| Fill `/money-management` | Risk calculator stub | `app/money-management/` |
| Fill `/workspace` | Terminal zone map | `app/workspace/` |
| GitHub Actions CI | lint + build on PR | `.github/workflows/` |
| Deep link screener | `/screener?ticker=SBER` | `ScreenerClient` |
| Historical turnover MOEX | Better medians | `lib/data/` |
| Course lesson deep links | Hash anchors on density | `app/lesson/density/` |

---

## Horizon 2 — Medium (1–2 weeks)

| Module | Description |
|--------|-------------|
| **Oversold/overbought ATR** | Signal column + filter |
| **52W / historical low scanner** | Needs historical API |
| **Intraday momentum 5/15/60m** | Intraday bars source |
| **Abnormal volume** | turnover vs median |
| **Gap scanner** | Open vs prev close |
| **Sector heatmap** | Sector classification map |
| **Supabase watchlists** | User saved tickers |
| **Telegram brief generator** | content-repurposer pipeline |
| **Lesson builder UI** | Admin-lesson from transcript |
| **Presentation block generator** | Slide export |
| **UI cockpit mode** | Compact full-screen table |
| **Playwright e2e** | Core screener smoke |

---

## Horizon 3 — Strong modules (1–2 months)

| Module | Description |
|--------|-------------|
| **Futures / OI module** | MOEX derivatives data |
| **News-reaction module** | Timestamp news vs price |
| **Crypto screener branch** | Separate data adapter |
| **Market replay examples** | Historical tape replay |
| **Student checklist generator** | Per-lesson auto checklist |
| **Python analytics service** | Heavy compute off Next |
| **moex-market-data-mcp** | Local MCP for agents |
| **telegram-source-mcp** | Channel/news ingest |
| **Sentry prod monitoring** | Error budgets |
| **Notion CMS sync** | Course content source |

---

## Widget backlog (screener-widget-builder)

- Oversold/overbought by ATR
- Stock at 52W / historical minimum
- Anomalous volume
- Impulse 5/15/60 minutes
- Spread expansion
- Sector weakness/strength
- News vs price divergence
- OI / futures imbalance
- Distance to VWAP
- Max intraday drawdown list

---

## Education backlog (trading-lesson-builder)

- Money management interactive
- Workspace setup (merge setup lesson)
- Spread & volatility lesson page
- Bounce / breakout density scenarios (dedicated routes)

---

## Current state (done)

- ✅ MOEX live screener + browser fallback
- ✅ Lessons: setup, orderbook, density
- ✅ Rebrand «Деньги на бирже»
- ✅ Course lessons strip
- ✅ Cursor OS (rules, skills, agents, commands)
- ✅ Placeholder: workspace, money-management
- ✅ Desktop scale polish (1680px, table 12–13px)

---

## Priority recommendation

1. CI (lint/build)
2. `/money-management` calculator
3. Abnormal volume widget (data already partial)
4. Supabase dev project + watchlists
5. Telegram brief from market-brief-editor
