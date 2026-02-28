# types

## Overview

Defines configuration types for the default EVM adapter: options passed when activating or updating the adapter, and a factory type for creating a wallet adapter with a given Web3 provider.

## Exports

### `EVMAdapterOptions`

Options required to activate or update the EVM wallet adapter.

| Field            | Type                | Required | Description |
| ---------------- | ------------------- | -------- | ----------- |
| `provider`       | `Eip1193Provider`   | Yes      | EIP-1193 compatible provider (e.g. `window.ethereum`). |
| `address`        | `string`            | Yes      | Connected wallet address. |
| `chain`          | `{ id: number }`    | Yes      | Current chain id. |
| `contractManager`| `IContract`         | Yes      | Contract manager from `@orderly.network/core` for verification contract address. |

### `getWalletAdapterFunc`

Type of a function that creates a Web3 provider–backed adapter from these options.

```ts
type getWalletAdapterFunc = (options: EVMAdapterOptions) => Web3Provider;
```

## Dependencies

- `Eip1193Provider` and `Web3Provider` from `./provider/web3Provider.interface`
- `IContract` from `@orderly.network/core`

## Usage Example

```ts
import type { EVMAdapterOptions, getWalletAdapterFunc } from "@orderly.network/default-evm-adapter";

const options: EVMAdapterOptions = {
  provider: window.ethereum,
  address: "0x...",
  chain: { id: 421614 },
  contractManager,
};

const getAdapter: getWalletAdapterFunc = (opts) => new MyWeb3Provider(opts);
```
