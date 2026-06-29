"use client";

/**
 * Учебный стакан — только для /lesson/orderbook, не для /screener.
 *
 * TODO(orderbook-ui): Довести до CScalp-like макета:
 * ASK сверху, BID снизу, лента справа, цена/спред в центре.
 */
import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEY_DRIVE_BASICS } from "@/lib/screener/drive-basics-terms";
import { cn } from "@/lib/utils/format";

const DEMO = {
  ticker: "SBER",
  price: 312.45,
  changePct: 1.24,
  lot: 10,
  tickSize: 0.01,
  tickValue: 0.1,
  spreadPts: 3,
  spreadRub: 0.03,
  commLimitPts: 9.4,
  commMarketPts: 18.8,
};

/** ASK сверху (от дальнего к лучшему), BID снизу (от лучшего к дальнему) */
const ASK_LEVELS = [
  { price: 312.48, qty: 420 },
  { price: 312.46, qty: 890 },
  { price: 312.45, qty: 1240, best: true },
];

const BID_LEVELS = [
  { price: 312.42, qty: 1560, best: true },
  { price: 312.41, qty: 720 },
  { price: 312.39, qty: 380 },
];

const TAPE_ROWS = [
  { time: "10:25:04", price: 312.45, qty: 100, side: "buy" as const, large: true },
  { time: "10:25:03", price: 312.44, qty: 50, side: "sell" as const },
  { time: "10:25:02", price: 312.43, qty: 20, side: "buy" as const },
  { time: "10:25:01", price: 312.42, qty: 8, side: "sell" as const },
  { time: "10:24:58", price: 312.41, qty: 15, side: "buy" as const },
];

type PanelTermId =
  | "ticker"
  | "lot"
  | "tickSize"
  | "tickValue"
  | "bid"
  | "ask"
  | "spread"
  | "tape";

const PANEL_TERMS: { id: PanelTermId; label: string; hint: string }[] = [
  { id: "ticker", label: "Тикер", hint: "Код инструмента на бирже." },
  { id: "lot", label: "Лот", hint: "Минимальный размер заявки." },
  { id: "tickSize", label: "Шаг цены", hint: "Минимальное изменение цены." },
  { id: "tickValue", label: "Шаг/лот", hint: "Сколько рублей даёт 1 шаг цены на 1 лот." },
  { id: "bid", label: "Bid", hint: "Лучшая покупка." },
  { id: "ask", label: "Ask", hint: "Лучшая продажа." },
  { id: "spread", label: "Spread", hint: "Расстояние между ask и bid." },
  { id: "tape", label: "Лента", hint: "Реальные сделки: цена, объём, сторона." },
];

const SPARKLINE = [311.8, 312.1, 311.9, 312.3, 312.0, 312.45];

function readStoredOpen(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(STORAGE_KEY_DRIVE_BASICS);
  if (v === "false") return false;
  return true;
}

function maxQty(levels: { qty: number }[]): number {
  return Math.max(...levels.map((l) => l.qty), 1);
}

function BookRow({
  price,
  qty,
  maxVol,
  tone,
  best,
}: {
  price: number;
  qty: number;
  maxVol: number;
  tone: "ask" | "bid";
  best?: boolean;
}) {
  const barPct = (qty / maxVol) * 100;
  const isAsk = tone === "ask";

  return (
    <div
      className={cn(
        "relative grid grid-cols-[1fr_auto] items-center gap-2 px-1 py-px font-mono text-[10px] leading-tight",
        best && (isAsk ? "bg-red/[0.08]" : "bg-green/[0.08]"),
      )}
    >
      <div className="relative h-4 overflow-hidden rounded-sm">
        <div
          className={cn(
            "absolute inset-y-0 right-0 rounded-sm opacity-40",
            isAsk ? "bg-red/50" : "bg-green/50",
          )}
          style={{ width: `${barPct}%` }}
        />
        <span className="relative z-[1] pl-0.5 text-terminal-muted/80">{qty}</span>
      </div>
      <span
        className={cn(
          "tabular-nums",
          isAsk
            ? best
              ? "font-semibold text-red"
              : "text-red/80"
            : best
              ? "font-semibold text-green"
              : "text-green/80",
        )}
      >
        {price.toFixed(2)}
      </span>
    </div>
  );
}

