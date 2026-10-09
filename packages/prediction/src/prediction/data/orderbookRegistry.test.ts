import assert from "node:assert/strict";
import { test } from "node:test";
import { EMPTY_BOOK, getOrderbookResource } from "./orderbookRegistry";

function socket() {
  const snapshots: ((message: any) => void)[] = [];
  const updates: ((message: any) => void)[] = [];
  let subscriptions = 0,
    releases = 0;
  return {
    snapshots,
    updates,
    get subscriptions() {
      return subscriptions;
    },
    get releases() {
      return releases;
    },
    subscribe: (_input: unknown, options: any) => {
      subscriptions++;
      updates.push(options.onMessage);
      return () => {
        releases++;
      };
    },
    onceSubscribe: (_input: unknown, options: any) => {
      snapshots.push(options.onMessage);
      return () => {};
    },
  };
}
const symbol = "PERP_BTC5M2610091200_USDC";
const payload = (ts = 10) => ({
  data: { symbol, ts, asks: [[0.6, 20]], bids: [[0.4, 30]] },
  ts,
});

test("one snapshot/delta chain is shared by consumers and released by the last", () => {
  const ws = socket(),
    cache = new Map();
  const a = getOrderbookResource(cache, ws, symbol),
    b = getOrderbookResource(cache, ws, symbol);
  assert.equal(a, b);
  const releaseA = a.subscribe(() => {}),
    releaseB = b.subscribe(() => {});
  assert.equal(ws.subscriptions, 1);
  assert.equal(ws.snapshots.length, 1);
  ws.snapshots[0](payload());
  assert.deepEqual(a.getSnapshot().book.downAsks, [[0.6, 30]]);
  assert.deepEqual(a.getSnapshot().book.downBids, [[0.4, 20]]);
  releaseA();
  assert.equal(ws.releases, 0);
  releaseB();
  assert.equal(ws.releases, 1);
  assert.equal(a.getSnapshot().book, EMPTY_BOOK);
});

test("symbols, sockets and SWR cache instances isolate subscriptions", () => {
  const ws = socket(),
    cache = new Map();
  const a = getOrderbookResource(cache, ws, symbol);
  assert.notEqual(a, getOrderbookResource(cache, ws, "other"));
  assert.notEqual(a, getOrderbookResource(cache, socket(), symbol));
  assert.notEqual(a, getOrderbookResource(new Map(), ws, symbol));
});

test("remount starts fresh and ignores a late snapshot from a disposed generation", () => {
  const ws = socket(),
    r = getOrderbookResource(new Map(), ws, symbol);
  const leave = r.subscribe(() => {});
  leave();
  const leaveAgain = r.subscribe(() => {});
  ws.snapshots[0](payload());
  assert.equal(r.getSnapshot().isLoading, true);
  ws.snapshots[1](payload(20));
  assert.equal(r.getSnapshot().isLoading, false);
  assert.equal(ws.subscriptions, 2);
  leaveAgain();
});

test("deltas before the first snapshot and wrong-symbol messages cannot seed a book", () => {
  const ws = socket(),
    r = getOrderbookResource(new Map(), ws, symbol),
    leave = r.subscribe(() => {});
  ws.updates[0]({ data: { prevTs: 1, asks: [[0.7, 1]] }, ts: 2 });
  ws.snapshots[0]({ data: { ...payload().data, symbol: "other" }, ts: 10 });
  assert.equal(r.getSnapshot().book, EMPTY_BOOK);
  ws.snapshots[0](payload());
  assert.equal(r.getSnapshot().book.asks[0][0], 0.6);
  leave();
});

test("stale deltas are ignored; a gap clears executable quotes and requests resynchronization", () => {
  const ws = socket(),
    r = getOrderbookResource(new Map(), ws, symbol),
    leave = r.subscribe(() => {});
  ws.snapshots[0](payload());
  ws.updates[0]({
    data: {
      prevTs: 10,
      asks: [
        [0.6, 0],
        [0.65, 9],
      ],
    },
    ts: 11,
  });
  assert.deepEqual(r.getSnapshot().book.asks, [[0.65, 9]]);
  ws.updates[0]({ data: { prevTs: 9, asks: [[0.7, 1]] }, ts: 10 });
  assert.deepEqual(r.getSnapshot().book.asks, [[0.65, 9]]);
  ws.updates[0]({ data: { prevTs: 12, bids: [[0.5, 1]] }, ts: 13 });
  assert.equal(r.getSnapshot().isLoading, true);
  assert.equal(r.getSnapshot().book, EMPTY_BOOK);
  assert.equal(ws.snapshots.length, 2);
  ws.updates[0]({ data: { prevTs: 11, asks: [[0.7, 1]] }, ts: 12 });
  ws.snapshots[0](payload(20));
  assert.equal(r.getSnapshot().book, EMPTY_BOOK);
  ws.snapshots[1](payload(9));
  assert.equal(r.getSnapshot().isLoading, true);
  ws.snapshots[1](payload(13));
  assert.equal(r.getSnapshot().isLoading, false);
  leave();
});

test("public disconnect clears quotes, reconnect ignores old snapshots and releases status listeners", () => {
  const ws = socket();
  let status:
    | ((event: { type: string; isPrivate?: boolean }) => void)
    | undefined;
  let removed = 0;
  const transport = {
    ...ws,
    on: (_event: string, listener: typeof status) => {
      status = listener;
    },
    off: (_event: string, listener: typeof status) => {
      assert.equal(listener, status);
      removed++;
    },
  };
  const resource = getOrderbookResource(new Map(), transport, symbol);
  const leave = resource.subscribe(() => {});
  ws.snapshots[0](payload());
  status?.({ type: "close", isPrivate: true });
  assert.equal(resource.getSnapshot().isLoading, false);
  status?.({ type: "close" });
  assert.equal(resource.getSnapshot().book, EMPTY_BOOK);
  status?.({ type: "open" });
  ws.snapshots[0](payload(30));
  assert.equal(resource.getSnapshot().book, EMPTY_BOOK);
  ws.snapshots[1](payload(20));
  assert.equal(resource.getSnapshot().isLoading, false);
  leave();
  assert.equal(removed, 1);
});
