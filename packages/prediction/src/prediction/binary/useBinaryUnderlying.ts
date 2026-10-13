import { useEffect, useMemo, useState } from "react";
import { fetcher, useConfig, useWS } from "@orderly.network/hooks";
import { getTimestamp } from "@orderly.network/utils";
import type { PredictionChartPoint } from "../prediction.types";
import { mergeIndexPoints } from "./binaryRoundView";
import {
  type BinaryHistoryStatus,
  aggregateMinuteCandles,
  startBinaryHistoryLoader,
  subscribeBinaryIndexPrices,
} from "./binaryUnderlyingData";

export { aggregateMinuteCandles } from "./binaryUnderlyingData";

/** Public index-price query limits (api-spec §3.5): 1s rows, ≤10min a window. */
const INDEX_PRICE_MAX_WINDOW_MS = 10 * 60_000;
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
  const ws = useWS();
  const [historyState, setHistoryState] = useState<{
    key: string;
    points: PredictionChartPoint[];
  } | null>(null);
  const [trailingState, setTrailingState] = useState<{
    symbol: string;
    points: PredictionChartPoint[];
  } | null>(null);
  const [historyStatusState, setHistoryStatusState] = useState<{
    key: string;
    status: BinaryHistoryStatus;
  } | null>(null);
  const roundKey = `${apiBaseUrl}:${indexSymbol}:${roundStartSec ?? ""}:${expireAtMs ?? ""}`;
  // A completed history remains readable during later phase refreshes and retries.
  const historyStatus: BinaryHistoryStatus =
    !active || roundStartSec == null
      ? "idle"
      : historyState?.key === roundKey
        ? "ready"
        : historyStatusState?.key === roundKey
          ? historyStatusState.status
          : "loading";
  const history =
    historyState?.key === roundKey ? historyState.points : EMPTY_POINTS;
  const trailing =
    trailingState?.symbol === indexSymbol ? trailingState.points : EMPTY_POINTS;

  useEffect(() => {
    if (!active || roundStartSec == null) {
      setHistoryState(null);
      setHistoryStatusState(null);
      return;
    }
    return startBinaryHistoryLoader(
      {
        roundStartMs: roundStartSec * 1_000,
        expireAtMs,
        load: (startT, endT) =>
          fetchIndexPriceRange(apiBaseUrl, indexSymbol, startT, endT),
        onLoad: (points) => setHistoryState({ key: roundKey, points }),
        onStatus: (status) => setHistoryStatusState({ key: roundKey, status }),
      },
      {
        now: getTimestamp,
        setTimeout: (callback, delay) => window.setTimeout(callback, delay),
        clearTimeout: (timer) => window.clearTimeout(timer),
      },
    );
  }, [active, apiBaseUrl, indexSymbol, roundKey, roundStartSec, expireAtMs]);

  useEffect(() => {
    if (!active || !indexSymbol) return;
    // Subscribe by underlying symbol so round rotation retains the live tail.
    return subscribeBinaryIndexPrices(ws, indexSymbol, (point) => {
      setTrailingState((state) => {
        const previous = state?.symbol === indexSymbol ? state.points : [];
        const last = previous.at(-1);
        if (last != null && point.timestamp < last.timestamp) return state;
        if (last?.timestamp === point.timestamp) {
          return last.price === point.price
            ? state
            : {
                symbol: indexSymbol,
                points: [...previous.slice(0, -1), point],
              };
        }
        return {
          symbol: indexSymbol,
          points: [...previous, point].slice(-MAX_TRAILING_POINTS),
        };
      });
    });
  }, [active, indexSymbol, ws]);

  const priceHistory = useMemo(
    () =>
      roundStartSec == null
        ? EMPTY_POINTS
        : mergeIndexPoints(history, trailing, expireAtMs),
    [history, trailing, roundStartSec, expireAtMs],
  );
  // An empty successful history must not expose the short WS tail as a full
  // candle chart. Keep live points available to the line chart and price stats.
  const isHistoryEmpty = historyState?.key === roundKey && history.length === 0;
  const candles = useMemo(
    () => aggregateMinuteCandles(isHistoryEmpty ? EMPTY_POINTS : priceHistory),
    [isHistoryEmpty, priceHistory],
  );
  const chartIndexPrice = trailing.at(-1)?.price ?? history.at(-1)?.price;
  const currentPrice = chartIndexPrice ?? 0;

  return {
    currentPrice,
    chartIndexPrice,
    priceHistory,
    historyStatus,
    /** Minute candles including the pre-T0 context, bounded at T1. */
    candles,
  };
};

export type BinaryUnderlyingState = ReturnType<typeof useBinaryUnderlying>;
