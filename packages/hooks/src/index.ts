// import "./utils/dev";
import type { Immer } from "immer";

export { default as version } from "./version";
export { fetcher } from "./utils/fetcher";
export { useQuery } from "./useQuery";
export { useLazyQuery } from "./useLazyQuery";
export { useMutation } from "./useMutation";
export { usePrivateQuery } from "./usePrivateQuery";
export { usePrivateInfiniteQuery } from "./usePrivateInfiniteQuery";
export { useInfiniteQuery } from "./useInfiniteQuery";
export { useBoolean } from "./useBoolean";
export { useUpdatedRef } from "./shared/useUpdatedRef";
export { useMemoizedFn } from "./shared/useMemoizedFn";

export { useAccount } from "./useAccount";
export { type SubAccount } from "@orderly.network/core";
export { useAccountInstance } from "./useAccountInstance";

export { usePreLoadData } from "./usePreloadData";

export { useEventEmitter } from "./useEventEmitter";

export { useSessionStorage } from "./useSessionStorage";
export { useLocalStorage } from "./useLocalStorage";
export { useNetworkInfo } from "./useNetworkInfo";
export { useTrack } from "./useTrack";
export { useTrackingInstance } from "./useTrackInstance";
export { parseJSON } from "./utils/json";

export { default as useConstant } from "use-constant";
export { useWS } from "./useWS";
export { useConfig } from "./useConfig";
export { useKeyStore } from "./useKeyStore";
export { useSimpleDI } from "./useSimpleDI";

export * from "./orderlyContext";
export * from "./provider/status/statusProvider";
export { useWsStatus, WsNetworkStatus } from "./useWsStatus";
export type {
  ConfigProviderProps,
  ExclusiveConfigProviderProps,
} from "./configProvider";
export { OrderlyConfigProvider } from "./configProvider";
export { ExtendedConfigStore } from "./extendedConfigStore";

export {
  WalletConnectorContext,
  type ConnectedChain,
  type WalletConnectorContextState,
  useWalletConnector,
  type WalletState,
} from "./walletConnectorContext";

export * from "./orderly/orderlyHooks";

export { useOrderEntry as useOrderEntry_deprecated } from "./deprecated/useOrderEntry";
export type {
  UseOrderEntryMetaState,
  OrderParams,
} from "./deprecated/useOrderEntry";

export {
  default as useSWR,
  // SWRConfig,
  useSWRConfig,
  type SWRConfiguration,
  type SWRHook,
  type SWRResponse,
  type Middleware,
  type KeyedMutator,
  unstable_serialize,
} from "swr";

export * as swr from "swr";

export * from "use-debounce";

export { useMediaQuery } from "./useMediaQuery";

export { usePoster } from "./usePoster";
export { DefaultLayoutConfig } from "./services/painter/layout.config";
export type {
  PosterLayoutConfig,
  DrawOptions,
} from "./services/painter/basePaint";

export * from "./orderly/orderlyHooks";

export { cleanStringStyle } from "./utils/orderEntryHelper";
export { checkNotional, getMinNotional } from "./utils/createOrder";

export * as utils from "./utils";

export type { WalletAdapter } from "@orderly.network/core";

export * from "./referral";

export * from "./trading-rewards";

export * from "./apiKeys";

//--------- next hooks-----------
// export { useOrderEntryNext } from "./next/useOrderEntry/useOrderEntry";
export * from "./next/useOrderEntry";

export {
  useRestrictedInfo,
  type RestrictedInfoReturns,
  type RestrictedInfoOptions,
} from "./useRestrictedInfo";

export * from "./subAccount";

export { usePositionClose } from "./next/positions/usePositionClose";
