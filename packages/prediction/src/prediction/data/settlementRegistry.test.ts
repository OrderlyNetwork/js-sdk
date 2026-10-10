import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createSettlementResource,
  getSettlementResource,
} from "./settlementRegistry";

const symbol = "PERP_BTC5M2601010000_USDC";
const position = { symbol, outcome: "up" as const, quantity: 10 };
const input = (
  accountId: string,
  positions = [position],
  seedPositions: typeof positions | null = positions,
) => ({
  accountId,
  active: true,
  positions,
  seedPositions: seedPositions ?? undefined,
  now: Date.UTC(2026, 9, 9),
});

test("REST alone seeds observations; stream positions cannot seed a fresh account", () => {
  const r = getSettlementResource(new Map(), "a");
  r.update(input("a", [position], null));
  assert.equal(r.getSnapshot().initialized, false);
  assert.deepEqual(r.getSnapshot().holdings, []);
  r.update(input("a", [position], []));
  assert.equal(r.getSnapshot().initialized, true);
  assert.deepEqual(r.getSnapshot().holdings, []);
  r.update(input("a"));
  assert.equal(r.getSnapshot().holdings.length, 0);
  r.update(input("a", [{ ...position, quantity: 11 }]));
  assert.equal(r.getSnapshot().holdings.length, 1);
});

test("same cache/account reuses disappeared holdings while other accounts cannot read them", () => {
  const cache = new Map(),
    a = getSettlementResource(cache, "a");
  a.update(input("a"));
  a.update(input("a", []));
  assert.equal(getSettlementResource(cache, "a"), a);
  assert.equal(a.getSnapshot().holdings.length, 1);
  const b = getSettlementResource(cache, "b");
  b.update(input("a"));
  assert.equal(b.getSnapshot().holdings.length, 0);
  assert.notEqual(a, getSettlementResource(new Map(), "a"));
  assert.equal(getSettlementResource(cache).getSnapshot().holdings.length, 0);
});

test("logout cache cleanup removes the reachable observation resource", () => {
  const cache = new Map(),
    a = getSettlementResource(cache, "a");
  a.update(input("a"));
  cache.clear();
  assert.notEqual(getSettlementResource(cache, "a"), a);
  assert.equal(
    getSettlementResource(cache, "a").getSnapshot().initialized,
    false,
  );
});

test("equal observations do not broadcast a new snapshot", () => {
  const r = getSettlementResource(new Map(), "a");
  let updates = 0;
  const release = r.subscribe(() => {
    updates++;
  });
  r.update(input("a"));
  const snapshot = r.getSnapshot();
  r.update(input("a"));
  assert.equal(r.getSnapshot(), snapshot);
  assert.equal(updates, 1);
  release();
});

test("a cached resource validates REST on reactivation while retaining disappeared holdings", () => {
  const r = getSettlementResource(new Map(), "a");
  const leave = r.subscribe(() => {});
  r.update(input("a"));
  leave();
  const other = { ...position, symbol: "PERP_ETH5M2601010000_USDC" };
  const leaveAgain = r.subscribe(() => {});
  r.update(input("a", [other], null));
  assert.deepEqual(
    r.getSnapshot().holdings.map((p) => p.symbol),
    [symbol],
  );
  r.update(input("a", [other], []));
  r.update(input("a", [other], []));
  assert.deepEqual(
    r.getSnapshot().holdings.map((p) => p.symbol),
    [symbol],
  );
  r.update(input("a", [position]));
  assert.deepEqual(
    r.getSnapshot().holdings.map((p) => p.symbol),
    [symbol],
  );
  leaveAgain();
});

test("each retained poller refreshes on its own cadence, not just the first registered", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  const advance = async (ms: number) => {
    t.mock.timers.tick(ms);
    // Let the fired refresh reschedule before the clock moves on.
    await flush();
  };
  const resource = createSettlementResource("a");
  let fast = 0;
  let slow = 0;
  const releaseSlow = resource.retainPolling(() => {
    slow++;
    return Promise.resolve();
  }, 60_000);
  const releaseFast = resource.retainPolling(() => {
    fast++;
    return Promise.resolve();
  }, 5_000);
  // The first consumer and any faster interval validate immediately.
  await flush();
  assert.equal(fast, 1);
  assert.equal(slow, 1);
  for (let i = 0; i < 4; i++) await advance(5_000);
  assert.equal(fast, 5);
  assert.equal(slow, 1);
  for (let i = 0; i < 8; i++) await advance(5_000);
  assert.equal(fast, 13);
  assert.equal(slow, 2);
  releaseFast();
  releaseSlow();
  await advance(60_000);
  assert.equal(fast, 13);
  assert.equal(slow, 2);
});

