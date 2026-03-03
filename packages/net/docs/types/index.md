# types

## Overview

WebSocket-related type definitions used by the WS client and message handlers (subscribe/unsubscribe, send function, message handler interface).

## Files

| File | Description |
| ---- | ----------- |
| [ws.md](./ws.md) | `MessageObserveTopic`, `MessageObserveParams`, `SendFunc`, `MessageHandler` |

## Exports (from types/ws.ts)

- **MessageObserveTopic**: subscribe/unsubscribe topic payload
- **MessageObserveParams**: string or MessageObserveTopic
- **SendFunc**: function type for sending messages
- **MessageHandler**: interface for handling WS messages
