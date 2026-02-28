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
  /** @deprecated will be removed in next minor version */
  fetcher?: (url: string, init: RequestInit) => Promise<any>;
  configStore: ConfigStore;
  keyStore: OrderlyKeyStore;
  walletAdapters: WalletAdapter[];

  networkId: NetworkId;

  filteredChains?: FilteredChains;
  /** custom chains, please include all chain information, otherwise there will be problems */
  customChains?: Chains<undefined, undefined>;
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

  /** when use this, please keep the reference stable, otherwise it will cause unnecessary renders */
  dataAdapter?: {
    /**
     * custom useChains return list data
     */
    chainsList?: (chains: API.Chain[]) => API.Chain[];
    /**
     * Custom `/v1/public/futures` response data.
     */
    symbolList?: (data: API.MarketInfoExt[]) => any[];
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
