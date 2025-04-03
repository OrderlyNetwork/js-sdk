import {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import { createStore, StateCreator, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware/devtools";
import { SDKError } from "@orderly.network/types";
// import {
//   PositionSlice,
//   positionSlice,
// } from "./orderly/usePositionStream/usePosition.store";
// import { useStoreWithEqualityFn } from 'zustand/traditional'

type OrderlyStoreState = {
  // positions: PositionSlice;
};

export type ImmerStateCreator<T> = StateCreator<
  OrderlyStoreState,
  [["zustand/immer", never], never],
  [],
  T
>;

const createOrderlyStore = (initialState: any) => {
  return createStore<OrderlyStoreState>()(
    immer(
      devtools((...args) => ({
        // positions: positionSlice(...args),
      }))
    )
  );
};

type OrderlyStore = ReturnType<typeof createOrderlyStore>;

const OrderlyStoreContext = createContext<OrderlyStore | null>(null);

export const OrderlyStoreProvider = ({ children }: PropsWithChildren) => {
  const [store] = useState(() => createOrderlyStore({}));

  return (
    <OrderlyStoreContext.Provider value={store}>
      {children}
    </OrderlyStoreContext.Provider>
  );
};

function useOrderlyStoreContext<T>(
  selector: (state: OrderlyStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(OrderlyStoreContext);
  if (!store)
    throw new SDKError("Missing OrderlyStoreProvider.Provider in the tree");
  return useStore(store, selector);
  // return useStoreWithEqualityFn(store, selector, equalityFn)
}
