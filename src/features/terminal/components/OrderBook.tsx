"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { BEST_ASK, BEST_BID, fmtPrice, fmtQty } from "../data/mockMarket";
import { useDebugQuery } from "../hooks/useDebugQuery";
import { useTerminalStore } from "../state/terminalStore";

function useTourZoneBounds(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  match: (row: HTMLElement) => boolean,
  deps: unknown[],
) {
  const anchorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const anchor = anchorRef.current;
    if (!scroll || !anchor) return;

    const rows = [...scroll.querySelectorAll<HTMLElement>(".cscalp-book__row")].filter(
      (row) => match(row),
    );
    if (rows.length === 0) {
      anchor.style.display = "none";
      return;
    }

    const first = rows[0]!;
    const last = rows[rows.length - 1]!;
    anchor.style.display = "block";
    anchor.style.top = `${first.offsetTop}px`;
    anchor.style.height = `${last.offsetTop + last.offsetHeight - first.offsetTop}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return anchorRef;
}

function heatBarClass(isAsk: boolean, heat: number, size: number): string {
  const large = heat >= 42 || size >= 1000;
  if (isAsk) {
    return large ? "cscalp-book__bar--ask-large" : "cscalp-book__bar--ask";
  }
  return large ? "cscalp-book__bar--bid-large" : "cscalp-book__bar--bid";
}

export function OrderBook() {
  const { bookDebug } = useDebugQuery();
  const {
    priceLevels,
    state,
    handleRowPointer,
    cancelOrder,
    zoneClass,
    dispatch,
    practiceHintPrice,
  } = useTerminalStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { selectedPrice, bookCenterTick, currentPrice, hoveredLadderPrice } = state;

  const bestAsk = useMemo(
    () => priceLevels.find((l) => l.isBestAsk)?.price ?? BEST_ASK,
    [priceLevels],
  );
  const bestBid = useMemo(
    () => priceLevels.find((l) => l.isBestBid)?.price ?? BEST_BID,
    [priceLevels],
  );

  const askAnchorRef = useTourZoneBounds(
    scrollRef,
    (row) => row.classList.contains("cscalp-book__row--ask"),
    [priceLevels, bookCenterTick],
  );
  const bidAnchorRef = useTourZoneBounds(
    scrollRef,
    (row) => row.classList.contains("cscalp-book__row--bid"),
    [priceLevels, bookCenterTick],
  );
  const spreadAnchorRef = useTourZoneBounds(
    scrollRef,
    (row) =>
      row.classList.contains("cscalp-book__row--ask-active") ||
      row.classList.contains("cscalp-book__row--bid-active") ||
      row.classList.contains("cscalp-book__row--spread-gap"),
    [priceLevels, bookCenterTick],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const row = el.querySelector<HTMLElement>(`[data-price="${currentPrice}"]`);
    if (!row) return;
    const target = row.offsetTop - el.clientHeight / 2 + row.offsetHeight / 2;
    el.scrollTop = Math.max(0, target);
    dispatch({ type: "SET_LADDER_SCROLL", scrollTop: el.scrollTop });
  }, [bookCenterTick, currentPrice, dispatch]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    dispatch({ type: "SET_LADDER_SCROLL", scrollTop: el.scrollTop });
  };

  const panelClass = [
    "cscalp-book",
    "cscalp-zone",
    "cscalp-panel-border-l",
    zoneClass("stakan"),
    bookDebug ? "cscalp-book--debug" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={panelClass}
      aria-label="Стакан"
      data-tour-id="orderbook"
      onContextMenu={(e) => e.preventDefault()}
    >
      {bookDebug && (
        <div className="cscalp-book__debug-badge" aria-hidden>
          row {`var(--cscalp-row-h)`} · vol {`var(--cscalp-col-book-vol)`} · price{" "}
          {`var(--cscalp-col-book-price)`}
          <br />
          ask {fmtPrice(bestAsk)} · bid {fmtPrice(bestBid)} · last {fmtPrice(currentPrice)}
        </div>
      )}

      <div ref={scrollRef} className="cscalp-book__scroll" onScroll={onScroll}>
        <div
          ref={askAnchorRef}
          className="cscalp-tour-anchor"
          data-tour-id="ask-zone"
          aria-hidden
        />
        <div
          ref={bidAnchorRef}
          className="cscalp-tour-anchor"
          data-tour-id="bid-zone"
          aria-hidden
        />
        <div
          ref={spreadAnchorRef}
          className="cscalp-tour-anchor"
          data-tour-id="spread"
          aria-hidden
        />

        {priceLevels.map((lv) => {
          const isAsk = lv.askSize > 0;
          const isBid = lv.bidSize > 0;
          const isSpreadGap = !isAsk && !isBid && lv.isCurrentPrice;
          const size = isAsk ? lv.askSize : lv.bidSize;
          const heat = isAsk ? lv.askHeat : lv.bidHeat;
          const isSelected = selectedPrice === lv.price;
          const isClusterHover = hoveredLadderPrice === lv.price;
          const isLargeVol = size >= 1000;

          let tourId: string | undefined;
          if (lv.isBestAsk) tourId = "market-buy";
          else if (lv.isBestBid) tourId = "market-sell";
          else if (isBid && lv.price < BEST_ASK) tourId = "limit-buy";
          else if (isAsk && lv.price > BEST_BID) tourId = "limit-sell";

          const isPracticeHint =
            practiceHintPrice != null && lv.price === practiceHintPrice;

          const rowClass = [
            "cscalp-book__row",
            isAsk ? "cscalp-book__row--ask" : "",
            isBid ? "cscalp-book__row--bid" : "",
            isSpreadGap ? "cscalp-book__row--spread-gap" : "",
            lv.isBestAsk ? "cscalp-book__row--ask-active" : "",
            lv.isBestBid ? "cscalp-book__row--bid-active" : "",
            lv.isBestAsk ? "cscalp-book__row--spread-line" : "",
            isSelected ? "cscalp-book__row--selected" : "",
            isClusterHover ? "cscalp-book__row--cluster-hover" : "",
            isPracticeHint ? "cscalp-book__row--practice-hint" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const showHeat = (heat > 0 || size > 0) && !isSpreadGap;
          const barWidth = Math.min(Math.max(heat, size > 0 ? 8 : 0), 86);

          return (
            <div
              key={lv.price}
              role="row"
              data-price={lv.price}
              data-tour-id={tourId}
              className={rowClass}
              onMouseDown={(e) => handleRowPointer(e, lv)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleRowPointer(e, lv);
              }}
            >
              <div className="cscalp-book__vol-col">
                {showHeat && (
                  <span
                    className={`cscalp-book__bar ${heatBarClass(isAsk, heat, size)}`}
                    style={{ width: `${barWidth}%` }}
                    aria-hidden
                  />
                )}
                {size > 0 && (
                  <span
                    className={[
                      "cscalp-book__size",
                      isLargeVol && isAsk ? "cscalp-book__size--warn" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {fmtQty(size)}
                  </span>
                )}
                {lv.userOrder && (
                  <span
                    className="cscalp-book__order-tag"
                    title="Снять заявку (F — все лимиты)"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      cancelOrder(lv.userOrder!.id);
                    }}
                  >
                    {lv.userOrder.side === "buy" ? "B" : "S"}
                    {lv.userOrder.qty}
                  </span>
                )}
              </div>
              <span
                className={[
                  "cscalp-book__price",
                  lv.isBestAsk || lv.isBestBid ? "cscalp-book__price--best" : "",
                  isSpreadGap ? "cscalp-book__price--spread" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {fmtPrice(lv.price)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
