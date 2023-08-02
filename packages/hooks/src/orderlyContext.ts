import { createContext } from "react";
import { Observable } from "rxjs";

type CoinGenerator = (coin: string) => string;

export interface WebSocketAdpater {
  observe<T>(topic: string): Observable<T>;
  observe<T>(
    params: {
      event: string;
    } & Record<string, any>,
    unsubscribe?: () => any
  ): Observable<T>;
  observe<T>(
    params: any,
    unsubscribe?: () => any,
    messageFilter?: (value: T) => boolean
  ): Observable<T>;
  privateObserve: (channel: string) => any;
}

export interface OrderlyContextState {
  // coin cion generator
  coinGenerator?: CoinGenerator;
  ws: WebSocketAdpater;
}

export const OrderlyContext = createContext<OrderlyContextState>(
  {} as OrderlyContextState
);

export const OrderlyProvider = OrderlyContext.Provider;
