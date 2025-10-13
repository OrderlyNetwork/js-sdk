import { createContext, useContext } from "react";
import { createStore, StateCreator, useStore } from "zustand";
import { devtools } from "zustand/middleware/devtools";
import { immer } from "zustand/middleware/immer";
import { SDKError } from "@kodiak-finance/orderly-types";

type OrderlyStoreState = {
  // positions: PositionSlice;
};

export type ImmerStateCreator<T> = StateCreator<
  OrderlyStoreState,
  [["zustand/immer", never], never],
  [],
  T
>;

export const createOrderlyStore = (initialState: any) => {
  return createStore<OrderlyStoreState>()(
    immer(
      devtools((...args) => ({
        // positions: positionSlice(...args),
      })),
    ),
  );
};

type OrderlyStore = ReturnType<typeof createOrderlyStore>;

export const OrderlyStoreContext = createContext<OrderlyStore | null>(null);

export function useOrderlyStoreContext<T>(
  selector: (state: OrderlyStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const store = useContext(OrderlyStoreContext);
  if (!store)
    throw new SDKError("Missing OrderlyStoreProvider.Provider in the tree");
  return useStore(store, selector);
  // return useStoreWithEqualityFn(store, selector, equalityFn)
}
