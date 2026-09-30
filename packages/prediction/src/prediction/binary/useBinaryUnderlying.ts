import { useEffect, useMemo, useRef, useState } from "react";
import { fetcher, useConfig, useIndexPrice } from "@orderly.network/hooks";
import { getTimestamp } from "@orderly.network/utils";
import type { PredictionChartPoint } from "../prediction.types";
import type { PredictionCandle } from "../predictionChart.script";

/** Public index-price query limits (api-spec §3.5): 1s rows, ≤10min a window. */
const INDEX_PRICE_MAX_WINDOW_MS = 10 * 60_000;
const INDEX_PRICE_MAX_AGE_MS = 24 * 60 * 60_000;
/** Context fetched before T0 so candle mode keeps its 80-minute lookback. */
const CONTEXT_WINDOW_MS = 75 * 60_000;
/** Safety cap for the in-memory WS tick buffer (~2h at 1/s). */
const MAX_TRAILING_POINTS = 7_200;
const EMPTY_POINTS: PredictionChartPoint[] = [];

type IndexPriceRow = { timestamp: number; index_price: number };

/**
 * Chunk [startT, endT] into ≤10min public index-price requests (sequential,
 * bounded burst) and return the merged rows. The endpoint is anonymous with
 * no pagination; older-than-24h or future windows return whatever exists.
 */
export const fetchIndexPriceRange = async (
  apiBaseUrl: string,
  symbol: string,
  startT: number,
  endT: number,
): Promise<PredictionChartPoint[]> => {
  if (endT <= startT) return [];
  const points: PredictionChartPoint[] = [];

  for (
    let windowStart = startT;
    windowStart < endT;
    windowStart += INDEX_PRICE_MAX_WINDOW_MS
  ) {
    const windowEnd = Math.min(windowStart + INDEX_PRICE_MAX_WINDOW_MS, endT);
    const query = `/v1/public/index_price?symbol=${symbol}&start_t=${Math.floor(
      windowStart,
    )}&end_t=${Math.floor(windowEnd)}&limit=1000`;

    const rows = (await fetcher(`${apiBaseUrl}${query}`, {}, {})) as
      | IndexPriceRow[]
      | undefined;
    (rows ?? []).forEach((row) => {
      if (
        typeof row?.timestamp === "number" &&
        Number.isFinite(row?.index_price)
      ) {
        points.push({ timestamp: row.timestamp, price: row.index_price });
      }
    });
  }

  points.sort((a, b) => a.timestamp - b.timestamp);
  return points;
};

/** Aggregate 1s index points into whole-minute candles. */
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

export type UseBinaryUnderlyingArgs = {
  /** e.g. `PERP_BTC_USDC`; the WS layer maps it to the SPOT index topic. */
  indexSymbol: string;
  /** Round start (T0) in epoch seconds; the per-round line window anchor. */
  roundStartSec: number | undefined;
  /** Round end (T1) in epoch ms. */
  expireAtMs: number | undefined;
  active: boolean;
};

/**
 * Underlying market data for the round chart: live index price via the public
 * WS topic plus per-round REST history (public index_price, 1s granularity)
 * merged with the live ticks. Candle context reaches ~75 minutes before T0 so
 * candle mode keeps its lookback without a binary-specific kline endpoint.
 */
