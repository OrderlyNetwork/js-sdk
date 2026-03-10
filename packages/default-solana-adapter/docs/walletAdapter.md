# walletAdapter

## Overview

Implements the Solana wallet adapter for Orderly: `DefaultSolanaWalletAdapter` extends `BaseWalletAdapter<SolanaAdapterOption>` with `ChainNamespace.solana`. Handles lifecycle (active/deactivate/update), message signing (standard and Ledger via memo instruction), generation of register/add key/withdraw/internal transfer/settle/DEX request messages, balance/call/sendTransaction (including vault deposit), and deposit fee via `callOnChain`.

## Exports

### Class: DefaultSolanaWalletAdapter

Extends `BaseWalletAdapter<SolanaAdapterOption>` from `@orderly.network/core`.

#### Properties

| Name | Type | Description |
| ---- | ---- | ----------- |
| `chainNamespace` | `ChainNamespace` | `ChainNamespace.solana` |
| `address` | `string` | Current wallet address (getter) |
| `chainId` | `number` | Current chain id (getter/setter) |
| `connection` | `Connection` | Solana connection (from provider.rpcUrl, clusterApiUrl, or API proxy with orderly key signing) |

#### Lifecycle

| Method | Parameters | Description |
| ------ | ---------- | ----------- |
| `active` | `(config: SolanaAdapterOption)` | Sets address, chainId, provider from config |
| `deactivate` | `()` | No-op (logs lifecycle) |
| `update` | `(config: SolanaAdapterOption)` | Same as setConfig + lifecycle log |

#### Key & signing

| Method | Parameters | Returns | Description |
| ------ | ---------- | ------- | ----------- |
| `generateSecretKey` | `()` | `string` | New Ed25519 secret key (bs58, 44 chars) |
| `uint8ArrayToHexString` | `(uint8Array: Uint8Array)` | `string` | Hex string of bytes |
| `signMessage` | `(message: Uint8Array)` | `Promise<string>` | Signs with provider or Ledger (memo-based); returns "0x" + hex |

#### Message generation (Orderly)

Each returns a `Message` (and where applicable `domain`) with `chainType: "SOL"` and `signatured` from `signMessage`.

| Method | Inputs | Returns |
| ------ | ------ | ------- |
| `generateRegisterAccountMessage` | `RegisterAccountInputs` | `Promise<Message>` |
| `generateAddOrderlyKeyMessage` | `AddOrderlyKeyInputs` | `Promise<Message>` |
| `generateWithdrawMessage` | `WithdrawInputs` | `Promise<Message & { domain }>` |
| `generateInternalTransferMessage` | `InternalTransferInputs` | `Promise<Message & { domain }>` |
| `generateSettleMessage` | `SettleInputs` | `Promise<Message & { domain }>` |
| `generateDexRequestMessage` | `DexRequestInputs` | `Promise<Message & { domain }>` |

#### Chain interaction

| Method | Description |
| ------ | ----------- |
| `getBalance` | Returns SOL balance (lamports) as bigint |
| `call` | Supports `balanceOf` (SPL token balance) and `allowance` (MaxUint256); else 0n |
| `sendTransaction` | For method `"deposit"`, calls `deposit()` with vault address, user, connection, depositData, and provider.sendTransaction |
| `callOnChain` | For method `"getDepositFee"`, returns `getDepositQuoteFee(...)`; else 0 |
| `pollTransactionReceiptWithBackoff` | Returns `Promise.resolve({ status: 1 })` (no-op) |

## Usage Example

```ts
import { DefaultSolanaWalletAdapter } from "@orderly.network/default-solana-adapter";
import type { SolanaWalletProvider } from "@orderly.network/default-solana-adapter";

const adapter = new DefaultSolanaWalletAdapter();
adapter.active({
  provider: walletProvider as SolanaWalletProvider,
  address: publicKey.toBase58(),
  chain: { id: 101 },
});

const msg = await adapter.generateRegisterAccountMessage({
  brokerId: "broker",
  registrationNonce: 1n,
  timestamp: Date.now(),
});
```
