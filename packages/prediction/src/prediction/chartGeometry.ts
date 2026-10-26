import type { BinaryInfoRow } from "./binary/binaryInfo";
import type { PredictionChartPoint } from "./prediction.types";
import {
  CANDLE_INTERVAL_MS,
  CANDLE_TICK_INTERVAL_MS,
  CANDLE_WINDOW_MS,
  type PredictionCandle,
  type PredictionChartMode,
} from "./predictionChart.script";

/**
 * Sticky y-axis scale for candle mode: recompute only when the visible
 * range outgrows the cached one, so the axis stays put while prices wiggle
 * inside it. Held as component state (see PriceChart), passed in here as
 * pure input.
 */
export type CandleScale = {
  round: number;
  minimum: number;
  maximum: number;
  step: number;
};

export type ChartGeometryInputs = {
  chartMode: PredictionChartMode;
  selectedRound: number;
  /** Only the expiry is read; a full BinaryInfoRow satisfies this structurally. */
  selectedRow: Pick<BinaryInfoRow, "expire_at"> | undefined;
  isPastRound: boolean;
  isFutureRound: boolean;
  intervalSeconds: number;
  /** Live heartbeat; used as the window edge for live rounds. */
  now: number;
  /** Candles/points pre-filtered to the selected round's expiry. */
  candles: PredictionCandle[];
  points: PredictionChartPoint[];
  openingPrice: number | undefined;
  currentPrice: number | undefined;
  cachedScale: CandleScale | undefined;
  // Plot constants, kept as inputs so tests can use small numbers.
  width: number;
  height: number;
  plotWidth: number;
  plotHeight: number;
  windowDuration: number;
};

/**
 * All chart geometry in one pure pass: x/y mapping, the price line and
 * area path, candle boxes, hover targets, and axis ticks. Returns the
 * scale to persist for the next pass in `nextCandleScale` — the cached
 * object itself when it still covers the visible range (identity is the
 * component's no-update signal), a fresh scale in candle mode, and the
 * cached object untouched in price mode.
 */
