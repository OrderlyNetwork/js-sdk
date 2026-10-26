import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
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

const flush = () => new Promise((resolve) => setImmediate(resolve));
const mockClock = (t: TestContext) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  return async (ms: number) => {
    t.mock.timers.tick(ms);
    await flush();
  };
};
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

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

test("three subscribers share one refresh per round without an immediate registration fetch", async (t) => {
  const advance = mockClock(t);
  const cache = new Map();
  const calls = [0, 0, 0];
  const releases = calls.map((_, index) =>
    getSettlementResource(cache, "a").retainPolling(() => {
      calls[index]++;
      return Promise.resolve();
    }, 5_000),
  );
  t.after(() => releases.forEach((release) => release()));
  await advance(0);
  assert.deepEqual(calls, [0, 0, 0]);
  await advance(4_999);
  assert.deepEqual(calls, [0, 0, 0]);
  await advance(1);
  assert.deepEqual(calls, [1, 0, 0]);
  await advance(5_000);
  assert.deepEqual(calls, [2, 0, 0]);
  releases.forEach((release) => release());
  await advance(60_000);
  assert.deepEqual(calls, [2, 0, 0]);
});

test("the shortest interval controls all consumers and resets when fast polling leaves", async (t) => {
  const advance = mockClock(t);
  const resource = createSettlementResource("a");
  let calls = 0;
  const refresh = () => {
    calls++;
    return Promise.resolve();
  };
  const releaseSlow = resource.retainPolling(refresh, 60_000);
  t.after(releaseSlow);
  await advance(10_000);
  assert.equal(calls, 0);
  const releaseFast = resource.retainPolling(refresh, 5_000);
  t.after(releaseFast);
  await advance(0);
  assert.equal(calls, 0);
  await advance(4_999);
  assert.equal(calls, 0);
  await advance(1);
  assert.equal(calls, 1);
  await advance(5_000);
  assert.equal(calls, 2);
  releaseFast();
  await advance(59_999);
  assert.equal(calls, 2);
  await advance(1);
  assert.equal(calls, 3);
});

test("equal or slower subscriptions cannot postpone an existing deadline", async (t) => {
  const advance = mockClock(t);
  const resource = createSettlementResource("a");
  let calls = 0;
  const refresh = () => {
    calls++;
    return Promise.resolve();
  };
  const release = resource.retainPolling(refresh, 5_000);
  t.after(release);
  for (let i = 0; i < 4; i++) {
    await advance(1_000);
    resource.retainPolling(refresh, 5_000)();
    resource.retainPolling(refresh, 60_000)();
  }
  assert.equal(calls, 0);
  await advance(1_000);
  assert.equal(calls, 1);
  await advance(5_000);
  assert.equal(calls, 2);
});

test("releasing the selected consumer hands the unchanged deadline to a survivor", async (t) => {
  const advance = mockClock(t);
  const resource = createSettlementResource("a");
  const calls = [0, 0];
  const releaseFirst = resource.retainPolling(() => {
    calls[0]++;
    return Promise.resolve();
  }, 5_000);
  t.after(releaseFirst);
  await advance(2_000);
  const releaseSecond = resource.retainPolling(() => {
    calls[1]++;
    return Promise.resolve();
  }, 5_000);
  t.after(releaseSecond);
  await advance(1_000);
  releaseFirst();
  await advance(1_999);
  assert.deepEqual(calls, [0, 0]);
  await advance(1);
  assert.deepEqual(calls, [0, 1]);
  await advance(5_000);
  assert.deepEqual(calls, [0, 2]);
});

test("a consumer can release itself during refresh without losing the surviving chain", async (t) => {
  const advance = mockClock(t);
  const resource = createSettlementResource("a");
  const calls = [0, 0];
  const releaseFirst = resource.retainPolling(() => {
    calls[0]++;
    releaseFirst();
    return Promise.resolve();
  }, 5_000);
  const releaseSecond = resource.retainPolling(() => {
    calls[1]++;
    return Promise.resolve();
  }, 5_000);
  t.after(releaseFirst);
  t.after(releaseSecond);
  await advance(5_000);
  assert.deepEqual(calls, [1, 0]);
  await advance(5_000);
  assert.deepEqual(calls, [1, 1]);
});

