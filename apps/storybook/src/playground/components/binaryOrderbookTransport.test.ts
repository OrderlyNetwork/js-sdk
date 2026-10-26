import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WS } from "@orderly.network/net/src/ws/ws";
import {
  EMPTY_BOOK,
  getOrderbookResource,
} from "@orderly.network/prediction/src/prediction/data/orderbookRegistry";

class Socket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: Socket[] = [];
  readyState = Socket.OPEN;
  onopen?: (event: unknown) => void;
  sent: { event: string; id?: string; topic?: string }[] = [];
  handlers = new Map<string, (event: { data: string }) => void>();
  constructor() {
    Socket.instances.push(this);
  }
  addEventListener(event: string, listener: (event: { data: string }) => void) {
    this.handlers.set(event, listener);
  }
  send(message: string) {
    this.sent.push(JSON.parse(message));
  }
  close() {
    this.readyState = Socket.CLOSED;
  }
  disconnect() {
    this.close();
    this.handlers.get("close")?.({ data: "" });
  }
  open() {
    this.readyState = Socket.OPEN;
    this.onopen?.({});
  }
  reply(id: string, ts: number) {
    this.handlers.get("message")?.({
      data: JSON.stringify({
        event: "request",
        id,
        ts,
        data: { symbol, ts, asks: [[0.6, 20]], bids: [[0.4, 20]] },
      }),
    });
  }
  requests() {
    return this.sent.filter((message) => message.event === "request");
  }
}
const symbol = "PERP_BTC5M2610091200_USDC";
let ws: WS;
let socket: Socket;
const releases: (() => void)[] = [];
beforeEach(() => {
  vi.useFakeTimers();
  Socket.instances = [];
  vi.stubGlobal("document", { visibilityState: "hidden" });
  vi.stubGlobal("WebSocket", Socket);
  ws = new WS({ publicUrl: "ws://test", privateUrl: "ws://test" });
  socket = Socket.instances[0];
});
afterEach(() => {
  releases.splice(0).forEach((release) => release());
  ws.close();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Binary orderbooks using SDK WS dispatch", () => {
  it("isolates same-symbol snapshot replies in different SWR caches", () => {
    const a = getOrderbookResource(new Map(), ws, symbol);
    const b = getOrderbookResource(new Map(), ws, symbol);
    releases.push(
      a.subscribe(() => {}),
      b.subscribe(() => {}),
    );
    const [first, second] = socket.requests();
    expect(first.id).not.toBe(second.id);
    socket.reply(second.id!, 20);
    expect(a.getSnapshot().isLoading).toBe(true);
    expect(b.getSnapshot().isLoading).toBe(false);
    socket.reply(first.id!, 10);
    expect(a.getSnapshot().isLoading).toBe(false);
    expect(b.getSnapshot().book.bids).toEqual([[0.4, 20]]);
  });
  it("ignores retired replies after remount and reset", () => {
    const resource = getOrderbookResource(new Map(), ws, symbol);
    const leave = resource.subscribe(() => {});
    const first = socket.requests()[0];
    leave();
    releases.push(resource.subscribe(() => {}));
    const second = socket.requests()[1];
    resource.reset();
    const third = socket.requests()[2];
    expect(new Set([first.id, second.id, third.id]).size).toBe(3);
    socket.reply(first.id!, 100);
    socket.reply(second.id!, 100);
    expect(resource.getSnapshot().book).toBe(EMPTY_BOOK);
    socket.reply(third.id!, 20);
    expect(resource.getSnapshot().isLoading).toBe(false);
  });
  it("shares snapshots within a cache and releases request handlers after replies and unmount", () => {
    const cache = new Map();
    const a = getOrderbookResource(cache, ws, symbol);
    const b = getOrderbookResource(cache, ws, symbol);
    const leaveA = a.subscribe(() => {});
    const leaveB = b.subscribe(() => {});
    releases.push(leaveA, leaveB);
    expect(socket.requests()).toHaveLength(1);
    socket.reply(socket.requests()[0].id!, 10);
    socket.disconnect();
    socket.open();
    // Only a fresh request is sent; the completed request is not replayed.
    expect(socket.requests()).toHaveLength(2);
    leaveA();
    leaveB();
    socket.disconnect();
    socket.open();
    expect(socket.requests()).toHaveLength(2);
  });
  it("cancels a queued SDK snapshot before the transport opens", () => {
    socket.readyState = 0;
    const callback = vi.fn();
    const dispose = ws.onceSubscribe(
      { event: "request", id: "queued" },
      { onMessage: callback },
    );
    dispose();
    socket.open();
    expect(socket.requests()).toHaveLength(0);
    socket.reply("queued", 10);
    expect(callback).not.toHaveBeenCalled();
  });
  it("reconnects without replaying an unfinished snapshot from the old connection", () => {
    const resource = getOrderbookResource(new Map(), ws, symbol);
    releases.push(resource.subscribe(() => {}));
    const first = socket.requests()[0];
    socket.disconnect();
    socket.open();
    expect(socket.requests()).toHaveLength(2);
    const second = socket.requests()[1];
    socket.reply(first.id!, 100);
    expect(resource.getSnapshot().book).toBe(EMPTY_BOOK);
    socket.reply(second.id!, 20);
    expect(resource.getSnapshot().isLoading).toBe(false);
  });
  it("preserves legacy reconnect replay until onceSubscribe is explicitly disposed", () => {
    const callback = vi.fn();
    const dispose = ws.onceSubscribe(
      { event: "request", id: "legacy" },
      { onMessage: callback },
    );
    socket.reply("legacy", 10);
    socket.disconnect();
    socket.open();
    socket.reply("legacy", 20);
    expect(callback).toHaveBeenCalledTimes(2);
    socket.disconnect();
    dispose();
    socket.open();
    expect(socket.requests()).toHaveLength(2);
    socket.reply("legacy", 30);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
