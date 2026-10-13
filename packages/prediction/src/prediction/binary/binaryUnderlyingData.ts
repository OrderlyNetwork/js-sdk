import type { PredictionChartPoint } from "../prediction.types";
import type { PredictionCandle } from "../predictionChart.script";

type IndexPriceMessage = {
  ts?: number;
  data?: { symbol?: string; price?: number };
};

type IndexPriceStream = {
  subscribe: (
    topic: string,
    handlers: {
      formatter: (message: IndexPriceMessage) => IndexPriceMessage;
      onMessage: (message: IndexPriceMessage) => void;
    },
  ) => (() => void) | undefined;
};

/** Observe every index message, including unchanged prices, at its source time. */
export const subscribeBinaryIndexPrices = (
  stream: IndexPriceStream,
  indexSymbol: string,
  onPoint: (point: PredictionChartPoint) => void,
) => {
  const symbol = indexSymbol.replace("PERP", "SPOT");
  let stopped = false;
  const unsubscribe = stream.subscribe(`${symbol}@indexprice`, {
    // The default WS formatter strips the envelope containing the timestamp.
    formatter: (message) => message,
    onMessage: ({ data, ts }) => {
      if (
        stopped ||
        data?.symbol !== symbol ||
        typeof data.price !== "number" ||
        !Number.isFinite(data.price) ||
        typeof ts !== "number" ||
        !Number.isFinite(ts)
      )
        return;
      onPoint({ price: data.price, timestamp: ts });
    },
  });
  return () => {
    stopped = true;
    unsubscribe?.();
  };
};

/** Aggregate actual index observations into minute candles. */
export const aggregateMinuteCandles = (
  points: PredictionChartPoint[],
  intervalMs = 60_000,
): PredictionCandle[] => {
  const candles: PredictionCandle[] = [];
  let bucketStart: number | undefined;
  let open = 0;
  let high = 0;
  let low = 0;
  let close = 0;

  const flush = () => {
    if (bucketStart != null) {
      candles.push({ timestamp: bucketStart, open, high, low, close });
    }
  };

  points.forEach((point) => {
    const bucket = Math.floor(point.timestamp / intervalMs) * intervalMs;
    if (bucket !== bucketStart) {
      flush();
      bucketStart = bucket;
      open = point.price;
      high = point.price;
      low = point.price;
    } else {
      high = Math.max(high, point.price);
      low = Math.min(low, point.price);
    }
    close = point.price;
  });
  flush();

  return candles;
};

export type BinaryHistoryStatus = "idle" | "loading" | "ready" | "error";

type HistoryClock = {
  now: () => number;
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (timer: number) => void;
};

const CONTEXT_WINDOW_MS = 75 * 60_000;
const INDEX_PRICE_MAX_AGE_MS = 24 * 60 * 60_000;
const HISTORY_RETRY_DELAY_MS = 5_000;

/**
 * Load each observation phase once successfully. Failed loads leave the previous
 * history intact and retry after five seconds, including after T1. Requests are
 * serialized, and stopping the observer cancels timers and ignores late results.
 */
export const startBinaryHistoryLoader = (
  {
    roundStartMs,
    expireAtMs,
    load,
    onLoad,
    onStatus,
  }: {
    roundStartMs: number;
    expireAtMs: number | undefined;
    load: (startT: number, endT: number) => Promise<PredictionChartPoint[]>;
    onLoad: (points: PredictionChartPoint[]) => void;
    onStatus?: (status: BinaryHistoryStatus) => void;
  },
  clock: HistoryClock,
) => {
  let stopped = false;
  let timer: number | undefined;
  let loadedPhase: string | undefined;
  let failedPhase: string | undefined;
  let retryAfter = 0;

  const tick = async () => {
    if (stopped) return;
    timer = undefined;
    const now = clock.now();
    const phase =
      now < roundStartMs
        ? "upcoming"
        : expireAtMs != null && now >= expireAtMs
          ? "ended"
          : "live";
    if (loadedPhase !== phase && (failedPhase !== phase || now >= retryAfter)) {
      const startT = Math.max(
        Math.min(roundStartMs, now) - CONTEXT_WINDOW_MS,
        now - INDEX_PRICE_MAX_AGE_MS + 1_000,
        0,
      );
      const endT = Math.min(expireAtMs ?? now, now);
      onStatus?.("loading");
      try {
        const points = await load(startT, endT);
        if (stopped) return;
        onLoad(points);
        onStatus?.("ready");
        loadedPhase = phase;
        failedPhase = undefined;
      } catch {
        if (stopped) return;
        onStatus?.("error");
        failedPhase = phase;
        retryAfter = clock.now() + HISTORY_RETRY_DELAY_MS;
      }
    }
    if (!stopped && loadedPhase !== "ended") {
      timer = clock.setTimeout(() => void tick(), 1_000);
    }
  };

  void tick();
  return () => {
    stopped = true;
    if (timer != null) clock.clearTimeout(timer);
  };
};
