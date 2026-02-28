# _wallet

> Location: `packages/core/src/_wallet.ts`

## Overview

Legacy wallet client abstraction: `WalletClient` interface and `BaseWalletClient` / `SimpleWallet` with stub implementations. Pre-dates the wallet adapter layer in `wallet/`.

## Exports

### WalletClient (interface)

| Member | Type | Description |
| ------ | ---- | ----------- |
| address | string (getter) | Wallet address. |
| getBalance | () => Promise\<any\> | Balance. |
| deposit | () => Promise\<any\> | Deposit. |
| connect | () => Promise\<any\> | Connect. |

### BaseWalletClient (abstract class)

Constructor: `(address: string)`. Implements `address` getter; abstract getBalance, deposit, connect.

### SimpleWallet (class)

Extends `BaseWalletClient`. All methods throw "Method not implemented."

## Usage Example

```ts
// Legacy; prefer wallet adapters from wallet/.
const client = new SimpleWallet("0x...");
```
