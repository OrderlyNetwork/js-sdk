import { createContext } from "react";

import {
  type ConfigStore,
  type OrderlyKeyStore,
  type getWalletAdapterFunc,
} from "@orderly.network/core";

import { NetworkId } from "@orderly.network/types";

export interface OrderlyConfigContextState {
  // ws: WebSocketAdpater;
  fetcher?: (url: string, init: RequestInit) => Promise<any>;

  configStore: ConfigStore;
  keyStore: OrderlyKeyStore;
  // walletAdapter: { new (options: any): WalletAdapter };
  getWalletAdapter: getWalletAdapterFunc;

  networkId: NetworkId;
  // brokerId: string;

  // onWalletConnect?: () => Promise<any>;
  // onWalletDisconnect?: () => Promise<any>;
  // onSetChain?: (chainId: number) => Promise<any>;

  // errors?: AppStateErrors;

  onlyTestnet?: boolean;
  // extraApis:ExtraAPIs
}

export const OrderlyContext = createContext<OrderlyConfigContextState>({
  // configStore: new MemoryConfigStore(),
} as OrderlyConfigContextState);

export const OrderlyProvider = OrderlyContext.Provider;
