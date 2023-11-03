class WS {
  socket: WebSocket;
  // Create WebSocket connection.
  constructor(url: string) {
    this.socket = new WebSocket("ws://localhost:8080");
  }

  private bindEvent() {
    this.socket.addEventListener("open", function (event) {
      console.log("[socket] opened");
    });

    // Listen for messages
    this.socket.addEventListener("message", function (event) {
      console.log("Message from server ", event.data);
    });
    this.socket.addEventListener("error", function (event) {
      console.log("WebSocket error: ", event);
    });
  }

  // Connection opened
}
