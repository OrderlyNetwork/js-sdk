import { createContext } from "react";

export type OrderEntryContextState = {
  errorMsgVisible: boolean;
};

export const OrderEntryContext = createContext<OrderEntryContextState>(
  {} as OrderEntryContextState,
);