test("a release during an in-flight refresh keeps the surviving chain alive", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  const advance = async (ms: number) => {
    t.mock.timers.tick(ms);
    await flush();
  };
  const resource = createSettlementResource("a");
  let fast = 0;
  let slow = 0;
  let releaseSlow: () => void = () => {};
  releaseSlow = resource.retainPolling(() => {
    slow++;
    return Promise.resolve();
  }, 60_000);
  const releaseFast = resource.retainPolling(() => {
    fast++;
    // Detach the slow poller from inside the fast poller's first
    // timer-driven refresh, while fire() sits between claiming and rescheduling.
    if (fast === 2) releaseSlow();
    return Promise.resolve();
  }, 5_000);
  await flush();
  assert.equal(fast, 1);
  assert.equal(slow, 1);
  await advance(5_000);
  assert.equal(fast, 2);
  assert.equal(slow, 1);
  for (let i = 0; i < 3; i++) await advance(5_000);
  assert.equal(fast, 5);
  assert.equal(slow, 1);
  releaseFast();
  await advance(60_000);
  assert.equal(fast, 5);
  assert.equal(slow, 1);
});

test("a release inside a refresh skips that round's remaining pollers", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  const advance = async (ms: number) => {
    t.mock.timers.tick(ms);
    await flush();
  };
  const resource = createSettlementResource("a");
  let fast = 0;
  let slow = 0;
  let releaseSlow: () => void = () => {};
  const releaseFast = resource.retainPolling(() => {
    fast++;
    // On the first timer-driven round, detach the slower-registered poller
    // synchronously before its refresh starts.
    if (fast === 2) releaseSlow();
    return Promise.resolve();
  }, 5_000);
  await flush();
  assert.equal(fast, 1);
  releaseSlow = resource.retainPolling(() => {
    slow++;
    return Promise.resolve();
  }, 5_000);
  // Same cadence, registered second: no immediate validation, first due
  // round fires both in insertion order.
  await advance(5_000);
  // fast===2 inside its refresh releases slow synchronously mid-round; the
  // not-yet-started slow refresh must be skipped, not run by the stale chain.
  assert.equal(fast, 2);
  assert.equal(slow, 0);
  for (let i = 0; i < 2; i++) await advance(5_000);
  assert.equal(fast, 4);
  assert.equal(slow, 0);
  releaseFast();
  releaseSlow();
  await advance(60_000);
  assert.equal(fast, 4);
  assert.equal(slow, 0);
});

test("retains confirmed records across missing history windows and ignores wrong-account or older snapshots", () => {
  const cache = new Map();
  const resource = getSettlementResource(cache, "a");
  const rows = [
    {
      position_id: 1,
      symbol,
      side: "LONG",
      position_status: "closed",
      type: "trade",
      closed_position_qty: 10,
      avg_open_price: 0.5,
      avg_close_price: 1,
      realized_pnl: 5,
      trading_fee: 0,
      open_timestamp: Date.UTC(2026, 0, 1),
      close_timestamp: Date.UTC(2026, 0, 1, 0, 6),
      last_update_time: Date.UTC(2026, 0, 1, 0, 6),
      outcome: "UP",
      settlement_price_per_share: 1,
      settled_at: Date.UTC(2026, 0, 1, 0, 6),
    },
  ];
  const confirmed = { accountId: "a", receivedAt: 100, rows };
  resource.rememberHistory(confirmed);
  assert.equal(resource.getSnapshot().confirmedHistoryRecords.length, 1);
  resource.rememberHistory({ accountId: "b", receivedAt: 200, rows: [] });
  resource.rememberHistory({ accountId: "a", receivedAt: 50, rows: [] });
  assert.equal(resource.getSnapshot().historySnapshot, confirmed);
  resource.rememberHistory({ accountId: "a", receivedAt: 200, rows: [] });
  assert.equal(resource.getSnapshot().confirmedHistoryRecords.length, 1);
  resource.update(input("a"));
  assert.equal(resource.getSnapshot().confirmedHistoryRecords.length, 1);
  assert.deepEqual(
    getSettlementResource(cache, "b").getSnapshot().confirmedHistoryRecords,
    [],
  );
});
