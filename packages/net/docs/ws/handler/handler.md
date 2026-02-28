# ws/handler/handler.ts

## Overview

Defines the set of known WebSocket message event types and the default handler registry used by `WS` to dispatch incoming messages (e.g. server ping → pong response).

## Exports

### `MessageType`

Union type of event names:

- `"ping"` \| `"pong"` \| `"subscribe"` \| `"unsubscribe"` \| `"authenticate"` \| `"message"` \| `"error"` \| `"auth"` \| `"close"`

### `messageHandlers`

- **Type**: `Map<MessageType, MessageHandler>`
- **Entries**: `["ping", new PingHandler()]` — other events can be added by registering handlers that implement `MessageHandler`.

When `WS` receives a message, it looks up `messageHandlers.get(message.event)` and, if present, calls `handler.handle(message, socket)`.

## Usage example

```typescript
import { messageHandlers } from "./handler";
import type { MessageHandler } from "../../types/ws";

// Custom handler (conceptually)
const myHandler: MessageHandler = {
  handle(message: any, webSocket: WebSocket) {
    // ...
  },
};
// messageHandlers.set("custom", myHandler);
```
