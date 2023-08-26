import { createContext } from "react";
import { Observable } from "rxjs";
import { type ConfigStore } from "@orderly/core";
import { MemoryConfigStore } from "@orderly/core";

type CoinGenerator = (coin: string) => string;

export interface OrderlyContextState {
  // coin cion generator
  coinGenerator?: CoinGenerator;
  // ws: WebSocketAdpater;
  fetcher?: (url: string, init: RequestInit) => Promise<any>;
  apiBaseUrl: string;
  configStore: ConfigStore;
  // account: Account;
}

export const OrderlyContext = createContext<OrderlyContextState>({
  configStore: new MemoryConfigStore(),
} as OrderlyContextState);

export const OrderlyProvider = OrderlyContext.Provider;
