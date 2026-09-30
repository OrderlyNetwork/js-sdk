import { useEffect, useRef, useState } from "react";
import type { PredictionOutcome } from "./prediction.script";

// Candle orchestration for the round chart. Seeds come from the public
// index-price history (see binary/useBinaryUnderlying); live minutes roll
// from the WS index price ticks.

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

const currentMinuteStart = () =>
  Math.floor(Date.now() / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;

const rollLiveCandles = (
  candles: PredictionCandle[],
  price: number,
): PredictionCandle[] => {
  const lastCandle = candles.at(-1);
  if (!lastCandle) {
    return [
      {
        timestamp: currentMinuteStart(),
        open: price,
        high: price,
        low: price,
        close: price,
      },
    ];
  }

  const currentMinute = currentMinuteStart();
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

/**
 * Live candle series seeded from the round's real index-price history; price
 * ticks roll the latest candle and minute rollovers open the next one. The
 * seed array identity only changes when a new round's history lands, so the
 * reset does not fight the per-second rolling updates.
 */
export const usePredictionCandles = (
  seedCandles: PredictionCandle[],
  currentPrice: number,
) => {
  const [liveCandles, setLiveCandles] =
    useState<PredictionCandle[]>(seedCandles);

  useEffect(() => {
    setLiveCandles(seedCandles);
  }, [seedCandles]);

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

/**
 * Round outcome lookup injected from the binary rounds snapshot; rounds that
 * fell out of the 300-row window have no known result.
 */
export type RoundOutcomeLookup = (
  round: number,
) => PredictionOutcome | undefined;
