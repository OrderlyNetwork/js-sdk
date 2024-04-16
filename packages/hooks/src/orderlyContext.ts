import { createContext } from "react";

import {
  type ConfigStore,
  type OrderlyKeyStore,
  type getWalletAdapterFunc,
} from "@orderly.network/core";

import { Chain, NetworkId } from "@orderly.network/types";

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
  getWalletAdapter: getWalletAdapterFunc;

  networkId: NetworkId;

  /**
   * @hidden
   */
  onlyTestnet?: boolean;
  // extraApis:ExtraAPIs
  saveRefCode?: boolean;
  onClickReferral?: () => void;
  onBoundRefCode?: (success: boolean, error: any) => void;

  filteredChains?: filteredChains | null;
}

export const OrderlyContext = createContext<OrderlyConfigContextState>({
  // configStore: new MemoryConfigStore(),
} as OrderlyConfigContextState);

export const OrderlyProvider = OrderlyContext.Provider;
