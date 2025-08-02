import { PropsWithChildren, useState } from "react";
import { createOrderlyStore, OrderlyStoreContext } from "./storeContext";

export const OrderlyStoreProvider = ({ children }: PropsWithChildren) => {
  const [store] = useState(() => createOrderlyStore({}));

  return (
    <OrderlyStoreContext.Provider value={store}>
      {children}
    </OrderlyStoreContext.Provider>
  );
};
