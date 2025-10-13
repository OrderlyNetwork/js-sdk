import { createContext, FocusEventHandler, useContext } from "react";
import { OrderValidationResult } from "@kodiak-finance/orderly-hooks";
import { API, OrderlyOrder } from "@kodiak-finance/orderly-types";
import { InputType } from "../types";

export type OrderEntryContextState = {
  errors: OrderValidationResult | null;
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
  // refs
  priceInputRef: React.RefObject<HTMLInputElement>;
  priceInputContainerRef: React.RefObject<HTMLDivElement>;
  triggerPriceInputRef: React.RefObject<HTMLInputElement>;
  activatedPriceInputRef: React.RefObject<HTMLInputElement>;
};

export const OrderEntryContext = createContext<OrderEntryContextState>(
  {} as OrderEntryContextState,
);

export const useOrderEntryContext = () => {
  return useContext(OrderEntryContext);
};
