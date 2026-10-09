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

export const EMPTY_BOOK: BinaryOrderBook = {
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

type Transport = ReturnType<typeof import("@orderly.network/hooks").useWS>;
type WS = Pick<
  ReturnType<typeof import("@orderly.network/hooks").useWS>,
  "subscribe" | "onceSubscribe"
> &
  Partial<Pick<Transport, "on" | "off">>;
const bboFor = (book: BinaryOrderBook) => {
  const bestAsk = book.asks[0]?.[0],
    bestBid = book.bids[0]?.[0];
  return {
    bestAsk,
    bestBid,
    mid:
      bestAsk != null && bestBid != null && bestAsk > 0 && bestBid > 0
        ? new Decimal(bestAsk).add(bestBid).div(2).toNumber()
        : undefined,
  };
};
export const EMPTY_BOOK_SNAPSHOT = {
  book: EMPTY_BOOK,
  bbo: bboFor(EMPTY_BOOK),
  isLoading: false,
};
let nextSnapshotRequest = 0;
export function createOrderbookResource(ws: WS, symbol: string) {
  let snapshot = EMPTY_BOOK_SNAPSHOT;
  const listeners = new Set<() => void>();
  let release: (() => void) | undefined;
  const publish = (book: BinaryOrderBook, isLoading: boolean) => {
    snapshot = { book, bbo: bboFor(book), isLoading };
    listeners.forEach((listener) => listener());
  };
  const start = () => {
    let book = EMPTY_BOOK;
    let appliedTs: number | null = null;
    let awaitingSnapshot = true;
    let requestRevision = 0;
    publish(EMPTY_BOOK, true);
    let disposed = false;
    let snapshotSub: (() => void) | undefined;

    const fail = () => {
      if (disposed) return;
      snapshotSub?.();
      snapshotSub = undefined;
      appliedTs = null;
      awaitingSnapshot = true;
      requestRevision++;
      book = EMPTY_BOOK;
      publish(EMPTY_BOOK, true);
    };
    const requestSnapshot = () => {
      snapshotSub?.();
      const revision = ++requestRevision;
      // IDs identify requests on the shared SDK transport, across SWR caches
      // and resource lifetimes as well as retries within this subscription.
      snapshotSub = ws.onceSubscribe(
        {
          event: "request",
          id: `${symbol}@prediction-orderbook:${++nextSnapshotRequest}`,
          params: {
            type: "orderbook",
            symbol,
          },
        },
        {
          formatter: (message: unknown) => message,
          onError: () => {
            if (revision === requestRevision) fail();
          },
          onMessage: (message: { data?: RawBookPayload; ts?: number }) => {
            if (disposed || revision !== requestRevision) return;
            applyPayload(message.data, message.ts, "snapshot");
            if (!awaitingSnapshot) {
              snapshotSub?.();
              snapshotSub = undefined;
            }
          },
        },
      );
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
        if (snapshotTs != null && appliedTs != null && snapshotTs < appliedTs) {
          return;
        }
        appliedTs = snapshotTs ?? null;
        awaitingSnapshot = false;
        book = {
          asks: mergeSide([], asks, true),
          bids: mergeSide([], bids, false),
          downAsks: mergeSide([], downAsks, true),
          downBids: mergeSide([], downBids, false),
        };

        publish(book, false);
        return;
      }

      // Delta chain: prevTs must chain onto the applied ts. Deltas arriving
      // before the first snapshot are dropped — merging them into an empty
      // book would build a partial book whose ts then makes the (older) full
      // snapshot look stale, leaving the book permanently incomplete. The
      // first post-snapshot delta either chains or trips the gap path below,
      // which re-requests a snapshot, so this converges.
      if (awaitingSnapshot || appliedTs == null) return;
      const prevTs = payload.prevTs;
      if (prevTs != null) {
        if (prevTs < appliedTs) return;
        if (prevTs > appliedTs) {
          awaitingSnapshot = true;
          book = EMPTY_BOOK;
          publish(EMPTY_BOOK, true);
          requestSnapshot();
          return;
        }
      }
      appliedTs = envelopeTs ?? appliedTs;

      book = {
        asks: mergeSide(book.asks, asks, true),
        bids: mergeSide(book.bids, bids, false),
        downAsks: mergeSide(book.downAsks, downAsks, true),
        downBids: mergeSide(book.downBids, downBids, false),
      };

      publish(book, false);
    };

    const updateSub = ws.subscribe(
      {
        event: "subscribe",
        topic: `${symbol}@orderbookupdate`,
      },
      {
        formatter: (message: unknown) => message,
        onError: fail,
        onMessage: (message: { data?: RawBookPayload; ts?: number }) => {
          if (disposed) return;
          applyPayload(message.data, message.ts, "update");
        },
      },
    );

    const onStatus = (status: { isPrivate?: boolean; type?: string }) => {
      if (disposed || status.isPrivate) return;
      if (status.type === "open") {
        fail();
        requestSnapshot();
      } else if (["close", "error", "reconnecting"].includes(status.type ?? ""))
        fail();
    };
    ws.on?.("status:change", onStatus);
    requestSnapshot();

    return () => {
      disposed = true;
      ws.off?.("status:change", onStatus);
      updateSub?.();
      snapshotSub?.();
    };
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      const token = () => listener();
      listeners.add(token);
      if (listeners.size === 1) release = start();
      return () => {
        listeners.delete(token);
        if (!listeners.size) {
          release?.();
          release = undefined;
          snapshot = EMPTY_BOOK_SNAPSHOT;
        }
      };
    },
    reset: () => {
      release?.();
      release = listeners.size ? start() : undefined;
    },
  };
}
const registries = new WeakMap<
  object,
  WeakMap<object, Map<string, ReturnType<typeof createOrderbookResource>>>
>();
export function getOrderbookResource(cache: object, ws: WS, symbol: string) {
  let sockets = registries.get(cache);
  if (!sockets) registries.set(cache, (sockets = new WeakMap()));
  let symbols = sockets.get(ws);
  if (!symbols) sockets.set(ws, (symbols = new Map()));
  let resource = symbols.get(symbol);
  if (!resource)
    symbols.set(symbol, (resource = createOrderbookResource(ws, symbol)));
  return resource;
}
