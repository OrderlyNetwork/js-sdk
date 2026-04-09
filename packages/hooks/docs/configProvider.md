# configProvider.tsx — OrderlyConfigProvider

## configProvider Responsibility

Provides `OrderlyConfigProvider`: root config and wallet setup for Orderly (config store, key store, wallet adapters, chain filter, optional custom chains, data adapter, notification, amplitude, order metadata). Must wrap the app (or Orderly tree) so that `OrderlyContext` and wallet/config are available. Also wires `DataCenterProvider` and `StatusProvider`.

## OrderlyConfigProvider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| keyStore | OrderlyKeyStore | No | Key store instance. |
| contracts | IContract | No | Contract config. |
| walletAdapters | WalletAdapter[] | No | Wallet adapters (e.g. EVM, Solana). |
| chainFilter | ChainFilter | No | Filter chains (array or function). |
| orderbookDefaultTickSizes | Record<string, string> | No | Default tick sizes per symbol. |
| orderbookDefaultSymbolDepths | Record<PropertyKey, number[]> | No | Default depths per symbol. |
| enableSwapDeposit | boolean | No | Enable swap deposit. |
| customChains | Custom chains | No | Custom chain config. |
| dataAdapter | Data adapter | No | Data adapter. |
| notification | Notification | No | Notification config. |
| amplitudeConfig | Amplitude config | No | Amplitude config. |
| orderMetadata | Order metadata | No | Order metadata. |
| children | ReactNode | Yes | Child tree. |

Exclusive config (one of):

- **Option A**: `brokerId`, `brokerName?`, `networkId`, `configStore` must be omitted.
- **Option B**: `configStore`, and `brokerId` / `brokerName` / `networkId` must be omitted.

## OrderlyConfigProvider Dependencies

- **Upstream**: `@orderly.network/core` (ConfigStore, OrderlyKeyStore, Account, etc.), default EVM/Solana adapters, `ExtendedConfigStore`, `OrderlyProvider`, `DataCenterProvider`, `StatusProvider`.
- **Downstream**: Any component using `OrderlyContext`, `useAccount`, `useConfig`, etc.

## OrderlyConfigProvider Example

```tsx
import { OrderlyConfigProvider } from "@orderly.network/hooks";
import { ConfigStore, OrderlyKeyStore } from "@orderly.network/core";

<OrderlyConfigProvider
  brokerId="your_broker"
  networkId={NetworkId.MAINNET}
  keyStore={keyStore}
  walletAdapters={[new DefaultEVMWalletAdapter(), new DefaultSolanaWalletAdapter()]}
  chainFilter={["ethereum", "arbitrum"]}
>
  <App />
</OrderlyConfigProvider>
```
