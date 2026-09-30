import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveBinaryPhase,
  isBinaryRowTradable,
  type BinaryInfoRow,
} from "./binaryInfo";
import { deriveBinaryMarkets } from "./binaryMarkets";
import { startBinaryRoundClock } from "./binaryRoundClock";

const start = Date.UTC(2026, 8, 30);
const current: BinaryInfoRow = {
  symbol: "PERP_BTC5M2609300000_USDC",
  product_type: "BINARY",
  fee_model: "BINARY_PROBABILITY",
  status: "ACTIVE",
  activated_at: start - 60_000,
  observation_start_at: start,
  expire_at: start + 300_000,
  index_price_symbol: "PERP_BTC_USDC",
  s0: null,
};
const upcoming: BinaryInfoRow = {
  ...current,
  symbol: "PERP_BTC5M2609300005_USDC",
  observation_start_at: current.expire_at,
  expire_at: current.expire_at + 300_000,
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
    advanceTo: (target: number) => {
      let next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      while (next && next[1].at <= target) {
        time = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
        next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      }
      time = target;
    },
    // Simulate a throttled tab delivering its pending callback after expiry.
    resumeAt: (target: number) => {
      time = target;
      for (const [timer, task] of [...timers]) {
        if (task.at <= time) {
          timers.delete(timer);
          task.callback();
        }
      }
    },
    pending: () => timers.size,
  };
};

test("closes a round and follows the next round without a new snapshot", () => {
  const clock = createClock(start + 60_000);
  const rows = [upcoming, current];
  let now = 0;
  const stop = startBinaryRoundClock(rows, (time) => (now = time), clock);

  assert.equal(deriveBinaryPhase(current, now), "trading");
  clock.advanceTo(current.expire_at - 30_000 + 5);
  assert.equal(deriveBinaryPhase(current, now), "closingSoon");
  assert.equal(clock.pending(), 1);

  clock.advanceTo(current.expire_at + 5);
  assert.equal(deriveBinaryPhase(current, now), "closed");
  assert.equal(isBinaryRowTradable(current, now), false);
  assert.equal(deriveBinaryMarkets(rows, now)[0].currentRow, upcoming);

  clock.advanceTo(upcoming.expire_at + 5);
  assert.equal(isBinaryRowTradable(upcoming, now), false);
  assert.deepEqual(deriveBinaryMarkets(rows, now), []);
  assert.equal(clock.pending(), 0);
  stop();
});

test("updates at observation start even when closingSoon is still far away", () => {
  const clock = createClock(start - 60_000);
  let now = 0;
  const stop = startBinaryRoundClock([current], (time) => (now = time), clock);
  clock.advanceTo(start + 5);
  assert.equal(now, start + 5);
  assert.equal(clock.pending(), 1);
  stop();
});

test("synchronizes expired snapshots and reactivation without future timers", () => {
  const clock = createClock(start + 60_000);
  let now = 0;
  const stop = startBinaryRoundClock([current], (time) => (now = time), clock);
  stop();
  clock.advanceTo(current.expire_at + 60_000);
  const stopReactivated = startBinaryRoundClock(
    [current],
    (time) => (now = time),
    clock,
  );
  assert.equal(now, clock.now());
  assert.equal(isBinaryRowTradable(current, now), false);
  assert.equal(clock.pending(), 0);
  stopReactivated();
});

test("catches up after a delayed callback and schedules the next live boundary", () => {
  const clock = createClock(start + 60_000);
  let now = 0;
  const stop = startBinaryRoundClock(
    [upcoming, current],
    (time) => (now = time),
    clock,
  );
  clock.resumeAt(current.expire_at + 60_000);
  assert.equal(now, clock.now());
  assert.equal(isBinaryRowTradable(current, now), false);
  assert.equal(clock.pending(), 1);
  clock.advanceTo(upcoming.expire_at + 5);
  assert.equal(isBinaryRowTradable(upcoming, now), false);
  stop();
});

test("stopping or replacing a snapshot cancels the old boundary timer", () => {
  const clock = createClock(start + 60_000);
  const ticks: number[] = [];
  const stop = startBinaryRoundClock(
    [current],
    (time) => ticks.push(time),
    clock,
  );
  stop();
  assert.equal(clock.pending(), 0);
  const stopReplacement = startBinaryRoundClock(
    [],
    (time) => ticks.push(time),
    clock,
  );
  clock.advanceTo(current.expire_at + 5);
  assert.deepEqual(ticks, [start + 60_000, start + 60_000]);
  stopReplacement();
});
