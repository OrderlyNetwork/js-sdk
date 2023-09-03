import { createContext } from "react";

import {
  type ConfigStore,
  type OrderlyKeyStore,
  type WalletAdapter,
} from "@orderly.network/core";

export interface OrderlyAppConfig {
  logoUrl: string;
  theme: any;
}
export interface OrderlyContextState extends OrderlyAppConfig {
  // coin cion generator

  // ws: WebSocketAdpater;
  fetcher?: (url: string, init: RequestInit) => Promise<any>;
  apiBaseUrl: string;
  klineDataUrl: string;
  configStore: ConfigStore;
  keyStore: OrderlyKeyStore;
  walletAdapter: WalletAdapter;
  networkId: string;

  onWalletConnect?: () => void;
  // account: Account;
}

export const OrderlyContext = createContext<OrderlyContextState>({
  // configStore: new MemoryConfigStore(),
} as OrderlyContextState);

export const OrderlyProvider = OrderlyContext.Provider;
