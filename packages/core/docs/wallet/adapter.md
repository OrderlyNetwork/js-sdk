# adapter (legacy)

> Location: `packages/core/src/wallet/adapter.ts`

## Overview

Legacy wallet adapter shape: `IWalletAdapter` (chainId, addresses, call, sendTransaction, signTypedData, getBalance, etc.) and options type. Re-exported from wallet index as `WalletAdapter`; the main Account flow uses the `WalletAdapter` from `walletAdapter.ts` (ChainNamespace-based) instead.

## Exports

### IWalletAdapter (interface)

Getters: `chainId`, `addresses`. Setter: `chainId`. Methods: parseUnits, formatUnits, send, sendTransaction, getTransactionRecipect, signTypedData, pollTransactionReceiptWithBackoff, getBalance, call, callOnChain, on, off.

### WalletAdapterOptions (type)

`{ provider: any; address: string; chain: { id: number } }`.

### getWalletAdapterFunc (type)

`(options: WalletAdapterOptions) => IWalletAdapter`.

## Usage Example

```ts
// Typically used by EtherAdapter and wallet index.
const adapter = new EtherAdapter({ provider, address: "0x...", chain: { id: 421614 } });
```
