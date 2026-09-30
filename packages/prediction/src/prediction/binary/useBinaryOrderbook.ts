import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWS } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

/** [price, quantity] level of the 0–1 USDC probability book. */
export type BinaryBookLevel = [number, number];

export type BinaryOrderBook = {
  /** UP book, price ascending (best ask first). */
  asks: BinaryBookLevel[];
  /** UP book, price descending (best bid first). */
  bids: BinaryBookLevel[];
  /** Derived DOWN asks (1 - UP bids), price ascending (best first). */
  downAsks: BinaryBookLevel[];
  /** Derived DOWN bids (1 - UP asks), price descending (best first). */
  downBids: BinaryBookLevel[];
};

const EMPTY_BOOK: BinaryOrderBook = {
  asks: [],
  bids: [],
  downAsks: [],
  downBids: [],
};

const deriveDown = (levels: BinaryBookLevel[]): BinaryBookLevel[] =>
  levels.map(([price, quantity]) => [
    new Decimal(1).sub(price).toNumber(),
    quantity,
  ]);

/**
 * Merge an incremental update into one side of the book: price-keyed replace,
 * quantity 0 removes the level. Sort direction is stable per side (asks asc,
 * bids desc) and mirrors the shared orderbook.service merge semantics, but
 * keeps the DOWN sides that the shared service drops.
 */
const mergeSide = (
  data: BinaryBookLevel[],
  update: BinaryBookLevel[],
  ascending: boolean,
): BinaryBookLevel[] => {
  if (update.length === 0) return data;

  const map = new Map<number, number>();
  data.forEach(([price, quantity]) => map.set(price, quantity));
  update.forEach(([price, quantity]) => {
    if (quantity === 0) {
      map.delete(price);
    } else {
      map.set(price, quantity);
    }
  });

  const levels = Array.from(map.entries()).filter(
    ([, quantity]) => quantity > 0,
  );
  levels.sort(([a], [b]) => (ascending ? a - b : b - a));
  return levels;
};

type RawBookPayload = {
  symbol?: string;
  ts?: number;
  prevTs?: number;
  asks?: BinaryBookLevel[];
  bids?: BinaryBookLevel[];
  down_asks?: BinaryBookLevel[];
  down_bids?: BinaryBookLevel[];
};

const toLevels = (value: unknown): BinaryBookLevel[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is BinaryBookLevel =>
          Array.isArray(item) &&
          typeof item[0] === "number" &&
          typeof item[1] === "number",
      )
    : [];

/**
 * Live UP/DOWN orderbook for a round-specific binary symbol via the public
 * WS (`${symbol}@orderbook` request snapshot + `@orderbookupdate` deltas,
 * api-spec §3.2/§8). The DOWN sides come straight from the payload when the
 * gateway provides them and are derived per-level from the UP deltas
 * otherwise (the 1-p mapping is bijective, so delta derivation stays exact).
 *
 * Sequencing mirrors orderbook.service: a snapshot only lands when it is not
 * older than the already-applied deltas, an update whose prevTs chains onto
 * the applied ts is merged, a stale one (prevTs < applied ts) is dropped and
 * a gap (prevTs > applied ts) triggers a fresh snapshot request.
 */
