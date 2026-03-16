# types/ws.ts

## Overview

Defines types and interfaces for WebSocket message observation (subscribe/unsubscribe), sending messages, and pluggable message handlers.

## Exports

### `MessageObserveTopic`

Topic payload for subscribe/unsubscribe.

| Property | Type | Description |
| -------- | ---- | ----------- |
| `event` | `"subscribe" \| "unsubscribe"` | Action type |
| `topic` | `string` | Topic identifier |

### `MessageObserveParams`

Either a topic string or a full observe payload.

- **Type**: `string \| MessageObserveTopic`

### `SendFunc`

Function type for sending a message over the WebSocket.

- **Type**: `(message: any) => void`

### `MessageHandler`

Interface for custom message handlers (used by the handler registry).

| Property | Type | Description |
| -------- | ---- | ----------- |
| `handle` | `(message: any, webSocket: WebSocket) => void` | Process a message and optionally use the socket |

## Usage example

```typescript
import type { MessageHandler, MessageObserveTopic } from "@orderly.network/net";

const topic: MessageObserveTopic = { event: "subscribe", topic: "ticker" };

const handler: MessageHandler = {
  handle(message: any, webSocket: WebSocket) {
    console.log(message);
  },
};
```
