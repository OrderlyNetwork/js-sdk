import { createContext } from "react";
import {
  type ConfigStore,
  type OrderlyKeyStore,
  type getWalletAdapterFunc,
  WalletAdapter,
} from "@orderly.network/core";
import { Chain, NetworkId } from "@orderly.network/types";
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
  defaultOrderbookDepth: Record<string, string>;
}

export const OrderlyContext = createContext<OrderlyConfigContextState>({
  // configStore: new MemoryConfigStore(),
} as OrderlyConfigContextState);

export const OrderlyProvider = OrderlyContext.Provider;