export const useBinaryUnderlying = ({
  indexSymbol,
  roundStartSec,
  expireAtMs,
  active,
}: UseBinaryUnderlyingArgs) => {
  const apiBaseUrl = useConfig("apiBaseUrl");
  // `active` is the live gate (prediction page mounted): the index stream
  // suspends on other routes instead of feeding WS ticks into the shared
  // state. An unknown symbol (the rounds hook's "" fallback) also suspends
  // rather than subscribing to a bogus topic. Rounds rotate on the same index
  // so there is nothing further to gate per round.
  const { data: livePrice } = useIndexPrice(
    active && indexSymbol ? indexSymbol : null,
  );
  const [historyState, setHistoryState] = useState<{
    key: string;
    points: PredictionChartPoint[];
  } | null>(null);
  const [trailingState, setTrailingState] = useState<{
    symbol: string;
    points: PredictionChartPoint[];
  } | null>(null);
  const lastFetchedRoundRef = useRef<string | null>(null);
  const roundKey = `${indexSymbol}:${roundStartSec ?? ""}`;
  const history =
    historyState?.key === roundKey ? historyState.points : EMPTY_POINTS;
  const trailing =
    trailingState?.symbol === indexSymbol ? trailingState.points : EMPTY_POINTS;

  useEffect(() => {
    if (!active || roundStartSec == null) {
      lastFetchedRoundRef.current = null;
      setHistoryState(null);
      return;
    }

    const roundStartMs = roundStartSec * 1_000;
    let timer: number | undefined;
    const stopTicking = () => {
      if (timer != null) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const load = () => {
      const now = getTimestamp();
      if (now < roundStartMs) return;
      if (lastFetchedRoundRef.current === roundKey) return;
      lastFetchedRoundRef.current = roundKey;
      // The fetch attempt is one-shot per round; after it settles the WS
      // ticks carry the tail, so the 1s probe has nothing left to wait for.
      stopTicking();

      if (now - roundStartMs > INDEX_PRICE_MAX_AGE_MS) {
        setHistoryState({ key: roundKey, points: [] });
        return;
      }

      // The endpoint validates now-24h <= start_t (api-spec §3.5); clamp so a
      // 23h-old round's context window cannot 400 the whole chunk chain.
      const startT = Math.max(
        roundStartMs - CONTEXT_WINDOW_MS,
        now - INDEX_PRICE_MAX_AGE_MS + 1_000,
        0,
      );
      const endT = Math.min(expireAtMs ?? now, now);
      if (endT <= startT) {
        setHistoryState({ key: roundKey, points: [] });
        return;
      }
      fetchIndexPriceRange(apiBaseUrl, indexSymbol, startT, endT)
        .then((points) => {
          // A round switch may have raced the fetch; only the newest round lands.
          if (lastFetchedRoundRef.current !== roundKey) return;
          setHistoryState({ key: roundKey, points });
        })
        .catch(() => {
          if (lastFetchedRoundRef.current === roundKey)
            setHistoryState({ key: roundKey, points: [] });
        });
    };

    load();
    // Only a future round keeps probing until its window opens; a round
    // whose fetch already ran above has nothing left to wait for.
    if (lastFetchedRoundRef.current !== roundKey) {
      timer = window.setInterval(load, 1_000);
    }
    return stopTicking;
  }, [active, apiBaseUrl, indexSymbol, roundKey, roundStartSec, expireAtMs]);

  useEffect(() => {
    if (livePrice == null || !Number.isFinite(livePrice)) return;
    const timestamp = getTimestamp();
    setTrailingState((state) => {
      const previous = state?.symbol === indexSymbol ? state.points : [];
      const last = previous.at(-1);
      if (last?.timestamp === timestamp) {
        return last.price === livePrice
          ? state
          : {
              symbol: indexSymbol,
              points: [
                ...previous.slice(0, -1),
                { price: livePrice, timestamp },
              ],
            };
      }
      return {
        symbol: indexSymbol,
        points: [...previous, { price: livePrice, timestamp }].slice(
          -MAX_TRAILING_POINTS,
        ),
      };
    });
  }, [indexSymbol, livePrice]);

  const priceHistory = useMemo(() => {
    if (roundStartSec == null) return [];
    const roundStartMs = roundStartSec * 1_000;
    const seen = new Set<number>();
    return [...history, ...trailing]
      .filter((point) => {
        if (point.timestamp < roundStartMs) return false;
        if (seen.has(point.timestamp)) return false;
        seen.add(point.timestamp);
        return true;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [history, trailing, roundStartSec]);

  // Seed only from the fetched history: the identity must stay stable across
  // WS ticks or the chart's candle state would reset every second.
  const candles = useMemo(() => aggregateMinuteCandles(history), [history]);

  const currentPrice =
    livePrice ?? trailing.at(-1)?.price ?? history.at(-1)?.price ?? 0;

  return {
    currentPrice,
    priceHistory,
    /** Minute candles including the pre-T0 context; the chart rolls them on. */
    candles,
  };
};

export type BinaryUnderlyingState = ReturnType<typeof useBinaryUnderlying>;
