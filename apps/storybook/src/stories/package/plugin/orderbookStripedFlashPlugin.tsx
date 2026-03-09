/**
 * Orderbook plugin: alternating row colors (striped) + row background flash on data change.
 * Intercepts OrderBook.Desktop.Asks and OrderBook.Desktop.Bids; uses content-based diff
 * by display value (same precision as UI) so only rows whose visible value changed flash.
 */
import React, { useEffect, useMemo, useRef, type ComponentType } from "react";
import { useOrderBookContext } from "@orderly.network/trading";
import "@orderly.network/trading";
import { createInterceptor, parseNumber } from "@orderly.network/ui";
// augment InterceptorTargetPropsMap for OrderBook.Desktop.Asks/Bids
import type { OrderlySDK } from "@orderly.network/ui";
import { getPrecisionByNumber } from "@orderly.network/utils";
import "./orderbookStripedFlash.css";

const FLASH_CLASS = "orderbook-row-flash";
const FLASH_ODD_CLASS = "orderbook-row-flash--odd";
const FLASH_EVEN_CLASS = "orderbook-row-flash--even";

/** Delay per row index (ms) so flash cascades in list order instead of all at once */
const FLASH_DELAY_PER_INDEX_MS = 35;

/**
 * Compare two rows by displayed value (same precision as UI).
 * When priceDp/sizeDp are provided, uses parseNumber so only visible changes trigger flash.
 */
function rowDisplayChanged(
  prev: number[] | undefined,
  curr: number[],
  priceDp: number | undefined,
  sizeDp: number | undefined,
): boolean {
  if (!prev || prev.length < 2 || curr.length < 2) return true;
  if (priceDp == null || sizeDp == null) {
    return prev[0] !== curr[0] || prev[1] !== curr[1];
  }
  const prevPriceStr = parseNumber(prev[0], { dp: priceDp });
  const currPriceStr = parseNumber(curr[0], { dp: priceDp });
  const prevSizeStr = parseNumber(prev[1], { dp: sizeDp });
  const currSizeStr = parseNumber(curr[1], { dp: sizeDp });
  return prevPriceStr !== currPriceStr || prevSizeStr !== currSizeStr;
}

/** Indices where the displayed row value changed (by display precision when context available). */
function getChangedIndices(
  prevData: number[][],
  currData: number[][],
  priceDp: number | undefined,
  sizeDp: number | undefined,
): number[] {
  const indices: number[] = [];
  const maxLen = Math.max(prevData.length, currData.length);
  for (let i = 0; i < maxLen; i++) {
    const prev = prevData[i];
    const curr = currData[i];
    if (rowDisplayChanged(prev, curr, priceDp, sizeDp)) indices.push(i);
  }
  return indices;
}

interface OrderBookListProps {
  data: number[][] | any[];
}

/**
 * Wrapper that adds striped rows (via CSS class on container) and applies
 * flash class to rows whose displayed value changed; removes flash class on animationend (delegated).
 * Uses useOrderBookContext for depth/symbolInfo so comparison matches UI precision.
 */
function OrderBookListWrapper<P extends OrderBookListProps>({
  Original,
  props,
}: {
  Original: ComponentType<P>;
  props: P;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevDataRef = useRef<number[][]>([]);
  const listenerAttachedRef = useRef(false);
  const { depth, symbolInfo } = useOrderBookContext();

  /** Same precision as desktop cell: price from depth/quote_dp, size from base_dp */
  const { priceDp, sizeDp } = useMemo(() => {
    if (!symbolInfo) return { priceDp: undefined, sizeDp: undefined };
    const priceDpVal = getPrecisionByNumber(
      depth ?? `${symbolInfo.quote_dp ?? 2}`,
    );
    const sizeDpVal = symbolInfo.base_dp ?? 2;
    return { priceDp: priceDpVal, sizeDp: sizeDpVal };
  }, [depth, symbolInfo]);

  // Single delegated animationend listener on the list container (attach once when list exists)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || listenerAttachedRef.current) return;

    const list = wrapper.querySelector(
      ".oui-order-book-list",
    ) as HTMLElement | null;
    if (!list) return;

    const handler = (e: AnimationEvent) => {
      const el = e.target as HTMLElement;
      if (el !== list && el.classList?.contains(FLASH_CLASS)) {
        el.classList.remove(FLASH_CLASS, FLASH_ODD_CLASS, FLASH_EVEN_CLASS);
        el.style.animationDelay = "";
      }
    };
    list.addEventListener("animationend", handler);
    listenerAttachedRef.current = true;
    return () => {
      list.removeEventListener("animationend", handler);
      listenerAttachedRef.current = false;
    };
  }, [props.data]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const currData = Array.isArray(props.data)
      ? (props.data as number[][])
      : [];
    const prevData = prevDataRef.current;

    const changedIndices = getChangedIndices(
      prevData,
      currData,
      priceDp,
      sizeDp,
    );
    prevDataRef.current = currData.length
      ? currData.map((row) => [...row])
      : [];

    if (changedIndices.length === 0) return;
    if (prevData.length === 0) return; // skip flash on initial mount
    const list = wrapper?.querySelector(".oui-order-book-list");
    if (!list) return;

    for (const i of changedIndices) {
      const row = list.children[i];
      if (row && row instanceof HTMLElement) {
        const delayMs = i * FLASH_DELAY_PER_INDEX_MS;
        row.style.animationDelay = `${delayMs}ms`;
        row.classList.add(FLASH_CLASS);
        row.classList.add(i % 2 === 0 ? FLASH_ODD_CLASS : FLASH_EVEN_CLASS);
      }
    }
  }, [props.data, priceDp, sizeDp]);

  return (
    <div ref={wrapperRef} className="orderbook-plugin-striped oui-size-full">
      <Original {...props} />
    </div>
  );
}

/**
 * Plugin registration: adds striped rows and flash-on-change to desktop orderbook asks/bids.
 */
export function registerOrderbookStripedFlashPlugin() {
  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: "orderly-demo-orderbook-striped-flash",
      name: "Orderbook Striped & Flash",
      version: "1.0.0",
      orderlyVersion: ">=2.9.0",
      interceptors: [
        createInterceptor("OrderBook.Desktop.Asks", (Original, props, _api) => (
          <OrderBookListWrapper Original={Original} props={props} />
        )),
        createInterceptor("OrderBook.Desktop.Bids", (Original, props, _api) => (
          <OrderBookListWrapper Original={Original} props={props} />
        )),
      ],
    });
  };
}
