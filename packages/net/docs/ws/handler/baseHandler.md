# ws/handler/baseHandler.ts

## Overview

Abstract base class implementing `MessageHandler`. Default `handle` throws; subclasses override it to process specific event types.

## Exports

### `BaseHandler` (default export)

Class implementing `MessageHandler`.

| Method | Signature | Description |
| ------ | --------- | ----------- |
| `handle` | `(message: any, webSocket: WebSocket) => void` | Default implementation throws "Method not implemented."; override in subclasses |

## Usage example

```typescript
import BaseHandler from "./baseHandler";

class MyHandler extends BaseHandler {
  handle(message: any, webSocket: WebSocket) {
    // handle message
  }
}
```
