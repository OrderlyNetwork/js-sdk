# walletAdapterManager

> Location: `packages/core/src/walletAdapterManager.ts`

## Overview

Holds a list of wallet adapters (e.g. EVM and Solana) and switches the active adapter by chain namespace. Used by `Account` to set the current wallet after `setAddress`.

## Exports

### WalletAdapterManager (class)

Constructor: `(walletAdapters: WalletAdapter[])`. Throws if array is empty.

#### Methods

- **switchWallet(chainNamespace, address, chainId, options)** – Selects adapter matching `chainNamespace` (e.g. EVM/SOL). If same adapter, calls `update(config)`; otherwise deactivates previous, sets new, and calls `active(config)`. Config: `{ address, chain: { id }, provider, contractManager }`.

#### Getters

- **adapter** – Current `WalletAdapter` or undefined.
- **isEmpty** – True if no adapters were passed.
- **isAdapterExist** – True if current adapter is set.
- **chainId** – chainId from current adapter (optional).

## Usage Example

```ts
import { WalletAdapterManager } from "@orderly.network/core";
const manager = new WalletAdapterManager([evmAdapter, solanaAdapter]);
manager.switchWallet(ChainNamespace.EVM, "0x...", 421614, {
  provider: provider,
  contractManager: contract,
});
const adapter = manager.adapter;
```
