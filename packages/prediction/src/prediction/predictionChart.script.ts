import type { PredictionResult } from "./prediction.types";

export type PredictionCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export const CANDLE_INTERVAL_MS = 60_000;
export const CANDLE_WINDOW_MS = 80 * 60_000;
export const CANDLE_TICK_INTERVAL_MS = 7 * 60_000;

/**
 * Round outcome lookup injected from the binary rounds snapshot; rounds that
 * fell out of the 300-row window have no known result.
 */
export type RoundOutcomeLookup = (
  round: number,
) => PredictionResult | undefined;

/** Chart rendering mode toggled by the RoundNavigator toolbar. */
export type PredictionChartMode = "price" | "candles";
