/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext } from "react";
import type {
  ConfigStore,
  OrderlyKeyStore,
  WalletAdapter,
} from "@orderly.network/core";
import type {
  API,
  Chain,
  NetworkId,
  OrderlyOrder,
} from "@orderly.network/types";
import type { Chains } from "./orderly/useChains";

export type FilteredChains = {
  mainnet?: { id: number }[];
  testnet?: { id: number }[];
};

export interface OrderlyConfigContextState {
  fetcher?: (url: string, init: RequestInit) => Promise<any>;

  configStore: ConfigStore;
  keyStore: OrderlyKeyStore;
  // getWalletAdapter: getWalletAdapterFunc;
  walletAdapters: WalletAdapter[];

  networkId: NetworkId;

  /**
   * @hidden
   */
  onlyTestnet?: boolean;
  // extraApis:ExtraAPIs
  filteredChains?: FilteredChains;
  customChains?: Chains<undefined, undefined>;
  chainTransformer?: (params: {
    chains: API.Chain[];
    tokenChains: API.Token[];
    chainInfos: any[];
    swapChains: any[];
    mainnet: boolean;
  }) => API.Chain[];
  /** enable swap deposit, default is false */
  enableSwapDeposit?: boolean;
  /**
   * Custom orderbook default tick sizes.
   */
  defaultOrderbookTickSizes?: Record<PropertyKey, string>;

  /**
   * Custom orderbook default symbol depths.
   */
  defaultOrderbookSymbolDepths?: Record<PropertyKey, number[]>;

  dataAdapter?: {
    /**
     * Custom `/v1/public/futures` response data.
     */
    symbolList?: (originalVal: API.MarketInfoExt[]) => any[];
    /**
     * custom `/v2/public/announcement` response data
     */
    announcementList?: (data: any[] | ReadonlyArray<any>) => any[];
  };
  notification?: {
    orderFilled?: {
      /**
       * Sound to play when an order is successful.
       * @default undefined
       */
      media?: string;
      /**
       * Whether to open the notification by default.
       * @default false
       */
      defaultOpen?: boolean;
      /**
       * Whether to display the notification in the order entry.
       * @default true
       */
      displayInOrderEntry?: boolean;
    };
  };

  amplitudeConfig?: {
    amplitudeId: string;
    serverZone?: "EU" | "US";
  };
  orderMetadata?: OrderMetadataConfig;
  starChildConfig?: {
    enable: boolean;
    env: "testnet" | "mainnet";
    telegram_bot_id: string;
    url?: string;
  };
}

export type OrderMetadata = {
  order_tag?: string;
  client_order_id?: string;
};

export type OrderMetadataConfig =
  | OrderMetadata
  | ((order: Partial<OrderlyOrder>) => OrderMetadata);

export const OrderlyContext = createContext<OrderlyConfigContextState>({
  // configStore: new MemoryConfigStore(),
} as OrderlyConfigContextState);

export const useOrderlyContext = () => {
  return useContext(OrderlyContext);
};

export const OrderlyProvider = OrderlyContext.Provider;
