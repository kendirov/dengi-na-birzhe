"use client";

/**
 * Интерактивный учебный стакан для /lesson/orderbook.
 *
 * TODO(orderbook-ui): Довести до CScalp-like макета:
 * ASK сверху, BID снизу, лента справа, цена/спред в центре.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SCENARIO_CONFIGS,
  GLOSSARY_TERMS,
  getBestBid,
  getBestAsk,
  spreadTicks,
  createAutoTapePrint,
  fmtTime,
  type SandboxScenarioId,
  type GlossaryTermId,
  type BookLevel,
  type TapePrint,
  type UserOrder,
} from "@/lib/lesson/orderbook-sandbox";
import { cn } from "@/lib/utils/format";

const MAX_TAPE = 12;

function cloneLevels(levels: BookLevel[]): BookLevel[] {
  return levels.map((l) => ({ ...l }));
}

function initScenario(id: SandboxScenarioId) {
  const cfg = SCENARIO_CONFIGS[id];
  return {
    levels: cloneLevels(cfg.levels),
    tape: [...cfg.initialTape],
    userOrders: [] as UserOrder[],
    message: null as string | null,
    messageTone: "cyan" as "cyan" | "green" | "amber" | "red",
  };
}

export function OrderBookSandbox() {
  const [scenarioId, setScenarioId] = useState<SandboxScenarioId>("working");
  const [levels, setLevels] = useState<BookLevel[]>(() =>
    cloneLevels(SCENARIO_CONFIGS.working.levels),
  );
  const [tape, setTape] = useState<TapePrint[]>(() => [
    ...SCENARIO_CONFIGS.working.initialTape,
  ]);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"cyan" | "green" | "amber" | "red">("cyan");
  const [activeTerm, setActiveTerm] = useState<GlossaryTermId>("bid");
  const [highlight, setHighlight] = useState<string | null>("bid");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [icebergMode, setIcebergMode] = useState(false);
  const [flashTapeId, setFlashTapeId] = useState<string | null>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  const levelsRef = useRef(levels);
  levelsRef.current = levels;

  const scenario = SCENARIO_CONFIGS[scenarioId];
  const bestBid = useMemo(() => getBestBid(levels), [levels]);
  const bestAsk = useMemo(() => getBestAsk(levels), [levels]);
  const spread = spreadTicks(bestBid, bestAsk, scenario.tickSize);
  const tickValue = scenario.tickSize * scenario.lotSize;

  const askLevels = useMemo(
    () =>
      [...levels]
        .filter((l) => l.askQty > 0)
        .sort((a, b) => b.price - a.price),
    [levels],
  );

  const bidLevels = useMemo(
    () =>
      [...levels]
        .filter((l) => l.bidQty > 0)
        .sort((a, b) => b.price - a.price),
    [levels],
  );

  const switchScenario = useCallback((id: SandboxScenarioId) => {
    const init = initScenario(id);
    setScenarioId(id);
    setLevels(init.levels);
    setTape(init.tape);
    setUserOrders([]);
    setMessage(null);
    setSelectedLevel(null);
    setIcebergMode(id === "density");
  }, []);

  const pushTape = useCallback((print: TapePrint) => {
    setTape((prev) => [print, ...prev].slice(0, MAX_TAPE));
    setFlashTapeId(print.id);
    window.setTimeout(() => setFlashTapeId(null), 500);
  }, []);

  const showMsg = useCallback(
    (text: string, tone: typeof messageTone = "cyan") => {
      setMessage(text);
      setMessageTone(tone);
    },
    [],
  );

  const placeLimit = useCallback(() => {
    if (!bestBid) return;
    const price = selectedLevel ?? bestBid.price;
    const order: UserOrder = {
      id: `u-${Date.now()}`,
      price,
      qty: scenario.lotSize * 5,
      side: "bid",
      isUser: true,
    };
    setUserOrders((prev) => [...prev, order]);
    setLevels((prev) =>
      prev.map((l) =>
        l.price === price ? { ...l, bidQty: l.bidQty + order.qty } : l,
      ),
    );
    showMsg("Лимитная заявка в стакане. Добавляет ликвидность / maker.", "green");
    setHighlight("maker-note");
    setActiveTerm("maker");
  }, [bestBid, selectedLevel, scenario.lotSize, showMsg]);

  const buyMarket = useCallback(() => {
    if (!bestAsk) return;
    const qty = scenario.lotSize * 3;
    const hitQty = Math.min(qty, bestAsk.askQty);
    const price = bestAsk.price;

    setLevels((prev) => {
      const next = prev.map((l) => {
        if (l.price !== price) return l;
        return { ...l, askQty: Math.max(0, l.askQty - hitQty) };
      });
      return next.filter((l) => l.bidQty > 0 || l.askQty > 0);
    });

    pushTape({
      id: `m-${Date.now()}`,
      time: fmtTime(),
      price,
      qty: hitQty,
      side: "buy",
      aggressive: true,
      note: "market buy",
    });

    const slip =
      scenarioId === "empty"
        ? " В тонком стакане возможно проскальзывание."
        : "";
    showMsg(`Рыночная покупка по ${price.toFixed(2)}. Забирает ликвидность / taker.${slip}`, "amber");
    setHighlight("taker-note");
    setActiveTerm("taker");
  }, [bestAsk, scenario.lotSize, scenarioId, pushTape, showMsg]);

  const hitDensity = useCallback(() => {
    const densityLevel = levels.find((l) => l.isDensity);
    if (!densityLevel) {
      showMsg("В этом сценарии выберите «Плотность».", "amber");
      return;
    }

    const hit = 2000;
    setLevels((prev) =>
      prev.map((l) => {
        if (!l.isDensity) return l;
        const newBid = Math.max(0, l.bidQty - hit);
        if (icebergMode && l.icebergHidden) {
          const restore = Math.min(hit, l.icebergHidden);
          return {
            ...l,
            bidQty: newBid + restore,
            icebergHidden: l.icebergHidden - restore,
          };
        }
        return { ...l, bidQty: newBid };
      }),
    );

    pushTape({
      id: `den-${Date.now()}`,
      time: fmtTime(),
      price: densityLevel.price,
      qty: hit,
      side: "sell",
      aggressive: true,
      note: icebergMode ? "удар по плотности" : "разъедание",
    });

    showMsg(
      icebergMode
        ? "Удар по плотности. Видимый объём айсберга восстановился — учебная модель."
        : "Удар по плотности. Часть объёма исполнена, уровень уменьшился.",
      icebergMode ? "cyan" : "amber",
    );
    setHighlight("density");
    setActiveTerm("density");
  }, [levels, icebergMode, pushTape, showMsg]);

  useEffect(() => {
    const cfg = SCENARIO_CONFIGS[scenarioId];
    if (!cfg.autoTapeEnabled) return;
    const id = window.setInterval(() => {
      const lv = levelsRef.current;
      pushTape(createAutoTapePrint(cfg, getBestBid(lv), getBestAsk(lv)));
    }, cfg.tapeIntervalMs);
    return () => window.clearInterval(id);
  }, [scenarioId, pushTape]);

  const onTermClick = (termId: GlossaryTermId, hl: string) => {
    setActiveTerm(termId);
    setHighlight(hl);
  };

  const onLevelClick = (price: number, side: "bid" | "ask") => {
    setSelectedLevel(price);
    showMsg(
      `Лимитная заявка на ${price.toFixed(2)} (${side === "bid" ? "покупка" : "продажа"}). Встаёт в очередь на уровне.`,
      "cyan",
    );
    setHighlight("limit-actions");
    setActiveTerm("limitOrder");
  };

  const activeGlossary = GLOSSARY_TERMS.find((t) => t.id === activeTerm);

  return (
    <div className="space-y-4">
      {/* Scenarios */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SCENARIO_CONFIGS) as SandboxScenarioId[]).map((id) => {
          const cfg = SCENARIO_CONFIGS[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => switchScenario(id)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left transition-colors",
                scenarioId === id
                  ? "border-cyan/40 bg-cyan/10 text-cyan"
                  : "border-terminal-border bg-terminal-card text-terminal-muted hover:border-cyan/20",
              )}
            >
              <span className="block text-xs font-medium">{cfg.label}</span>
              <span className="mt-0.5 hidden text-[10px] opacity-80 sm:block">
                {cfg.description}
              </span>
            </button>
          );
        })}
      </div>

      {message && (
        <p
          className={cn(
            "rounded border px-3 py-2 text-[11px]",
            messageTone === "green" && "border-green/30 bg-green/10 text-green",
            messageTone === "amber" && "border-amber/30 bg-amber/10 text-amber",
            messageTone === "red" && "border-red/30 bg-red/10 text-red",
            messageTone === "cyan" && "border-cyan/30 bg-cyan/10 text-cyan",
          )}
          data-highlight="maker-note taker-note"
        >
          {message}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          {/* Block 1: Order book */}
          <SandboxSection title="1. Стакан" highlightId="book">
            <div
              className={cn(
                "overflow-hidden rounded-lg border border-terminal-border/70 bg-[#060A12] font-mono text-[11px]",
                highlight === "bid" || highlight === "ask" || highlight === "spread"
                  ? "ring-1 ring-cyan/30"
                  : "",
              )}
              data-highlight="bid ask spread"
            >
              <div className="flex items-center justify-between border-b border-terminal-border/50 px-3 py-2">
                <span className="font-bold text-cyan">SBER</span>
                <span className="text-terminal-muted">учебный DOM · {scenario.label}</span>
              </div>

              <div className="px-2 py-1">
                <p className="mb-1 text-[8px] uppercase tracking-wider text-red/70">Ask</p>
                {askLevels.map((lv) => (
                  <BookRow
                    key={`a-${lv.price}`}
                    price={lv.price}
                    qty={lv.askQty}
                    side="ask"
                    isBest={lv.price === bestAsk?.price}
                    isDensity={false}
                    highlighted={highlight === "ask"}
                    onClick={() => onLevelClick(lv.price, "ask")}
                  />
                ))}

                <div
                  className={cn(
                    "my-1 flex items-center justify-center gap-2 border-y border-amber/25 bg-amber/[0.07] py-1.5",
                    highlight === "spread" && "ring-1 ring-amber/40",
                  )}
                  data-highlight="spread"
                >
                  <span className="text-amber font-semibold">
                    spread {spread ?? "—"} п.
                  </span>
                  {bestBid && bestAsk && (
                    <span className="text-[10px] text-terminal-muted">
                      {bestBid.price.toFixed(2)} ↔ {bestAsk.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="mb-1 text-[8px] uppercase tracking-wider text-green/70">Bid</p>
                {bidLevels.map((lv) => {
                  const userAtLevel = userOrders
                    .filter((o) => o.price === lv.price)
                    .reduce((s, o) => s + o.qty, 0);
                  return (
                    <BookRow
                      key={`b-${lv.price}`}
                      price={lv.price}
                      qty={lv.bidQty}
                      side="bid"
                      isBest={lv.price === bestBid?.price}
                      isDensity={lv.isDensity}
                      userQty={userAtLevel}
                      iceberg={icebergMode && lv.isDensity && lv.icebergHidden}
                      highlighted={highlight === "bid" || (highlight === "density" && lv.isDensity)}
                      onClick={() => onLevelClick(lv.price, "bid")}
                    />
                  );
                })}
              </div>
            </div>
            <p className="mt-2 text-[10px] text-terminal-muted">
              Клик по уровню — лимитная заявка в очереди на этой цене.
            </p>
          </SandboxSection>

          {/* Block 2: Tape */}
          <SandboxSection title="2. Лента сделок" highlightId="tape">
            <div
              ref={tapeRef}
              className={cn(
                "overflow-hidden rounded-lg border border-terminal-border/70 bg-[#060A12]",
                highlight === "tape" && "ring-1 ring-cyan/30",
              )}
              data-highlight="tape"
            >
              <div className="grid grid-cols-4 border-b border-terminal-border/50 px-2 py-1.5 text-[8px] uppercase tracking-wider text-terminal-muted">
                <span>Время</span>
                <span>Цена</span>
                <span>Qty</span>
                <span className="text-right">Сторона</span>
              </div>
              <div className="max-h-[180px] overflow-y-auto scrollbar-terminal">
                {tape.length === 0 ? (
                  <p className="px-3 py-6 text-center text-[10px] text-terminal-muted">
                    Лента пуста — нажмите «Купить рынком» или смените сценарий.
                  </p>
                ) : (
                  tape.map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        "grid grid-cols-4 border-b border-terminal-border/20 px-2 py-1 font-mono text-[10px] transition-colors",
                        flashTapeId === p.id && "bg-cyan/15",
                        p.aggressive && p.side === "buy" && "bg-green/[0.06]",
                        p.aggressive && p.side === "sell" && "bg-red/[0.06]",
                        p.qty >= 100 && "font-semibold",
                      )}
                    >
                      <span className="text-terminal-muted">{p.time}</span>
                      <span>{p.price.toFixed(2)}</span>
                      <span>{p.qty}</span>
                      <span
                        className={cn(
                          "text-right uppercase",
                          p.side === "buy" ? "text-green" : "text-red",
                        )}
                      >
                        {p.side}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="mt-2 text-[10px] text-terminal-muted">
              Зелёный — агрессивная покупка. Красный — агрессивная продажа.
              {scenario.autoTapeEnabled
                ? ` Авто-лента каждые ${scenario.tapeIntervalMs / 1000} с.`
                : ""}
            </p>
          </SandboxSection>

          {/* Block 3: Limit vs Market */}
          <SandboxSection title="3. Лимитка vs рынок">
            <div className="flex flex-wrap gap-2" data-highlight="limit-actions market-actions">
              <ActionButton
                label="Поставить лимитку"
                tone="green"
                active={highlight === "limit-actions" || highlight === "maker-note"}
                onClick={placeLimit}
              />
              <ActionButton
                label="Купить рынком"
                tone="amber"
                active={highlight === "market-actions" || highlight === "taker-note"}
                onClick={buyMarket}
              />
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <NoteCard tone="green" highlightId="maker-note" active={highlight === "maker-note"}>
                Maker — лимитка добавляет объём в стакан и ждёт.
              </NoteCard>
              <NoteCard tone="amber" highlightId="taker-note" active={highlight === "taker-note"}>
                Taker — рынок бьёт по лучшему ask/bid и исполняется сразу.
              </NoteCard>
            </div>
          </SandboxSection>

          {/* Block 4: Density */}
          <SandboxSection title="4. Плотность" highlightId="density">
            <div className="flex flex-wrap items-center gap-3">
              <ActionButton
                label="Ударить рынком"
                tone="red"
                active={highlight === "density"}
                onClick={hitDensity}
              />
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-terminal-muted">
                <input
                  type="checkbox"
                  checked={icebergMode}
                  onChange={(e) => setIcebergMode(e.target.checked)}
                  className="rounded border-terminal-border"
                />
                <span data-highlight="iceberg">Режим «айсберг»</span>
              </label>
            </div>
            <p className="mt-2 text-[10px] text-terminal-muted">
              Крупный bid на 312.40 — учебная плотность. С айсбергом видимый объём
              восстанавливается после удара.
            </p>
          </SandboxSection>

          {/* Error cost */}
          <div
            className={cn(
              "grid grid-cols-2 gap-2 rounded-lg border border-terminal-border/50 bg-[#080E18] px-3 py-2 sm:grid-cols-4",
              highlight === "error-cost" && "ring-1 ring-cyan/30",
            )}
            data-highlight="error-cost slippage"
          >
            <MiniStat label="Шаг цены" value={scenario.tickSize.toFixed(2)} />
            <MiniStat label="Цена шага" value={`${tickValue.toFixed(2)} ₽`} />
            <MiniStat label="Лот" value={String(scenario.lotSize)} />
            <MiniStat
              label="Spread"
              value={spread !== null ? `${spread} п.` : "—"}
              tone="amber"
            />
          </div>
        </div>

        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          {/* Glossary */}
          <div className="rounded-lg border border-terminal-border/70 bg-[#05070D] p-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-terminal-muted">
              Словарь на экране
            </h3>
            <div
              className={cn(
                "mt-2 rounded border border-cyan/20 bg-cyan/[0.04] px-2.5 py-2",
                activeGlossary && "ring-1 ring-cyan/25",
              )}
            >
              <p className="text-xs font-semibold text-cyan">
                {activeGlossary?.label}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-terminal-muted">
                {activeGlossary?.description}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {GLOSSARY_TERMS.map((term) => (
                <button
                  key={term.id}
                  type="button"
                  onClick={() => onTermClick(term.id, term.highlight)}
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[9px] transition-colors",
                    activeTerm === term.id
                      ? "border-cyan/40 bg-cyan/10 text-cyan"
                      : "border-terminal-border/50 text-terminal-muted hover:text-terminal-text",
                  )}
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SandboxSection({
  title,
  children,
  highlightId,
}: {
  title: string;
  children: React.ReactNode;
  highlightId?: string;
}) {
  return (
    <section data-highlight={highlightId}>
      <h3 className="mb-2 text-xs font-semibold text-terminal-text">{title}</h3>
      {children}
    </section>
  );
}

function BookRow({
  price,
  qty,
  side,
  isBest,
  isDensity,
  userQty = 0,
  iceberg,
  highlighted,
  onClick,
}: {
  price: number;
  qty: number;
  side: "bid" | "ask";
  isBest: boolean;
  isDensity?: boolean;
  userQty?: number;
  iceberg?: number | false;
  highlighted?: boolean;
  onClick: () => void;
}) {
  const isAsk = side === "ask";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mb-0.5 flex w-full items-center justify-between rounded px-2 py-1 transition-colors",
        isAsk
          ? isBest
            ? "bg-red/15 ring-1 ring-red/30"
            : "bg-red/[0.04] hover:bg-red/[0.08]"
          : isBest
            ? "bg-green/15 ring-1 ring-green/30"
            : "bg-green/[0.04] hover:bg-green/[0.08]",
        isDensity && "ring-1 ring-amber/40 bg-amber/[0.08]",
        highlighted && "ring-1 ring-cyan/30",
        userQty > 0 && "ring-1 ring-cyan/40",
      )}
    >
      <span
        className={cn(
          "font-medium",
          isAsk ? (isBest ? "text-red" : "text-red/80") : isBest ? "text-green" : "text-green/80",
        )}
      >
        {price.toFixed(2)}
      </span>
      <span className="flex items-center gap-1.5 text-terminal-muted">
        {userQty > 0 && (
          <span className="text-[9px] text-cyan">+{userQty} вы</span>
        )}
        {isDensity && (
          <span className="text-[9px] text-amber">плотность</span>
        )}
        {iceberg !== false && iceberg !== undefined && iceberg > 0 && (
          <span className="text-[9px] text-violet">+{iceberg} скрыто</span>
        )}
        <span>{qty.toLocaleString("ru-RU")}</span>
      </span>
    </button>
  );
}

function ActionButton({
  label,
  tone,
  active,
  onClick,
}: {
  label: string;
  tone: "green" | "amber" | "red";
  active?: boolean;
  onClick: () => void;
}) {
  const styles = {
    green: "border-green/30 text-green hover:bg-green/10",
    amber: "border-amber/30 text-amber hover:bg-amber/10",
    red: "border-red/30 text-red hover:bg-red/10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-[11px] font-medium transition-colors",
        styles[tone],
        active && "ring-1 ring-cyan/40 bg-cyan/5",
      )}
    >
      {label}
    </button>
  );
}

function NoteCard({
  children,
  tone,
  highlightId,
  active,
}: {
  children: React.ReactNode;
  tone: "green" | "amber";
  highlightId: string;
  active?: boolean;
}) {
  return (
    <div
      data-highlight={highlightId}
      className={cn(
        "rounded border px-2.5 py-2 text-[10px]",
        tone === "green"
          ? "border-green/20 bg-green/[0.04] text-green/90"
          : "border-amber/20 bg-amber/[0.04] text-amber/90",
        active && "ring-1 ring-cyan/30",
      )}
    >
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber";
}) {
  return (
    <div>
      <p className="text-[8px] text-terminal-muted">{label}</p>
      <p className={cn("text-[10px] font-medium", tone === "amber" ? "text-amber" : "text-terminal-text/90")}>
        {value}
      </p>
    </div>
  );
}
