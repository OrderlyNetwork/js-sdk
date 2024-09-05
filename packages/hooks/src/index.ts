// import "./utils/dev";
import type { Immer } from "immer";

export { default as version } from "./version";

export { useQuery } from "./useQuery";
export { useLazyQuery } from "./useLazyQuery";
export { useMutation } from "./useMutation";
export { usePrivateQuery } from "./usePrivateQuery";
export { usePrivateInfiniteQuery } from "./usePrivateInfiniteQuery";
export { useBoolean } from "./useBoolean";

export { useAccount } from "./useAccount";
export { useAccountInstance } from "./useAccountInstance";

export { usePreLoadData } from "./usePreloadData";

export { useEventEmitter } from "./useEventEmitter";

export { useSessionStorage } from "./useSessionStorage";
export { useLocalStorage } from "./useLocalStorage";

export { parseJSON } from "./utils/json";

export { default as useConstant } from "use-constant";
export { useWS } from "./useWS";
export { useConfig } from "./useConfig";
export { useKeyStore } from "./useKeyStore";
export { useSimpleDI } from "./useSimpleDI";

export * from "./orderlyContext";
export * from "./statusProvider";
export { useWsStatus, WsNetworkStatus } from "./useWsStatus";
export type { ConfigProviderProps } from "./configProvider";
export { OrderlyConfigProvider } from "./configProvider";

export {
  WalletConnectorContext,
  useWalletConnector,
  type WalletState,
} from "./walletConnectorContext";

export * from "./orderly/orderlyHooks";

import useSWR, {
  type SWRConfiguration,
  SWRConfig,
  useSWRConfig,
  unstable_serialize,
} from "swr";

export {
  useSWR,
  SWRConfig,
  useSWRConfig,
  type SWRConfiguration,
  unstable_serialize,
};

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
export { checkNotional } from "./utils/createOrder";

export * as utils from "./utils";

export type { WalletAdapter } from "@orderly.network/core";

export * from "./referral";

export * from "./trading-rewards";

export * from "./apiKeys";

//--------- next hooks-----------
export { useOrderEntryNext } from "./orderly/next/useOrderEntry";
