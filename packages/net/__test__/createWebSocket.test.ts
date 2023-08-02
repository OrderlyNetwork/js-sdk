import WS from "../src/ws";

describe("createWebSocket", () => {
  let ws;

  beforeAll(() => {
    ws = new WS({ url: "ws://localhost:8080" });
  });

  test("should create a websocket", () => {});
});
