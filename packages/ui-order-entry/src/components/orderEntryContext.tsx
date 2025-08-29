import { createContext, FocusEventHandler, useContext } from "react";
import { OrderValidationResult } from "@orderly.network/hooks";
import { API, OrderlyOrder } from "@orderly.network/types";
import { InputType } from "../types";

export type OrderEntryContextState = {
  errorMsgVisible: boolean;
  symbolInfo: API.SymbolExt;
  onFocus: (type: InputType) => FocusEventHandler;
  onBlur: (type: InputType) => FocusEventHandler;
  getErrorMsg: (
    key: keyof OrderValidationResult,
    customValue?: string,
  ) => string;
  setOrderValue: (key: keyof OrderlyOrder, value: any) => void;
  setOrderValues: (values: Partial<OrderlyOrder>) => void;
  currentFocusInput: InputType;
};

export const OrderEntryContext = createContext<OrderEntryContextState>(
  {} as OrderEntryContextState,
);

export const useOrderEntryContext = () => {
  return useContext(OrderEntryContext);
};
