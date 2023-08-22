import WebSocket from "../src/ws";

describe("createWebSocket", () => {
  let ws;

  beforeAll(() => {
    ws = new WebSocket({ url: "ws://localhost:8080" });
  });

  test("should create a websocket", () => {});
});
