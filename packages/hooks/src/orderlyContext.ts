import { createContext } from "react";
import {
  type ConfigStore,
  type OrderlyKeyStore,
  type getWalletAdapterFunc,
  WalletAdapter,
} from "@orderly.network/core";
import { API, Chain, NetworkId } from "@orderly.network/types";
import { Chains } from "./orderly/useChains";

export type filteredChains = {
  mainnet?: Chain[];
  testnet?: Chain[];
};

export type chainFilterFunc = (config: ConfigStore) => filteredChains;

export type chainFilter = filteredChains | chainFilterFunc;

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
  filteredChains?: filteredChains | null;
  customChains?: Chains<undefined, undefined>;
  chainTransformer?: (params: {
    chains: API.Chain[];
    tokenChains: API.Chain[];
    chainInfos: any[];
    swapChains: any[];
    mainnet: boolean;
  }) => API.Chain[];
  /** enable swap deposit, default is false */
  enableSwapDeposit?: boolean;
  /**
   * Custom orderbook default tick sizes.
   */
  defaultOrderbookTickSizes: Record<string, string>;

  dataAdapter?: {
    /**
     * Custom `/v1/public/futures` response data.
     */
    symbolList?: (originalVal: API.MarketInfoExt[]) => any[];
  };
}

export const OrderlyContext = createContext<OrderlyConfigContextState>({
  // configStore: new MemoryConfigStore(),
} as OrderlyConfigContextState);

export const OrderlyProvider = OrderlyContext.Provider;