function OrderBookColumn() {
  const askMax = maxQty(ASK_LEVELS);
  const bidMax = maxQty(BID_LEVELS);
  const bestAsk = ASK_LEVELS.find((l) => l.best)?.price ?? DEMO.price;
  const bestBid = BID_LEVELS.find((l) => l.best)?.price ?? DEMO.price;

  return (
    <div className="flex min-w-0 flex-col overflow-hidden font-mono">
      <p className="shrink-0 px-1 text-[8px] uppercase tracking-wider text-red/70">
        ASK — продавцы
      </p>
      <div className="min-h-0 flex-1 overflow-hidden">
        {ASK_LEVELS.map((lv) => (
          <BookRow
            key={`a-${lv.price}`}
            price={lv.price}
            qty={lv.qty}
            maxVol={askMax}
            tone="ask"
            best={lv.best}
          />
        ))}
      </div>

      <div className="shrink-0 border-y border-amber/25 bg-amber/[0.06] px-2 py-1 text-center">
        <div className="text-[9px] text-terminal-muted/80">
          <span className="text-red/90">{bestAsk.toFixed(2)}</span>
          <span className="mx-1.5 text-amber">{DEMO.spreadPts} п.</span>
          <span className="text-green/90">{bestBid.toFixed(2)}</span>
        </div>
        <p className="text-lg font-bold leading-none text-terminal-text">
          {DEMO.price.toFixed(2)}
        </p>
        <p className="text-[9px] text-green">+{DEMO.changePct.toFixed(2)}%</p>
      </div>

      <p className="shrink-0 px-1 text-[8px] uppercase tracking-wider text-green/70">
        BID — покупатели
      </p>
      <div className="min-h-0 flex-1 overflow-hidden">
        {BID_LEVELS.map((lv) => (
          <BookRow
            key={`b-${lv.price}`}
            price={lv.price}
            qty={lv.qty}
            maxVol={bidMax}
            tone="bid"
            best={lv.best}
          />
        ))}
      </div>
    </div>
  );
}

