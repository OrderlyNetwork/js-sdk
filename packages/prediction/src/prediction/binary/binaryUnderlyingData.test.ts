import assert from "node:assert/strict";
import test from "node:test";
import type { PredictionChartPoint } from "../prediction.types";
import { mergeIndexPoints } from "./binaryRoundView";
import {
  aggregateMinuteCandles,
  startBinaryHistoryLoader,
  subscribeBinaryIndexPrices,
} from "./binaryUnderlyingData";

const t0 = Date.UTC(2026, 9, 9, 10, 0);
const settle = async () => {
  for (let index = 0; index < 4; index++) await Promise.resolve();
};

const createClock = (initialTime: number) => {
  let time = initialTime;
  let id = 0;
  const timers = new Map<number, { at: number; callback: () => void }>();
  return {
    now: () => time,
    setTimeout: (callback: () => void, delay: number) => {
      const timer = ++id;
      timers.set(timer, { at: time + delay, callback });
      return timer;
    },
    clearTimeout: (timer: number) => {
      timers.delete(timer);
    },
    advanceTo: async (target: number) => {
      let next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      while (next && next[1].at <= target) {
        time = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
        await settle();
        next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      }
      time = target;
    },
    pending: () => timers.size,
  };
};

const createStream = () => {
  type Handlers = Parameters<
    Parameters<typeof subscribeBinaryIndexPrices>[0]["subscribe"]
  >[1];
  let handlers: Handlers;
  let topic: string | undefined;
  let unsubscribed = false;
  return {
    subscribe: (nextTopic: string, nextHandlers: Handlers) => {
      topic = nextTopic;
      handlers = nextHandlers;
      return () => {
        unsubscribed = true;
      };
    },
    emit: (message: Parameters<Handlers["onMessage"]>[0]) =>
      handlers.onMessage(handlers.formatter(message)),
    topic: () => topic,
    unsubscribed: () => unsubscribed,
  };
};

test("unchanged index messages keep the line populated and open new minute candles", () => {
  const stream = createStream();
  const points: PredictionChartPoint[] = [];
  const stop = subscribeBinaryIndexPrices(stream, "PERP_BTC_USDC", (point) =>
    points.push(point),
  );
  assert.equal(stream.topic(), "SPOT_BTC_USDC@indexprice");
  for (let second = 0; second <= 125; second++) {
    stream.emit({
      ts: t0 + second * 1_000,
      data: { symbol: "SPOT_BTC_USDC", price: 68_000 },
    });
  }
  const history = mergeIndexPoints([], points, t0 + 300_000);
  const lineWindow = history.filter(
    (point) => point.timestamp >= t0 + 125_000 - 60_000,
  );
  assert.equal(lineWindow.length, 61);
  assert.deepEqual(lineWindow.at(-1), {
    timestamp: t0 + 125_000,
    price: 68_000,
  });
  assert.deepEqual(
    aggregateMinuteCandles(history),
    [t0, t0 + 60_000, t0 + 120_000].map((timestamp) => ({
      timestamp,
      open: 68_000,
      high: 68_000,
      low: 68_000,
      close: 68_000,
    })),
  );
  stop();
});

test("index observations use message time, remain bounded at T1 and stop on cleanup", () => {
  const stream = createStream();
  const points: PredictionChartPoint[] = [];
  const stop = subscribeBinaryIndexPrices(stream, "PERP_BTC_USDC", (point) =>
    points.push(point),
  );
  const emit = (ts: number, price = 68_000, symbol = "SPOT_BTC_USDC") =>
    stream.emit({ ts, data: { symbol, price } });
  const t1 = t0 + 300_000;
  emit(t1 - 1);
  emit(t1);
  emit(t1 + 1);
  emit(t1 + 2, NaN);
  emit(NaN);
  emit(t1 + 2, 68_000, "SPOT_ETH_USDC");
  stream.emit({ data: { symbol: "SPOT_BTC_USDC", price: 68_000 } });
  assert.equal(points.length, 3);
  assert.deepEqual(mergeIndexPoints([], points, t1), [
    { timestamp: t1 - 1, price: 68_000 },
  ]);
  stop();
  assert.equal(stream.unsubscribed(), true);
  emit(t1 + 3);
  assert.equal(points.length, 3);
});

