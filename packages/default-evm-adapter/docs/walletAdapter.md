# walletAdapter

## Overview

Implements the default EVM wallet adapter: extends `BaseWalletAdapter` from `@orderly.network/core`, uses a `Web3Provider` for EIP-712 signing and RPC (balance, call, sendTransaction, poll receipt). Handles lifecycle (active / deactivate / update), key generation, and all Orderly message types (registration, add key, withdraw, internal transfer, settle, DEX request).

## Class: `DefaultEVMWalletAdapter`

Extends `BaseWalletAdapter<EVMAdapterOptions>`.

### Constructor

| Parameter        | Type            | Description |
| ---------------- | --------------- | ----------- |
| `web3Provider`   | `Web3Provider`  | Provider used for signing and chain calls. |

### Properties

| Name             | Type              | Description |
| ---------------- | ----------------- | ----------- |
| `chainNamespace` | `ChainNamespace`  | Set to `ChainNamespace.evm`. |
| `address`        | `string` (getter) | Current wallet address. |
| `chainId`        | `number` (get/set)| Current chain id. |

### Lifecycle

| Method           | Parameters              | Description |
| ---------------- | ----------------------- | ----------- |
| `active`         | `config: EVMAdapterOptions` | Apply config (address, chainId, provider, contractManager) and mark active. |
| `deactivate`     | —                       | Deactivate adapter. |
| `update`         | `config: EVMAdapterOptions` | Update config and notify. |

### Key & signing

| Method                | Parameters | Returns     | Description |
| --------------------- | ---------- | ----------- | ----------- |
| `generateSecretKey`   | —          | `string`    | New Ed25519 secret key (bs58, 44 chars). |
| `signTypedData`       | (internal) | —           | Delegates to `web3Provider.signTypedData`. |

### Message generators (EIP-712)

All return a `Message` (or extended) with `message` (including `chainType: "EVM"`) and `signatured`; some add `domain`.

| Method                          | Input type                | Description |
| ------------------------------- | ------------------------- | ----------- |
| `generateRegisterAccountMessage`| `RegisterAccountInputs`   | Registration. |
| `generateAddOrderlyKeyMessage`  | `AddOrderlyKeyInputs`     | Add orderly key. |
| `generateWithdrawMessage`       | `WithdrawInputs`          | Withdraw. |
| `generateInternalTransferMessage` | `InternalTransferInputs` | Internal transfer. |
| `generateSettleMessage`         | `SettleInputs`           | Settle PnL. |
| `generateDexRequestMessage`     | `DexRequestInputs`       | DEX request. |

### RPC / chain

| Method                         | Description |
| ------------------------------ | ----------- |
| `getBalance()`                 | Returns balance for current `address`. |
| `call(address, method, params, options?)` | Contract read. |
| `sendTransaction(contractAddress, method, payload, options)` | Contract write. |
| `callOnChain(chain, address, method, params, options)` | Read on another chain. |
| `pollTransactionReceiptWithBackoff(txHash, baseInterval?, maxInterval?, maxRetries?)` | Poll receipt with backoff. |

### Domain

| Method        | Returns           | Description |
| ------------- | ----------------- | ----------- |
| `getDomain(onChainDomain?: boolean)` | `SignatureDomain` | EIP-712 domain (Orderly, version 1, chainId, verifying contract). Uses contract manager when `onChainDomain` is true. |

## Dependencies

- `@orderly.network/core`: BaseWalletAdapter, IContract, Message, *Inputs, SignatureDomain
- `@orderly.network/types`: API, ChainNamespace
- `./helper`: message builders
- `./provider/web3Provider.interface`: Web3Provider
- `./types`: EVMAdapterOptions

## Usage Example

```ts
import { DefaultEVMWalletAdapter } from "@orderly.network/default-evm-adapter";
import type { Web3Provider } from "@orderly.network/default-evm-adapter";

const adapter = new DefaultEVMWalletAdapter(web3Provider);
adapter.active({ provider, address, chain: { id: 421614 }, contractManager });

const msg = await adapter.generateRegisterAccountMessage({ brokerId, registrationNonce, timestamp });
const balance = await adapter.getBalance();
```
