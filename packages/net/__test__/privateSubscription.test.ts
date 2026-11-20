import { WS } from "../src/ws/ws";

class MockSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = 0;
  url: string;
  onopen?: (event: Event) => void;
  onmessage?: (event: MessageEvent) => void;
  onclose?: (event: CloseEvent) => void;
  onerror?: (event: Event) => void;
  listeners = new Map<string, (event: unknown) => void>();

  constructor(url: string) {
    this.url = url;
  }

  send = jest.fn((_message: string) => {
    if (this.readyState !== MockSocket.OPEN)
      throw new Error("Socket is closed");
  });

  addEventListener(event: string, callback: (event: unknown) => void) {
    this.listeners.set(event, callback);
  }

  open() {
    this.readyState = MockSocket.OPEN;
    this.onopen?.({} as Event);
  }

  close() {
    this.readyState = MockSocket.CLOSED;
  }

  receive(message: any) {
    const data = JSON.stringify(message);
    this.onmessage?.({ data } as MessageEvent);
    this.listeners.get("message")?.({ data });
  }
}

const originalWebSocket = globalThis.WebSocket;
let sockets: MockSocket[] = [];

beforeEach(() => {
  sockets = [];
  globalThis.WebSocket = class extends MockSocket {
    constructor(url: string) {
      super(url);
      sockets.push(this);
    }
  } as unknown as typeof WebSocket;
});

afterEach(() => {
  globalThis.WebSocket = originalWebSocket;
});

const createTestWS = () =>
  new WS({
    publicUrl: "wss://public.test",
    privateUrl: "wss://private.test",
    accountId: "acc_1",
    onSigntureRequest: jest.fn().mockResolvedValue({
      publicKey: "key",
      signature: "sig",
      timestamp: 12345,
    }),
  });

describe("WS private subscriptions", () => {
  it("unsubscribes a single consumer and leaves other active consumers subscribed", async () => {
    const ws = createTestWS();
    const privateSocket = sockets.find((s) => s.url.includes("private"));
    expect(privateSocket).toBeDefined();
    privateSocket!.open();

    privateSocket!.receive({ event: "auth", success: true });

    const first = jest.fn();
    const second = jest.fn();

    const cancelFirst = ws.privateSubscribe("executionreport", {
      onMessage: first,
    });
    const cancelSecond = ws.privateSubscribe("executionreport", {
      onMessage: second,
    });

    expect(privateSocket!.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "subscribe", topic: "executionreport" }),
    );

    privateSocket!.receive({
      topic: "executionreport",
      data: { order_id: 101, status: "FILLED" },
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    // First unsubscribes
    cancelFirst?.();

    // Next message should ONLY be received by second
    privateSocket!.receive({
      topic: "executionreport",
      data: { order_id: 102, status: "FILLED" },
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);

    // Second unsubscribes; now socket should send unsubscribe message
    cancelSecond?.();
    expect(privateSocket!.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "unsubscribe", topic: "executionreport" }),
    );

    privateSocket!.receive({
      topic: "executionreport",
      data: { order_id: 103, status: "FILLED" },
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
  });

  it("cleans up pending private subscriptions when canceled before socket connects", () => {
    const ws = createTestWS();
    const privateSocket = sockets.find((s) => s.url.includes("private"));
    expect(privateSocket).toBeDefined();

    const onMessage = jest.fn();
    const cancel = ws.privateSubscribe("balance", { onMessage });

    // Cancel while still in pending state
    cancel?.();

    // Socket connects and authenticates
    privateSocket!.open();
    privateSocket!.receive({ event: "auth", success: true });

    // Canceled subscription should not have been sent
    expect(privateSocket!.send).not.toHaveBeenCalledWith(
      JSON.stringify({ event: "subscribe", topic: "balance" }),
    );

    privateSocket!.receive({
      topic: "balance",
      data: { holding: 100 },
    });
    expect(onMessage).not.toHaveBeenCalled();
  });

  it("handles event-based topics with an id correctly when unsubscribing", () => {
    const ws = createTestWS();
    const publicSocket = sockets.find((s) => !s.url.includes("private"));
    expect(publicSocket).toBeDefined();
    publicSocket!.open();

    const onMessage = jest.fn();
    const cancel = ws.subscribe(
      { event: "request", id: "req_99" },
      {
        onMessage,
        onUnsubscribe: () => ({ event: "unsub_req", id: "req_99" }),
      },
    );

    expect(publicSocket!.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "request", id: "req_99" }),
    );

    cancel?.();

    expect(publicSocket!.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "unsub_req", id: "req_99" }),
    );
  });

  it("does not throw when unsubscribing while socket is closed", () => {
    const ws = createTestWS();
    const privateSocket = sockets.find((s) => s.url.includes("private"));
    expect(privateSocket).toBeDefined();
    privateSocket!.open();
    privateSocket!.receive({ event: "auth", success: true });

    const cancel = ws.privateSubscribe("position", { onMessage: jest.fn() });
    privateSocket!.close();

    expect(() => cancel?.()).not.toThrow();
  });
});