export const computeChartGeometry = ({
  chartMode,
  selectedRound,
  selectedRow,
  isPastRound,
  isFutureRound,
  intervalSeconds,
  now,
  candles,
  points,
  openingPrice,
  currentPrice,
  cachedScale,
  width,
  height,
  plotWidth,
  plotHeight,
  windowDuration,
}: ChartGeometryInputs) => {
  const isCandleMode = chartMode === "candles";
  const roundEnd = selectedRow?.expire_at ?? now;
  // Candle charts pin the latest candle to the right edge (one candle of
  // padding) and label ticks backwards from it, so the axis only shifts
  // when a new candle opens.
  const candleAnchor =
    candles.at(-1)?.timestamp ?? (isPastRound ? roundEnd : now);
  const windowEnd = isCandleMode
    ? candleAnchor + CANDLE_INTERVAL_MS
    : isPastRound
      ? roundEnd
      : now;
  const windowStart =
    windowEnd -
    (isCandleMode ? CANDLE_WINDOW_MS : isPastRound ? windowDuration : 60_000);
  const tickInterval = isCandleMode
    ? CANDLE_TICK_INTERVAL_MS
    : isPastRound
      ? intervalSeconds * 1_000
      : 10_000;
  const firstTick = isCandleMode
    ? candleAnchor -
      Math.floor((candleAnchor - windowStart) / tickInterval) * tickInterval
    : Math.ceil(windowStart / tickInterval) * tickInterval;
  const lastTick = isCandleMode ? candleAnchor : windowEnd;
  const tickTimestamps = Array.from(
    { length: Math.floor((lastTick - firstTick) / tickInterval) + 1 },
    (_, index) => firstTick + index * tickInterval,
  );
  const visibleCandles = isCandleMode
    ? candles.filter(
        (candle) =>
          candle.timestamp >= windowStart && candle.timestamp <= windowEnd,
      )
    : [];
  const visiblePoints = isCandleMode
    ? []
    : points.filter(
        (point) =>
          point.timestamp >= windowStart && point.timestamp <= windowEnd,
      );
  const activeWindowDuration = Math.max(windowEnd - windowStart, 1);
  const values = [
    ...visiblePoints.map((point) => point.price),
    ...visibleCandles.flatMap((candle) => [candle.high, candle.low]),
    ...(!isFutureRound && openingPrice != null ? [openingPrice] : []),
    ...(currentPrice != null ? [currentPrice] : []),
  ];
  const rawMinimum = values.length ? Math.min(...values) : 0;
  const rawMaximum = values.length ? Math.max(...values) : 1;
  const padding = Math.max(
    (rawMaximum - rawMinimum) * 0.15,
    Math.abs(currentPrice ?? rawMaximum) * 0.0001,
    0.000001,
  );
  const roughStep = (rawMaximum - rawMinimum + padding * 2) / 5;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step =
    ([1, 2, 5, 10].find((value) => value * magnitude >= roughStep) ?? 10) *
    magnitude;
  const nextScale: CandleScale = {
    round: selectedRound,
    minimum: Math.floor((rawMinimum - padding) / step) * step,
    maximum: Math.ceil((rawMaximum + padding) / step) * step,
    step,
  };
  const keepCandleScale =
    isCandleMode &&
    cachedScale?.round === selectedRound &&
    rawMinimum >= cachedScale.minimum &&
    rawMaximum <= cachedScale.maximum;
  const scale = keepCandleScale ? cachedScale! : nextScale;
  const nextCandleScale = keepCandleScale
    ? cachedScale!
    : isCandleMode
      ? nextScale
      : cachedScale;
  const { minimum, maximum } = scale;
  const range = maximum - minimum;
  const getY = (price?: number) =>
    plotHeight -
    (((price ?? (minimum + maximum) / 2) - minimum) / range) * plotHeight;
  const getX = (timestamp: number) =>
    ((timestamp - windowStart) / activeWindowDuration) * plotWidth;
  const line = visiblePoints
    .map((point, index) => {
      const x = getX(point.timestamp);
      const y = getY(point.price);
      if (index === 0) return `M ${x},${y}`;
      const previous = visiblePoints[index - 1];
      const previousX = getX(previous.timestamp);
      const previousY = getY(previous.price);
      const middleX = (previousX + x) / 2;
      return `C ${middleX},${previousY} ${middleX},${y} ${x},${y}`;
    })
    .join(" ");
  const firstPoint = visiblePoints.at(0);
  const lastPoint = visiblePoints.at(-1);
  const candleWidth = Math.max(
    Math.min((plotWidth / Math.max(visibleCandles.length, 1)) * 0.62, 8),
    2,
  );
  const renderedCandles = visibleCandles.map((candle) => ({
    ...candle,
    x: getX(candle.timestamp),
    openY: getY(candle.open),
    highY: getY(candle.high),
    lowY: getY(candle.low),
    closeY: getY(candle.close),
    up: candle.close >= candle.open,
  }));
  return {
    line,
    area: line
      ? `${line} L ${lastPoint ? getX(lastPoint.timestamp) : 0},${plotHeight} L ${firstPoint ? getX(firstPoint.timestamp) : 0},${plotHeight} Z`
      : "",
    openingY: getY(openingPrice),
    currentY: getY(currentPrice),
    openingRatio: getY(openingPrice) / plotHeight,
    endpointXRatio: (lastPoint ? getX(lastPoint.timestamp) : 0) / width,
    endpointYRatio:
      (lastPoint ? getY(lastPoint.price) : getY(currentPrice)) / height,
    candles: renderedCandles,
    candleWidth,
    hoverPoints: isCandleMode
      ? visibleCandles.map((candle) => ({
          price: candle.close,
          timestamp: candle.timestamp,
          xRatio: getX(candle.timestamp) / plotWidth,
          yRatio: getY(candle.close) / height,
        }))
      : visiblePoints.map((point) => ({
          ...point,
          xRatio: getX(point.timestamp) / plotWidth,
          yRatio: getY(point.price) / height,
        })),
    yTicks: Array.from(
      { length: Math.round(range / scale.step) + 1 },
      (_, index) => {
        const value = maximum - index * scale.step;
        return { ratio: (maximum - value) / range, value };
      },
    ),
    yDecimals: Math.max(0, -Math.floor(Math.log10(scale.step))),
    xTicks: tickTimestamps
      .map((timestamp) => ({
        timestamp,
        ratio: getX(timestamp) / plotWidth,
      }))
      .filter(({ ratio }) =>
        isCandleMode
          ? ratio >= 0.02 && ratio <= 1
          : ratio >= 0.04 && ratio <= 0.96,
      ),
    nextCandleScale,
  };
};

export type ChartGeometry = ReturnType<typeof computeChartGeometry>;
