import { WS } from "../src/ws/ws";

class Socket {
  static OPEN = 1;
  readyState = 0;
  onopen?: (event: Event) => void;
  listeners = new Map<string, (event: unknown) => void>();
  send = jest.fn((_message: string) => {
    if (this.readyState !== Socket.OPEN) throw new Error("Socket is closed");
  });
  addEventListener(event: string, callback: (event: unknown) => void) {
    this.listeners.set(event, callback);
  }
  open() {
    this.readyState = Socket.OPEN;
    this.onopen?.({} as Event);
  }
  receive(
    topic: string,
    data: { announcement_id: number; slug?: string } = { announcement_id: 1 },
  ) {
    this.listeners.get("message")?.({
      data: JSON.stringify({ topic, data }),
    });
  }
}

const originalWebSocket = globalThis.WebSocket;
let socket: Socket;
beforeEach(() => {
  jest.useFakeTimers();
  globalThis.WebSocket = class extends Socket {
    constructor() {
      super();
      socket = this;
    }
  } as unknown as typeof WebSocket;
});
afterEach(() => {
  globalThis.WebSocket = originalWebSocket;
  jest.clearAllTimers();
  jest.useRealTimers();
});
const client = () =>
  new WS({ publicUrl: "wss://example.test", privateUrl: "" });

describe("announcement topic subscriptions", () => {
  it.each(["orderly_official$announcement", "broker_a$announcement"])(
    "preserves slug metadata for %s and still accepts legacy payloads",
    (topic) => {
      const ws = client();
      socket.open();
      const onMessage = jest.fn();
      ws.subscribe(topic, { onMessage });
      socket.receive(topic, { announcement_id: 55, slug: "release-notes" });
      expect(onMessage).toHaveBeenLastCalledWith({
        announcement_id: 55,
        slug: "release-notes",
      });
      socket.receive(topic);
      expect(onMessage).toHaveBeenLastCalledWith({ announcement_id: 1 });
    },
  );
  it.each(["orderly_official$announcement", "broker_a$announcement"])(
    "delivers only messages for the subscribed topic %s",
    (topic) => {
      const ws = client();
      socket.open();
      const onMessage = jest.fn();
      ws.subscribe(topic, { onMessage });
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({ event: "subscribe", topic }),
      );

      socket.receive("announcement");
      socket.receive("broker_b$announcement");
      socket.receive(
        topic === "orderly_official$announcement"
          ? "broker_a$announcement"
          : "orderly_official$announcement",
      );
      expect(onMessage).not.toHaveBeenCalled();

      socket.receive(topic);
      expect(onMessage).toHaveBeenCalledTimes(1);
      expect(onMessage).toHaveBeenCalledWith({ announcement_id: 1 });
    },
  );

  it("unsubscribes an active announcement topic while the socket is open", () => {
    const ws = client();
    socket.open();
    const onMessage = jest.fn();
    const cancel = ws.subscribe("broker_a$announcement", { onMessage });

    cancel?.();

    expect(socket.send).toHaveBeenLastCalledWith(
      JSON.stringify({ event: "unsubscribe", topic: "broker_a$announcement" }),
    );
    socket.receive("broker_a$announcement");
    expect(onMessage).not.toHaveBeenCalled();
  });

  it("keeps a shared topic subscribed until its last active consumer leaves", () => {
    const ws = client();
    socket.open();
    const first = jest.fn();
    const second = jest.fn();
    const cancel = ws.subscribe("orderly_official$announcement", {
      onMessage: first,
    });
    const cancelSecond = ws.subscribe("orderly_official$announcement", {
      onMessage: second,
    });
    expect(socket.send).toHaveBeenCalledTimes(1);

    cancel?.();
    socket.receive("orderly_official$announcement");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(socket.send).toHaveBeenCalledTimes(1);

    cancelSecond?.();
    expect(socket.send).toHaveBeenCalledTimes(2);
    expect(socket.send).toHaveBeenLastCalledWith(
      JSON.stringify({
        event: "unsubscribe",
        topic: "orderly_official$announcement",
      }),
    );
    socket.receive("orderly_official$announcement");
    expect(second).toHaveBeenCalledTimes(1);
  });
});
