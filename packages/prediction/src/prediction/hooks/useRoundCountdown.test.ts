import assert from "node:assert/strict";
import test from "node:test";
import { createSharedHeartbeat } from "./useRoundCountdown";

type SharedHeartbeat = ReturnType<typeof createSharedHeartbeat>;

const createFakeClock = () => {
  const intervals: { callback: () => void; cleared: boolean }[] = [];
  let now = 0;
  return {
    intervals,
    now: () => now,
    advance: (seconds: number) => {
      for (let i = 0; i < seconds; i += 1) {
        now += 1_000;
        intervals.forEach((interval) => {
          if (!interval.cleared) interval.callback();
        });
      }
    },
    setInterval: (callback: () => void) => {
      const interval = { callback, cleared: false };
      intervals.push(interval);
      return intervals.length - 1;
    },
    clearInterval: (timer: number) => {
      intervals[timer].cleared = true;
    },
    liveCount: () => intervals.filter((interval) => !interval.cleared).length,
  };
};

const subscribe = (heartbeat: SharedHeartbeat, ticks: number[]) =>
  heartbeat.subscribe((timestamp) => ticks.push(timestamp));

test("first subscriber starts one shared interval, last unsubscribe clears it", () => {
  const clock = createFakeClock();
  const heartbeat = createSharedHeartbeat(clock);
  const ticks: number[] = [];
  assert.equal(clock.liveCount(), 0);

  const unsubscribe = subscribe(heartbeat, ticks);
  assert.equal(clock.liveCount(), 1);

  clock.advance(2);
  assert.deepEqual(ticks, [1_000, 2_000]);

  unsubscribe();
  assert.equal(clock.liveCount(), 0);
});

test("multiple listeners share a single timer", () => {
  const clock = createFakeClock();
  const heartbeat = createSharedHeartbeat(clock);
  const first: number[] = [];
  const second: number[] = [];

  const unsubscribeFirst = subscribe(heartbeat, first);
  const unsubscribeSecond = subscribe(heartbeat, second);
  assert.equal(clock.liveCount(), 1);

  clock.advance(1);
  assert.deepEqual(first, [1_000]);
  assert.deepEqual(second, [1_000]);

  // Dropping to one listener keeps the shared interval alive.
  unsubscribeFirst();
  assert.equal(clock.liveCount(), 1);
  clock.advance(1);
  assert.deepEqual(first, [1_000]);
  assert.deepEqual(second, [1_000, 2_000]);

  unsubscribeSecond();
  assert.equal(clock.liveCount(), 0);
});
