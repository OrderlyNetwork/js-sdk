# walletConnector

> Location: `packages/core/src/walletConnector.ts`

## Overview

Minimal connector interface and stub implementations for wallet connection flow.

## Exports

### WalletConnector (interface)

- **connect(): Promise\<void\>**

### BaseConnector (class)

Implements `WalletConnector`; `connect()` resolves immediately.

### Blocknative (class)

Implements `WalletConnector`; `connect()` resolves immediately.

## Usage Example

```ts
const connector = new BaseConnector();
await connector.connect();
```