export const useBinaryOrderbook = (
  symbol: string | undefined,
  active: boolean,
) => {
  const ws = useWS();
  const [book, setBook] = useState<BinaryOrderBook>(EMPTY_BOOK);
  const [bookSymbol, setBookSymbol] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const symbolRef = useRef<string | undefined>(symbol);
  symbolRef.current = symbol;
  /** Snapshot/delta ts chain of the currently applied book. */
  const appliedTsRef = useRef<number | null>(null);

  useEffect(() => {
    setBook(EMPTY_BOOK);
    setBookSymbol(undefined);
    appliedTsRef.current = null;
    if (!symbol || !active) return;

    setIsLoading(true);

    let disposed = false;
    let snapshotSub: (() => void) | undefined;

    const requestSnapshot = () => {
      snapshotSub?.();
      // onceSubscribe is typed void on the WS client; it internally
      // unsubscribes after the first snapshot (useOrderbookStream pattern).
      snapshotSub = ws.onceSubscribe(
        {
          event: "request",
          id: `${symbol}@orderbook`,
          params: {
            type: "orderbook",
            symbol,
          },
        },
        {
          formatter: (message) => message,
          onMessage: (message: { data?: RawBookPayload; ts?: number }) => {
            if (disposed) return;
            applyPayload(message.data, message.ts, "snapshot");
          },
        },
      ) as unknown as () => void;
    };

    const applyPayload = (
      payload: RawBookPayload | undefined,
      envelopeTs: number | undefined,
      mode: "snapshot" | "update",
    ) => {
      if (!payload) return;
      if (payload.symbol != null && payload.symbol !== symbol) return;

      const asks = toLevels(payload.asks);
      const bids = toLevels(payload.bids);
      const downAsks =
        payload.down_asks != null
          ? toLevels(payload.down_asks)
          : deriveDown(bids);
      const downBids =
        payload.down_bids != null
          ? toLevels(payload.down_bids)
          : deriveDown(asks);

      if (mode === "snapshot") {
        const snapshotTs = payload.ts ?? envelopeTs;
        // A late snapshot older than the already-merged deltas must not
        // roll the book back.
        if (
          snapshotTs != null &&
          appliedTsRef.current != null &&
          snapshotTs < appliedTsRef.current
        ) {
          return;
        }
        appliedTsRef.current = snapshotTs ?? null;
        setBook({
          asks: mergeSide([], asks, true),
          bids: mergeSide([], bids, false),
          downAsks: mergeSide([], downAsks, true),
          downBids: mergeSide([], downBids, false),
        });
        setBookSymbol(symbol);
        setIsLoading(false);
        return;
      }

      // Delta chain: prevTs must chain onto the applied ts. Deltas arriving
      // before the first snapshot are dropped — merging them into an empty
      // book would build a partial book whose ts then makes the (older) full
      // snapshot look stale, leaving the book permanently incomplete. The
      // first post-snapshot delta either chains or trips the gap path below,
      // which re-requests a snapshot, so this converges.
      if (appliedTsRef.current == null) return;
      const prevTs = payload.prevTs;
      if (prevTs != null) {
        if (prevTs < appliedTsRef.current) return;
        if (prevTs > appliedTsRef.current) {
          requestSnapshot();
          return;
        }
      }
      appliedTsRef.current = envelopeTs ?? appliedTsRef.current;

      setBook((previous) => ({
        asks: mergeSide(previous.asks, asks, true),
        bids: mergeSide(previous.bids, bids, false),
        downAsks: mergeSide(previous.downAsks, downAsks, true),
        downBids: mergeSide(previous.downBids, downBids, false),
      }));
      setBookSymbol(symbol);
      setIsLoading(false);
    };

    const updateSub = ws.subscribe(
      {
        event: "subscribe",
        topic: `${symbol}@orderbookupdate`,
      },
      {
        formatter: (message) => message,
        onMessage: (message: { data?: RawBookPayload; ts?: number }) => {
          if (disposed) return;
          applyPayload(message.data, message.ts, "update");
        },
      },
    );

    requestSnapshot();

    return () => {
      disposed = true;
      updateSub?.();
      snapshotSub?.();
    };
  }, [symbol, active, ws]);

  /** Best ask/bid in UP price; mid is the UP win-probability estimate. */
  const visibleBook = bookSymbol === symbol ? book : EMPTY_BOOK;
  const bbo = useMemo(() => {
    const bestAsk = visibleBook.asks[0]?.[0];
    const bestBid = visibleBook.bids[0]?.[0];
    const hasBoth =
      typeof bestAsk === "number" &&
      typeof bestBid === "number" &&
      bestAsk > 0 &&
      bestBid > 0;
    return {
      bestAsk,
      bestBid,
      mid: hasBoth
        ? new Decimal(bestAsk).add(bestBid).div(2).toNumber()
        : undefined,
    };
  }, [visibleBook.asks, visibleBook.bids]);

  const reset = useCallback(() => setBook(EMPTY_BOOK), []);

  return { book: visibleBook, bbo, isLoading, reset };
};

export type BinaryOrderbookState = ReturnType<typeof useBinaryOrderbook>;
