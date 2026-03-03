# web3Provider.interface

## Overview

Defines the EIP-1193–style provider type and the Web3 provider interface used by `DefaultEVMWalletAdapter` for parsing units, signing typed data, sending RPC and transactions, and polling transaction receipts.

## Exports

### Type: `Eip1193Provider`

Minimal provider compatible with EIP-1193 (e.g. MetaMask).

| Property | Type | Description |
| -------- | ---- | ----------- |
| `request` | `(args: { method: string; params?: any[] }) => Promise<any>` | Generic RPC request. |

### Interface: `Web3Provider`

Full interface expected by the default EVM adapter.

#### Setter

| Property     | Type                | Description |
| ------------ | ------------------- | ----------- |
| `provider`   | `Eip1193Provider`   | Set the underlying EIP-1193 provider. |

#### Methods

| Method | Parameters | Returns | Description |
| ------ | ---------- | ------- | ----------- |
| `parseUnits` | `amount: string`, `decimals: number` | `string` | Parse human-readable amount to units. |
| `formatUnits` | `amount: string`, `decimals: number` | `string` | Format units to human-readable. |
| `signTypedData` | `address: string`, `toSignatureMessage: any` | `Promise<string>` | EIP-712 sign typed data. |
| `send` | `method: string`, `params: Array<any> \| Record<string, any>` | `Promise<any>` | Generic RPC send. |
| `call` | `address`, `method`, `params`, `options?` (abi) | `Promise<any>` | Contract read. |
| `sendTransaction` | `contractAddress`, `method`, `payload` (from, to?, data, value?), `options` (abi) | `Promise<any>` | Send contract transaction. |
| `callOnChain` | `chain: API.NetworkInfos`, `address`, `method`, `params`, `options` (abi) | `Promise<any>` | Contract read on another chain. |
| `getBalance` | `userAddress: string` | `Promise<bigint>` | Native balance. |
| `pollTransactionReceiptWithBackoff` | `txHash`, `baseInterval?`, `maxInterval?`, `maxRetries?` | `Promise<any>` | Poll receipt with backoff. |

## Dependencies

- `@orderly.network/types`: `API.NetworkInfos`

## Usage Example

```ts
import type { Web3Provider, Eip1193Provider } from "@orderly.network/default-evm-adapter";

const eip1193: Eip1193Provider = window.ethereum;
// Implement or use a class that satisfies Web3Provider
const web3: Web3Provider = new MyWeb3Provider(eip1193);
const sig = await web3.signTypedData(address, toSignatureMessage);
const balance = await web3.getBalance(address);
```
