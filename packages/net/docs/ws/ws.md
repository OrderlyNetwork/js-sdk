# ws/ws.ts

## Overview

`WS` is an EventEmitter-based WebSocket client that manages public and optional private connections to Orderly streams. It handles reconnection, visibility/online checks, pending subscribe on reconnect, and authentication for the private channel. Message handlers (e.g. ping) are registered in `ws/handler` and invoked by event type.

## Exports

### `NetworkId`

- **Type**: `"testnet" | "mainnet"`

### `WSOptions`

| Property | Type | Required | Description |
| -------- | ---- | -------- | ----------- |
| `privateUrl` | `string` | Yes | Base URL for private WebSocket |
| `publicUrl` | `string` | No | Base URL for public WebSocket stream |
| `networkId` | `NetworkId` | No | Network identifier |
| `accountId` | `string` | No | Account ID for private stream; if set, private socket is created |
| `onSigntureRequest` | `(accountId: string) => Promise<any>` | No | Called to get auth payload (publicKey, signature, timestamp) for private channel |

### `unsubscribe`

- **Type**: `() => void` — function returned by `subscribe` / `privateSubscribe` to unsubscribe

### `WebSocketEvent`

Enum for connection status events emitted via `status:change`:

| Value | Description |
| ----- | ----------- |
| `OPEN` | Connection opened |
| `CLOSE` | Connection closed |
| `ERROR` | Error occurred |
| `MESSAGE` | Message received (also routed to topic callbacks) |
| `CONNECTING` | Connecting |
| `RECONNECTING` | Reconnecting after close/error |

### `MessageParams`

| Property | Type | Description |
| -------- | ---- | ----------- |
| `event` | `string` | Event name (e.g. subscribe) |
| `topic` | `string` | Topic identifier |
| `onMessage` | `(message: any) => any` | Optional callback for messages |
| `params` | `any` | Optional extra params |

### Class `WS`

Extends `EventEmitter`. Manages public and optional private WebSocket connections.

#### Constructor

- **Signature**: `new WS(options: WSOptions)`
- Creates public socket if `publicUrl` is set; creates private socket if `accountId` is set and binds visibility/online listeners.

#### Public methods

| Method | Signature | Description |
| ------ | --------- | ----------- |
| `openPrivate` | `(accountId: string) => void` | Opens private channel for given account (no-op if already open) |
| `closePrivate` | `(code?: number, reason?: string) => void` | Closes private channel and clears pending/handlers |
| `send` | `(message: any) => void` | Sends message on public socket (JSON stringified if object) |
| `close` | `() => void` | Closes both public and private sockets |
| `subscribe` | `(params, callback, once?, id?) => unsubscribe \| undefined` | Subscribes to public topic; returns unsubscribe or undefined if socket not ready |
| `onceSubscribe` | `(params, callback) => void` | One-time subscribe on public channel |
| `client` (getter) | `{ public: WebSocket; private?: WebSocket }` | Current socket instances |

#### Events

- **`status:change`**: Payload includes `type` (WebSocketEvent), `isPrivate`, optional `isReconnect`, `count`, `event` (CloseEvent), etc.

#### Private channel

- Private socket URL: `{privateUrl}/v2/ws/private/stream/{accountId}`. Authentication is done via `onSigntureRequest` and `event: "auth"` message. Pending subscriptions are replayed after auth success. Reconnection and heartbeat timeout (2 minutes) apply.

## Usage example

```typescript
import { WS, WebSocketEvent } from "@orderly.network/net";

const ws = new WS({
  privateUrl: "wss://private.example.com",
  publicUrl: "wss://public.example.com",
  accountId: "account-id",
  onSigntureRequest: async (accountId) => ({
    publicKey: "...",
    signature: "...",
    timestamp: Date.now(),
  }),
});

ws.on("status:change", (e) => {
  if (e.type === WebSocketEvent.OPEN) console.log("open", e.isPrivate);
});

const unsub = ws.subscribe(
  { event: "subscribe", topic: "ticker" },
  {
    onMessage: (data) => console.log(data),
    onUnsubscribe: (topic) => ({ event: "unsubscribe", topic }),
  }
);
// later: unsub();
```