test("slow refreshes never overlap or catch up missed deadlines", async (t) => {
  const advance = mockClock(t);
  const resource = createSettlementResource("a");
  const request = deferred();
  let calls = 0;
  const release = resource.retainPolling(() => {
    calls++;
    return calls === 1 ? request.promise : Promise.resolve();
  }, 5_000);
  t.after(release);
  await advance(5_000);
  assert.equal(calls, 1);
  await advance(30_000);
  assert.equal(calls, 1);
  request.resolve();
  await flush();
  await advance(4_999);
  assert.equal(calls, 1);
  await advance(1);
  assert.equal(calls, 2);
  await advance(5_000);
  assert.equal(calls, 3);
});

test("synchronous and asynchronous refresh failures keep polling alive", async (t) => {
  const advance = mockClock(t);
  const resource = createSettlementResource("a");
  let calls = 0;
  const release = resource.retainPolling(() => {
    calls++;
    if (calls === 1) throw new Error("synchronous failure");
    if (calls === 2) return Promise.reject(new Error("asynchronous failure"));
    return Promise.resolve();
  }, 5_000);
  t.after(release);
  for (let i = 1; i <= 4; i++) {
    await advance(5_000);
    assert.equal(calls, i);
  }
});

test("interval changes during a request apply after it finishes", async (t) => {
  const advance = mockClock(t);
  const resource = createSettlementResource("a");
  const request = deferred();
  let calls = 0;
  const refresh = () => {
    calls++;
    return calls === 1 ? request.promise : Promise.resolve();
  };
  const releaseSlow = resource.retainPolling(refresh, 60_000);
  const releaseFast = resource.retainPolling(refresh, 5_000);
  t.after(releaseSlow);
  t.after(releaseFast);
  await advance(5_000);
  releaseFast();
  await advance(60_000);
  assert.equal(calls, 1);
  request.resolve();
  await flush();
  await advance(59_999);
  assert.equal(calls, 1);
  await advance(1);
  assert.equal(calls, 2);
});

test("unmounting and resubscribing during a request resumes only one chain", async (t) => {
  const advance = mockClock(t);
  const resource = createSettlementResource("a");
  const request = deferred();
  const calls = [0, 0];
  const releaseFirst = resource.retainPolling(() => {
    calls[0]++;
    return request.promise;
  }, 5_000);
  t.after(releaseFirst);
  await advance(5_000);
  releaseFirst();
  const releaseSecond = resource.retainPolling(() => {
    calls[1]++;
    return Promise.resolve();
  }, 5_000);
  t.after(releaseSecond);
  await advance(20_000);
  assert.deepEqual(calls, [1, 0]);
  request.resolve();
  await flush();
  await advance(4_999);
  assert.deepEqual(calls, [1, 0]);
  await advance(1);
  assert.deepEqual(calls, [1, 1]);
  await advance(5_000);
  assert.deepEqual(calls, [1, 2]);
  releaseSecond();
  await advance(60_000);
  assert.deepEqual(calls, [1, 2]);
});

test("a request completing after the last unsubscribe cannot restart polling", async (t) => {
  const advance = mockClock(t);
  const resource = createSettlementResource("a");
  const request = deferred();
  let calls = 0;
  const release = resource.retainPolling(() => {
    calls++;
    return request.promise;
  }, 5_000);
  t.after(release);
  await advance(5_000);
  release();
  request.resolve();
  await flush();
  await advance(60_000);
  assert.equal(calls, 1);
});

test("polling is isolated by account and cache even while another account has an in-flight request", async (t) => {
  const advance = mockClock(t);
  const cache = new Map();
  const resources = [
    getSettlementResource(cache, "a"),
    getSettlementResource(cache, "b"),
    getSettlementResource(new Map(), "a"),
  ];
  const request = deferred();
  const calls = [0, 0, 0];
  const releases = resources.map((resource, index) =>
    resource.retainPolling(() => {
      calls[index]++;
      return index === 0 ? request.promise : Promise.resolve();
    }, 5_000),
  );
  t.after(() => releases.forEach((release) => release()));
  await advance(5_000);
  assert.deepEqual(calls, [1, 1, 1]);
  await advance(5_000);
  assert.deepEqual(calls, [1, 2, 2]);
  releases[0]();
  request.resolve();
  await flush();
  await advance(5_000);
  assert.deepEqual(calls, [1, 3, 3]);
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
