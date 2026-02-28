# configProvider

## Overview

React component and types for the Orderly config provider. Wires key store, contracts, wallet adapters, chain filter, orderbook defaults, and optional broker/network or custom config store. Composes DataCenterProvider and StatusProvider.

## Exports

### Types

- **`ChainFilterFunc`**: `(config: ConfigStore) => FilteredChains`
- **`ChainFilter`**: `FilteredChains | ChainFilterFunc`
- **`BaseConfigProviderProps`**: keyStore, contracts, walletAdapters, chainFilter, orderbookDefaultTickSizes, orderbookDefaultSymbolDepths, plus OrderlyConfigContextState options (enableSwapDeposit, customChains, chainTransformer, dataAdapter, notification, amplitudeConfig, orderMetadata)
- **`ExclusiveConfigProviderProps`**: either `{ brokerId, brokerName?, networkId, configStore?: never }` or `{ configStore: ConfigStore, brokerId?: never, ... }`
- **`ConfigProviderProps`**: `BaseConfigProviderProps & ExclusiveConfigProviderProps`
- **`ConfigProviderProps`**, **`ExclusiveConfigProviderProps`** (exported from package)

### Component

#### `OrderlyConfigProvider`

Root config provider. Requires either `brokerId` + `networkId` or `configStore`.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `keyStore` | `OrderlyKeyStore` | No | Key store |
| `contracts` | `IContract` | No | Contract config |
| `walletAdapters` | `WalletAdapter[]` | No | Wallet adapters |
| `chainFilter` | `ChainFilter` | No | Chain filter |
| `orderbookDefaultTickSizes` | `Record<string, string>` | No | Default tick sizes |
| `orderbookDefaultSymbolDepths` | `Record<PropertyKey, number[]>` | No | Default depths |
| `brokerId` | `string` | Conditional | Required when not using configStore |
| `networkId` | `NetworkId` | Conditional | Required when not using configStore |
| `configStore` | `ConfigStore` | Conditional | Alternative to brokerId/networkId |
| (others) | from BaseConfigProviderProps | No | enableSwapDeposit, customChains, etc. |

## Usage example

```tsx
import { OrderlyConfigProvider } from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";

<OrderlyConfigProvider
  brokerId="woofi_dex"
  networkId={NetworkId.MAINNET}
  walletAdapters={[new DefaultEVMWalletAdapter(), new DefaultSolanaWalletAdapter()]}
>
  {children}
</OrderlyConfigProvider>
```
