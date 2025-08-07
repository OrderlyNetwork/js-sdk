import { PropsWithChildren, useMemo } from "react";
import { createOrderlyStore, OrderlyStoreContext } from "./storeContext";

export const OrderlyStoreProvider = ({ children }: PropsWithChildren) => {
  const store = useMemo(() => createOrderlyStore({}), []);
  return (
    <OrderlyStoreContext.Provider value={store}>
      {children}
    </OrderlyStoreContext.Provider>
  );
};
