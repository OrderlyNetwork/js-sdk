# etherAdapter

> Location: `packages/core/src/wallet/etherAdapter.ts`

## Overview

EVM wallet adapter using ethers.js `BrowserProvider`: implements legacy `IWalletAdapter` (call, sendTransaction, getBalance, signTypedData, pollTransactionReceiptWithBackoff, callOnChain). Used for EVM chains with provider + address + chainId.

## Exports

### EtherAdapterOptions (type)

`{ provider: any; wallet?: { name?: string }; chain: { id: number } }`.

### EtherAdapter (class)

Implements `IWalletAdapter`. Constructor: `(options: WalletAdapterOptions)` (address, chain.id, provider). Uses `BrowserProvider` and ethers Contract for call/sendTransaction. Decodes errors with ethers-decode-error.

- **call**, **callOnChain** – Contract method call; parseError on failure.
- **sendTransaction** – encodeFunctionData + signer.sendTransaction.
- **getBalance(userAddress)**, **parseUnits**, **formatUnits**.
- **signTypedData(address, data)** – eth_signTypedData_v4.
- **pollTransactionReceiptWithBackoff(txHash, baseInterval?, maxInterval?, maxRetries?)**.
- **get chainId / set chainId**, **get addresses**.
- **on**, **off** – Provider event pass-through.
- **getContract(address, abi)** – Returns ethers Contract.

## Usage Example

```ts
import { EtherAdapter } from "@orderly.network/core";
const adapter = new EtherAdapter({
  provider: window.ethereum,
  address: "0x...",
  chain: { id: 421614 },
});
const balance = await adapter.getBalance("0x...");
```
