# ws/handler

## Overview

Message handler registry and default handlers for WebSocket events. The registry is keyed by `MessageType` (e.g. `"ping"`, `"pong"`, `"subscribe"`). Handlers implement `MessageHandler` and are invoked by `WS` when a message with matching `event` is received.

## Files

| File | Description |
| ---- | ----------- |
| [handler.md](./handler.md) | `messageHandlers` Map and `MessageType` |
| [baseHandler.md](./baseHandler.md) | `BaseHandler` abstract base class |
| [ping.md](./ping.md) | `PingHandler` — responds with `pong` |

## Exports (from handler.ts)

- **MessageType**: Union of event names (`"ping"` \| `"pong"` \| `"subscribe"` \| …)
- **messageHandlers**: `Map<MessageType, MessageHandler>` — currently registers `PingHandler` for `"ping"`
