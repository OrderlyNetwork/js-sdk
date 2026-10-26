import { useEffect, useState } from "react";
import { useWS } from "@orderly.network/hooks";

type RawTicker = {
  symbol?: string;
  amount?: number;
};

const toTickerAmount = (ticker: RawTicker): number | undefined => {
  const amount = ticker.amount;
  return typeof amount === "number" && Number.isFinite(amount) && amount >= 0
    ? amount
    : undefined;
};

/**
 * 24h quote amounts (USDC notional) for a set of binary round symbols from
 * the global `tickers` broadcast. Round symbols are short-lived and start
 * from zero, so the 24h window on a fresh symbol is effectively that
 * round's cumulative volume.
 *
 * The WS client ref-counts topics, so this shares one socket subscription
 * with `useMarketsStream`'s own `tickers` subscriber. The broadcast carries
 * every symbol, so inbound rows are filtered to the requested set and
 * pushes without a relevant change are dropped before setState.
 */
export const useBinaryTickerAmounts = (symbols: string[], active = true) => {
  const ws = useWS();
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  // Join for the effect key; split back inside so the hook body stays stable.
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    if (!active || symbolsKey === "") {
      setAmounts((previous) =>
        Object.keys(previous).length > 0 ? {} : previous,
      );
      return;
    }
    const wanted = new Set(symbolsKey.split(","));
    // Retain the last-known amount of symbols that stay subscribed: a round
    // rollover on one market must not blank every other row before the next
    // broadcast refreshes it.
    setAmounts((previous) => {
      if (Object.keys(previous).length === 0) return previous;
      const retained: Record<string, number> = {};
      for (const symbol of wanted) {
        if (previous[symbol] != null) retained[symbol] = previous[symbol];
      }
      return retained;
    });

    const unsubscribe = ws.subscribe("tickers", {
      // No custom formatter: the default already unwraps `message.data`,
      // which for this topic is the full ticker array.
      onMessage: (tickers: RawTicker[] | undefined) => {
        if (!Array.isArray(tickers)) return;
        setAmounts((previous) => {
          let changed = false;
          const next = { ...previous };
          for (const ticker of tickers) {
            if (ticker?.symbol == null || !wanted.has(ticker.symbol)) continue;
            const amount = toTickerAmount(ticker);
            if (amount == null) continue;
            if (next[ticker.symbol] !== amount) {
              next[ticker.symbol] = amount;
              changed = true;
            }
          }
          return changed ? next : previous;
        });
      },
    });

    return () => unsubscribe?.();
  }, [active, symbolsKey, ws]);

  return amounts;
};
