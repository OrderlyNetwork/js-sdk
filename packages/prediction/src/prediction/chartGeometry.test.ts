import assert from "node:assert/strict";
import { test } from "node:test";
import { computeChartGeometry } from "./chartGeometry";
import { CANDLE_INTERVAL_MS, CANDLE_WINDOW_MS } from "./predictionChart.script";

const WIDTH = 720;
const HEIGHT = 230;
const PLOT_WIDTH = 650;
const PLOT_HEIGHT = 230;
const WINDOW = 60 * 60 * 1_000;
const ROUND = 808;
const base = {
  selectedRound: ROUND,
  isPastRound: false,
  isFutureRound: false,
  intervalSeconds: 300,
  width: WIDTH,
  height: HEIGHT,
  plotWidth: PLOT_WIDTH,
  plotHeight: PLOT_HEIGHT,
  windowDuration: WINDOW,
};
const now = 1_790_000_000_000;

test("price mode maps points into normalized ratios and a line path", () => {
  const points = [
    { timestamp: now - 30_000, price: 100 },
    { timestamp: now - 10_000, price: 110 },
  ];
  const chart = computeChartGeometry({
    ...base,
    chartMode: "price",
    selectedRow: undefined,
    now,
    candles: [],
    points,
    openingPrice: 100,
    currentPrice: 110,
    cachedScale: undefined,
  });
  assert.match(chart.line, /^M [\d.]+,[\d.]+ C /);
  assert.ok(chart.hoverPoints.length === 2);
  for (const point of chart.hoverPoints) {
    assert.ok(point.xRatio >= 0 && point.xRatio <= 1);
    assert.ok(point.yRatio >= 0 && point.yRatio <= 1);
  }
  assert.ok(chart.area.endsWith("Z"));
  // Live rounds use a rolling 60s window, so both points are in-window and
  // ordered timestamps map to increasing x ratios.
  assert.ok(chart.hoverPoints[0].xRatio < chart.hoverPoints[1].xRatio);
});

test("price mode leaves the candle cache untouched", () => {
  const cachedScale = {
    round: ROUND,
    minimum: 0,
    maximum: 200,
    step: 40,
  };
  const chart = computeChartGeometry({
    ...base,
    chartMode: "price",
    selectedRow: undefined,
    now,
    candles: [],
    points: [{ timestamp: now - 5_000, price: 100 }],
    openingPrice: 100,
    currentPrice: 100,
    cachedScale,
  });
  assert.equal(chart.nextCandleScale, cachedScale);
});

test("candle mode caches a scale that covers the visible range", () => {
  const candles = Array.from({ length: 10 }, (_, index) => ({
    timestamp: now - CANDLE_WINDOW_MS + index * CANDLE_INTERVAL_MS,
    open: 99,
    high: 101,
    low: 98,
    close: 100,
  }));
  const first = computeChartGeometry({
    ...base,
    chartMode: "candles",
    selectedRow: { expire_at: now + 300_000 },
    now,
    candles,
    points: [],
    openingPrice: 100,
    currentPrice: 100,
    cachedScale: undefined,
  });
  const scale = first.nextCandleScale;
  assert.ok(scale && scale.round === ROUND);
  assert.ok(scale.minimum < 98 && scale.maximum > 101);
  assert.ok(first.candles.length === 10);
  assert.ok(first.candleWidth >= 2 && first.candleWidth <= 8);
});

test("cached scale is reused while prices stay inside it, replaced when they escape", () => {
  const candles = [
    { timestamp: now - 120_000, open: 99, high: 101, low: 98, close: 100 },
  ];
  const first = computeChartGeometry({
    ...base,
    chartMode: "candles",
    selectedRow: { expire_at: now + 300_000 },
    now,
    candles,
    points: [],
    openingPrice: 100,
    currentPrice: 100,
    cachedScale: undefined,
  });
  const cached = first.nextCandleScale!;
  // Same round, same range: the cached object itself comes back untouched.
  const kept = computeChartGeometry({
    ...base,
    chartMode: "candles",
    selectedRow: { expire_at: now + 300_000 },
    now,
    candles,
    points: [],
    openingPrice: 100,
    currentPrice: 100,
    cachedScale: cached,
  });
  assert.equal(kept.nextCandleScale, cached);
  // Prices escaping the cached range force a new scale object.
  const escaped = computeChartGeometry({
    ...base,
    chartMode: "candles",
    selectedRow: { expire_at: now + 300_000 },
    now,
    candles: [
      { timestamp: now - 120_000, open: 99, high: 5000, low: 98, close: 4990 },
    ],
    points: [],
    openingPrice: 100,
    currentPrice: 4990,
    cachedScale: cached,
  });
  assert.notEqual(escaped.nextCandleScale, cached);
  assert.ok(escaped.nextCandleScale.maximum >= 5000);
});

test("a different round never reuses the previous round's cache", () => {
  const candles = [
    { timestamp: now - 120_000, open: 99, high: 101, low: 98, close: 100 },
  ];
  const cached = { round: ROUND - 1, minimum: 0, maximum: 200, step: 40 };
  const chart = computeChartGeometry({
    ...base,
    chartMode: "candles",
    selectedRow: { expire_at: now + 300_000 },
    now,
    candles,
    points: [],
    openingPrice: 100,
    currentPrice: 100,
    cachedScale: cached,
  });
  assert.notEqual(chart.nextCandleScale, cached);
  assert.equal(chart.nextCandleScale.round, ROUND);
});

test("y ticks step evenly from maximum down and report tick decimals", () => {
  const chart = computeChartGeometry({
    ...base,
    chartMode: "price",
    selectedRow: undefined,
    now,
    candles: [],
    points: [{ timestamp: now - 5_000, price: 100 }],
    openingPrice: 100,
    currentPrice: 101,
    cachedScale: undefined,
  });
  const { yTicks } = chart;
  assert.ok(yTicks.length >= 2);
  assert.equal(yTicks[0].ratio, 0);
  assert.equal(yTicks[0].value, Math.max(...yTicks.map((tick) => tick.value)));
  const tickStep = yTicks[0].value - yTicks[1].value;
  for (let index = 1; index < yTicks.length; index += 1) {
    const previous = yTicks[index - 1].value;
    const current = yTicks[index].value;
    assert.ok(Math.abs(previous - current - tickStep) < 1e-9);
  }
  assert.ok(Number.isInteger(chart.yDecimals) && chart.yDecimals >= 0);
});