test("T1 failures preserve loaded history and retry until the final history succeeds", async () => {
  const clock = createClock(t0 + 1_000);
  const t1 = t0 + 3_000;
  const initial = [{ timestamp: t0, price: 68_000 }];
  const final = [...initial, { timestamp: t1 - 1, price: 68_100 }];
  const ranges: Array<[number, number]> = [];
  let visible: PredictionChartPoint[] = [];
  const stop = startBinaryHistoryLoader(
    {
      roundStartMs: t0,
      expireAtMs: t1,
      load: async (start, end) => {
        ranges.push([start, end]);
        if (ranges.length === 2 || ranges.length === 3)
          throw new Error("Temporary history failure");
        return ranges.length === 1 ? initial : final;
      },
      onLoad: (points) => (visible = points),
    },
    clock,
  );
  await settle();
  assert.deepEqual(visible, initial);
  await clock.advanceTo(t1);
  assert.equal(ranges.length, 2);
  assert.deepEqual(visible, initial);
  await clock.advanceTo(t1 + 4_999);
  assert.equal(ranges.length, 2);
  await clock.advanceTo(t1 + 5_000);
  assert.equal(ranges.length, 3);
  assert.deepEqual(visible, initial);
  await clock.advanceTo(t1 + 10_000);
  assert.deepEqual(visible, final);
  assert.deepEqual(
    ranges.slice(1).map(([, end]) => end),
    [t1, t1, t1],
  );
  assert.equal(clock.pending(), 0);
  await clock.advanceTo(t1 + 60_000);
  assert.equal(ranges.length, 4);
  stop();
});

test("opening an ended round still retries a failed initial request", async () => {
  const clock = createClock(t0 + 301_000);
  let attempts = 0;
  let loads = 0;
  const stop = startBinaryHistoryLoader(
    {
      roundStartMs: t0,
      expireAtMs: t0 + 300_000,
      load: async () => {
        if (++attempts === 1) throw new Error("Offline");
        return [];
      },
      onLoad: () => loads++,
    },
    clock,
  );
  await settle();
  assert.equal(loads, 0);
  await clock.advanceTo(t0 + 306_000);
  assert.equal(attempts, 2);
  assert.equal(loads, 1);
  assert.equal(clock.pending(), 0);
  stop();
});

test("T0 and T1 advance loading phases even during a previous phase retry delay", async () => {
  const clock = createClock(t0 - 2_000);
  const ends: number[] = [];
  const stop = startBinaryHistoryLoader(
    {
      roundStartMs: t0,
      expireAtMs: t0 + 2_000,
      load: async (_, end) => {
        ends.push(end);
        if (end === t0) throw new Error("Temporary T0 failure");
        return [];
      },
      onLoad: () => {},
    },
    clock,
  );
  await settle();
  await clock.advanceTo(t0);
  await clock.advanceTo(t0 + 2_000);
  assert.deepEqual(ends, [t0 - 2_000, t0, t0 + 2_000]);
  assert.equal(clock.pending(), 0);
  stop();
});

test("stopping a failed loader cancels retries", async () => {
  const clock = createClock(t0 + 301_000);
  let attempts = 0;
  const stop = startBinaryHistoryLoader(
    {
      roundStartMs: t0,
      expireAtMs: t0 + 300_000,
      load: async () => {
        attempts++;
        throw new Error("Offline");
      },
      onLoad: () => assert.fail("A failed load must preserve existing history"),
    },
    clock,
  );
  await settle();
  stop();
  assert.equal(clock.pending(), 0);
  await clock.advanceTo(t0 + 360_000);
  assert.equal(attempts, 1);
});

test("in-flight loads do not overlap or update history after round cleanup", async () => {
  const clock = createClock(t0 + 1_000);
  let resolve!: (points: PredictionChartPoint[]) => void;
  const pending = new Promise<PredictionChartPoint[]>(
    (done) => (resolve = done),
  );
  let attempts = 0;
  const stop = startBinaryHistoryLoader(
    {
      roundStartMs: t0,
      expireAtMs: t0 + 300_000,
      load: () => {
        attempts++;
        return pending;
      },
      onLoad: () => assert.fail("An old round request must not update history"),
    },
    clock,
  );
  await clock.advanceTo(t0 + 310_000);
  assert.equal(attempts, 1);
  stop();
  resolve([{ timestamp: t0, price: 68_000 }]);
  await settle();
  assert.equal(clock.pending(), 0);
});