function PriceSparkline() {
  const min = Math.min(...SPARKLINE);
  const max = Math.max(...SPARKLINE);
  const range = max - min || 1;
  const w = 56;
  const h = 32;
  const points = SPARKLINE.map((v, i) => {
    const x = (i / (SPARKLINE.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) + 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="flex flex-col items-center justify-center px-1">
      <span className="font-mono text-[10px] font-bold text-cyan">{DEMO.ticker}</span>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-8 w-14" aria-hidden>
        <polyline
          points={points}
          fill="none"
          stroke="rgba(34, 211, 238, 0.65)"
          strokeWidth="1.2"
        />
      </svg>
      <span className="mt-0.5 font-mono text-[9px] text-terminal-muted">
        лот {DEMO.lot}
      </span>
    </div>
  );
}

function TapeColumn() {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden border-l border-terminal-border/50 pl-2 font-mono">
      <div className="grid shrink-0 grid-cols-[auto_1fr_auto_auto] gap-x-1.5 px-0.5 text-[8px] uppercase tracking-wider text-terminal-muted">
        <span>время</span>
        <span className="text-right">цена</span>
        <span className="text-right">объём</span>
        <span>стор.</span>
      </div>
      <div className="min-h-0 flex-1 space-y-px overflow-hidden">
        {TAPE_ROWS.map((row) => (
          <div
            key={row.time}
            className={cn(
              "grid grid-cols-[auto_1fr_auto_auto] gap-x-1.5 rounded px-0.5 py-px text-[10px] leading-tight",
              row.large
                ? "bg-amber/10 font-semibold"
                : row.side === "buy"
                  ? "bg-green/[0.05]"
                  : "bg-red/[0.05]",
            )}
          >
            <span className="text-terminal-muted/70">{row.time.slice(-8)}</span>
            <span
              className={cn(
                "text-right tabular-nums",
                row.large ? "text-amber" : row.side === "buy" ? "text-green" : "text-red",
              )}
            >
              {row.price.toFixed(2)}
            </span>
            <span className="text-right tabular-nums text-terminal-muted">{row.qty}</span>
            <span
              className={cn(
                "text-[9px] uppercase",
                row.side === "buy" ? "text-green/90" : "text-red/90",
              )}
            >
              {row.side === "buy" ? "buy" : "sell"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommissionBlock() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded border border-terminal-border/50 bg-[#080E18] px-2.5 py-1.5 font-mono text-[10px]">
      <span className="font-semibold text-terminal-text/90">Комиссия</span>
      <span className="text-terminal-muted">
        Лимитка — добавляет ликвидность. Рынок — забирает.
      </span>
      <span className="text-terminal-muted">
        Ком. лимит, п.{" "}
        <span className="text-cyan">{DEMO.commLimitPts.toFixed(1)}</span>
      </span>
      <span className="text-terminal-muted">
        Ком. рынок, п.{" "}
        <span className="text-amber">{DEMO.commMarketPts.toFixed(1)}</span>
      </span>
    </div>
  );
}

function TermBar({
  activeTerm,
  onSelect,
}: {
  activeTerm: PanelTermId;
  onSelect: (id: PanelTermId) => void;
}) {
  const hint = PANEL_TERMS.find((t) => t.id === activeTerm)?.hint ?? "";

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {PANEL_TERMS.map((term) => (
          <button
            key={term.id}
            type="button"
            onMouseEnter={() => onSelect(term.id)}
            onFocus={() => onSelect(term.id)}
            onClick={() => onSelect(term.id)}
            className={cn(
              "rounded border px-1.5 py-0.5 text-[9px] transition-colors",
              activeTerm === term.id
                ? "border-cyan/40 bg-cyan/10 text-cyan"
                : "border-terminal-border/50 text-terminal-muted hover:border-terminal-border hover:text-terminal-text",
            )}
          >
            {term.label}
          </button>
        ))}
      </div>
      {hint && (
        <p className="min-h-[14px] text-[10px] leading-snug text-terminal-muted">{hint}</p>
      )}
    </div>
  );
}

export function DriveBasicsPanel() {
  const [open, setOpen] = useState(true);
  const [activeTerm, setActiveTerm] = useState<PanelTermId>("bid");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOpen(readStoredOpen());
    setHydrated(true);
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_DRIVE_BASICS, String(next));
      return next;
    });
  }, []);

  if (!hydrated) {
    return (
      <section className="rounded-lg border border-terminal-border/60 bg-[#05070D] px-4 py-3">
        <div className="h-8 animate-pulse rounded bg-terminal-border/20" />
      </section>
    );
  }

  if (!open) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-terminal-border/60 bg-[#05070D] px-4 py-2.5">
        <span className="text-[11px] text-terminal-muted">
          Биржевой стакан и лента — показать
        </span>
        <button
          type="button"
          onClick={toggleOpen}
          className="rounded border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-[11px] font-medium text-cyan hover:bg-cyan/15"
        >
          Показать
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-terminal-border/70 bg-[#05070D] px-4 py-3 md:px-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-terminal-text">Биржевой стакан</h2>
          <p className="mt-0.5 text-[11px] text-terminal-muted">
            Перед сделкой проверяем bid/ask, spread, ленту и цену ошибки.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleOpen}
          className="shrink-0 rounded border border-terminal-border/60 px-2 py-0.5 text-[10px] text-terminal-muted hover:border-terminal-border hover:text-terminal-text"
        >
          Скрыть стакан
        </button>
      </div>

      <div className="mt-2.5 max-h-[240px] overflow-hidden rounded-lg border border-terminal-border/60 bg-[#060A12] p-2 md:max-h-[260px]">
        <div className="grid h-[200px] grid-cols-[1fr_auto_130px] gap-2 md:h-[220px] md:grid-cols-[minmax(0,1fr)_64px_minmax(130px,150px)]">
          <OrderBookColumn />
          <PriceSparkline />
          <TapeColumn />
        </div>
      </div>

      <div className="mt-2">
        <CommissionBlock />
      </div>

      <div className="mt-2">
        <TermBar activeTerm={activeTerm} onSelect={setActiveTerm} />
      </div>
    </section>
  );
}
