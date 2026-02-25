# index

## Overview

Main entry point for `@orderly.network/hooks`. Re-exports version, fetcher, query/mutation/infinite query hooks, middleware, shared hooks, referral, account, config/wallet providers, orderly hooks, store providers, SWR, use-debounce, painter types, utils, referral, trading-rewards, apiKeys, IndexedDB middleware, next order entry, restricted info, subAccount, position close, and market list/map.

## Exports (summary)

- **Version**: `version`
- **Data fetching**: `fetcher`, `noCacheConfig`, `useQueryOptions`, `useQuery`, `useLazyQuery`, `useMutation`, `usePrivateQuery`, `usePrivateInfiniteQuery`, `useInfiniteQuery`
- **Middleware**: `timestampWaitingMiddleware`, `resetTimestampOffsetState`
- **Shared**: `useBoolean`, `useUpdatedRef`, `useMemoizedFn`, `useAudioPlayer`
- **Referral**: `useReferralInfo`, `RefferalAPI`
- **Account**: `useAccount`, `SubAccount`, `useAccountInstance`
- **Preload**: `usePreLoadData`
- **Events**: `useEventEmitter`
- **Storage**: `useSessionStorage`, `useLocalStorage`
- **Network**: `useNetworkInfo`, `useFeeState`, `useTrack`, `useTrackingInstance`
- **Utils**: `parseJSON`, `useConstant`, `useWS`, `useConfig`, `useKeyStore`, `useSimpleDI`
- **Context**: `orderlyContext` exports, `useWsStatus`, `WsNetworkStatus`, `OrderlyConfigProvider`, `ChainFilter`, `ExtendedConfigStore`, `WalletConnectorContext`, `useWalletConnector`, wallet types
- **Orderly**: `orderlyHooks` (all orderly hooks), `useAppStore`
- **Store**: provider store exports, deprecated `useOrderEntry_deprecated`, `UseOrderEntryMetaState`, `OrderParams`
- **SWR**: `useSWR`, `useSWRConfig`, SWR types, `swr` namespace
- **Debounce**: `use-debounce` exports
- **Media**: `useMediaQuery`
- **Poster**: `usePoster`, `DefaultLayoutConfig`, `PosterLayoutConfig`, `DrawOptions`
- **Order utils**: `cleanStringStyle`, `checkNotional`, `getMinNotional`, `utils` namespace
- **Wallet**: `WalletAdapter`
- **Referral / Trading rewards / API keys**: full module exports
- **IndexedDB**: `indexedDBManager`, `initializeAppDatabase`, `persistIndexedDB`
- **Next**: `useOrderEntry` and related, `useRestrictedInfo`, subAccount, `usePositionClose`, `useMarketList`, `useMarketMap`, `next/tpsl` exports

## Usage example

```ts
import {
  useQuery,
  useAccount,
  useOrderEntry,
  OrderlyConfigProvider,
} from "@orderly.network/hooks";

function App() {
  return (
    <OrderlyConfigProvider networkId={NetworkId.MAINNET} brokerId="...">
      <MyTrading />
    </OrderlyConfigProvider>
  );
}

function MyTrading() {
  const { data } = useQuery("/v1/public/futures/BTC_PERP");
  const account = useAccount();
  const orderEntry = useOrderEntry();
  // ...
}
```
