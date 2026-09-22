import { useEffect, useRef, useState } from "react";
import type { PredictionOutcome } from "./prediction.script";

// Mock candle-simulation engine for the prototype chart. Real chart data
// wiring replaces this module without touching the chart UI.

export type PredictionCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export const CANDLE_INTERVAL_MS = 60_000;
export const CANDLE_COUNT = 81;
export const CANDLE_WINDOW_MS = 80 * 60_000;
export const CANDLE_TICK_INTERVAL_MS = 7 * 60_000;

export const ROUND_INTERVAL_SECONDS = 300;

// Rounds settle deterministically by id parity in the prototype, so ended
// rounds keep a stable result without a settlement feed.
export const getHistoricalRoundOutcome = (round: number): PredictionOutcome =>
  Math.abs(Math.floor(round / ROUND_INTERVAL_SECONDS)) % 2 === 0
    ? "up"
    : "down";

export const createMockCandleHistory = (
  anchorPrice: number,
  endTimestamp = Date.now(),
  count = CANDLE_COUNT,
): PredictionCandle[] => {
  const end =
    Math.floor(endTimestamp / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;
  let previousClose = anchorPrice - 36;
  const candles = Array.from({ length: count }, (_, index) => {
    const timestamp = end - (count - 1 - index) * CANDLE_INTERVAL_MS;
    const open = previousClose;
    const move =
      Math.sin(index / 3.4) * 10 +
      Math.cos(index / 7.2) * 7 +
      Math.sin(index / 1.8) * 3;
    const close = open + move;
    const wick = 5 + Math.abs(Math.cos(index / 2.6)) * 9;
    previousClose = close;
    return {
      timestamp,
      open,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - wick * 0.82,
      close,
    };
  });
  const offset = anchorPrice - (candles.at(-1)?.close ?? anchorPrice);
  return candles.map((candle) => ({
    ...candle,
    open: candle.open + offset,
    high: candle.high + offset,
    low: candle.low + offset,
    close: candle.close + offset,
  }));
};

const rollLiveCandles = (
  candles: PredictionCandle[],
  price: number,
): PredictionCandle[] => {
  const lastCandle = candles.at(-1);
  if (!lastCandle) return createMockCandleHistory(price);

  const currentMinute =
    Math.floor(Date.now() / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;
  if (currentMinute > lastCandle.timestamp) {
    return [
      ...candles.slice(-(CANDLE_COUNT - 1)),
      {
        timestamp: currentMinute,
        open: lastCandle.close,
        high: Math.max(lastCandle.close, price),
        low: Math.min(lastCandle.close, price),
        close: price,
      },
    ];
  }

  const high = Math.max(lastCandle.high, price);
  const low = Math.min(lastCandle.low, price);
  if (
    high === lastCandle.high &&
    low === lastCandle.low &&
    price === lastCandle.close
  ) {
    return candles;
  }
  return [...candles.slice(0, -1), { ...lastCandle, high, low, close: price }];
};

/** Live candle series seeded from the current price and reset per round. */
export const usePredictionCandles = (
  currentPrice: number,
  resetKey: number,
) => {
  const [liveCandles, setLiveCandles] = useState<PredictionCandle[]>(() =>
    createMockCandleHistory(currentPrice),
  );

  useEffect(() => {
    setLiveCandles(createMockCandleHistory(currentPrice));
    // Re-seed history only when the round changes; price ticks must not reset
    // the series.
  }, [resetKey]);

  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;

  useEffect(() => {
    setLiveCandles((candles) => rollLiveCandles(candles, currentPrice));
  }, [currentPrice]);

  // Open the next minute's candle even when the price hasn't ticked.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveCandles((candles) =>
        rollLiveCandles(candles, currentPriceRef.current),
      );
    }, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return liveCandles;
};
