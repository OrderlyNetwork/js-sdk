import { createContext } from "react";

import { type ConfigStore, type OrderlyKeyStore } from "@orderly.network/core";
import { IContract, type getWalletAdapterFunc } from "@orderly.network/core";

export interface OrderlyAppConfig {
  logoUrl: string;
  theme: any;
}

export type AppStateErrors = {
  ChainNetworkNotSupport: boolean;
  IpNotSupport: boolean;
  NetworkError: boolean;
};
export interface OrderlyContextState extends OrderlyAppConfig {
  // coin cion generator
  // ws: WebSocketAdpater;
  fetcher?: (url: string, init: RequestInit) => Promise<any>;
  apiBaseUrl: string;
  klineDataUrl: string;
  configStore: ConfigStore;
  keyStore: OrderlyKeyStore;
  // walletAdapter: { new (options: any): WalletAdapter };
  getWalletAdapter: getWalletAdapterFunc;
  contractManager: IContract;
  networkId: string;
  brokerId: string;

  onWalletConnect?: () => Promise<any>;
  onWalletDisconnect?: () => Promise<any>;
  onSetChain?: (chainId: number) => Promise<any>;

  errors: AppStateErrors;

  // extraApis:ExtraAPIs
}

export const OrderlyContext = createContext<OrderlyContextState>({
  // configStore: new MemoryConfigStore(),
} as OrderlyContextState);

export const OrderlyProvider = OrderlyContext.Provider;
