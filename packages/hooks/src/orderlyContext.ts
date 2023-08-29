import { createContext } from "react";
import { Observable } from "rxjs";
import { type ConfigStore } from "@orderly.network/core";
import { MemoryConfigStore } from "@orderly.network/core";

export interface OrderlyContextState {
  // coin cion generator

  // ws: WebSocketAdpater;
  fetcher?: (url: string, init: RequestInit) => Promise<any>;
  apiBaseUrl: string;
  configStore: ConfigStore;
  // account: Account;
}

export const OrderlyContext = createContext<OrderlyContextState>({
  // configStore: new MemoryConfigStore(),
} as OrderlyContextState);

export const OrderlyProvider = OrderlyContext.Provider;
