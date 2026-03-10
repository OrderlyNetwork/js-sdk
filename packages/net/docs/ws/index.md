# ws

## Overview

WebSocket client for Orderly public and private streams: reconnection, visibility/network checks, subscribe/unsubscribe, and pluggable message handlers (e.g. ping/pong).

## Files

| File | Description |
| ---- | ----------- |
| [ws.md](./ws.md) | `WS` class, `WSOptions`, `WebSocketEvent`, `MessageParams`, `unsubscribe` type |
| [handler/index.md](./handler/index.md) | Handler registry and handler implementations (ping, base) |

## Exports (from ws/ws.ts)

- **WS**: Main WebSocket client class (extends EventEmitter)
- **WebSocketEvent**: Enum for connection events (OPEN, CLOSE, ERROR, MESSAGE, CONNECTING, RECONNECTING)
- **WSOptions**, **MessageParams**, **unsubscribe** (type)
