import { useEffect, useState } from "react";
import { useWS } from "@orderly.network/hooks";

/** Best UP-coordinate bid/ask of one binary round. */
export type BinaryBbo = {
  bestBid?: number;
  bestAsk?: number;
};

type RawBboPayload = {
  symbol?: string;
  /** Leveled shape shared with the orderbook topics (best level first). */
  bids?: [number, number][];
  asks?: [number, number][];
  /** Scalar shape; binary rows additionally carry down_bid/down_ask. */
  bid?: number;
  ask?: number;
  down_bid?: number;
  down_ask?: number;
};

const firstPrice = (levels?: [number, number][]) => {
  const price = levels?.[0]?.[0];
  return typeof price === "number" && Number.isFinite(price) && price > 0
    ? price
    : undefined;
};

const scalar = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;

/**
 * Parse a `${symbol}@bbo` payload (api-spec §8) into the UP-coordinate best
 * bid/ask. Both payload shapes are accepted; the mirrored `down_*` scalars
 * only fill a missing side (down_ask = 1 - bestBid and vice versa).
 */
export const toBinaryBbo = (payload: RawBboPayload): BinaryBbo => {
  const bestBid =
    firstPrice(payload.bids) ??
    scalar(payload.bid) ??
    (scalar(payload.down_ask) != null
      ? 1 - (payload.down_ask as number)
      : undefined);
  const bestAsk =
    firstPrice(payload.asks) ??
    scalar(payload.ask) ??
    (scalar(payload.down_bid) != null
      ? 1 - (payload.down_bid as number)
      : undefined);
  return { bestBid, bestAsk };
};

/**
 * BBO subscriptions for a set of binary symbols via the light public
 * `${symbol}@bbo` topic — one topic per market instead of the full
 * orderbook snapshot + delta stream. The WS client aggregates multiple
 * subscribers per topic, so overlapping mounts (dropdown tab + favorites
 * section) share one socket subscription.
 */
export const useBinaryBboMap = (symbols: string[], active = true) => {
  const ws = useWS();
  const [bbos, setBbos] = useState<Record<string, BinaryBbo>>({});
  // Join for the effect key; split back inside so the hook body stays stable.
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    if (!active || symbolsKey === "") {
      setBbos((previous) => (Object.keys(previous).length > 0 ? {} : previous));
      return;
    }
    const symbolList = symbolsKey.split(",");
    setBbos({});

    const unsubscribers = symbolList.map((symbol) =>
      ws.subscribe(
        { event: "subscribe", topic: `${symbol}@bbo` },
        {
          formatter: (message) => message,
          onMessage: (message: { data?: RawBboPayload }) => {
            const payload = message.data;
            if (!payload) return;
            if (payload.symbol != null && payload.symbol !== symbol) return;
            const bbo = toBinaryBbo(payload);
            if (bbo.bestBid == null && bbo.bestAsk == null) return;
            setBbos((previous) => ({ ...previous, [symbol]: bbo }));
          },
        },
      ),
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
  }, [active, symbolsKey, ws]);

  return bbos;
};
