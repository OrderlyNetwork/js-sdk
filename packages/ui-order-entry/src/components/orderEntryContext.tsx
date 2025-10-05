import {
  createContext,
  FocusEventHandler,
  useContext,
  RefObject,
  MutableRefObject,
} from "react";
import { OrderValidationResult } from "@orderly.network/hooks";
import { API, OrderlyOrder } from "@orderly.network/types";
import { InputType, QuantityInputType } from "../types";

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
  priceInputRef: RefObject<HTMLInputElement>;
  priceInputContainerRef: RefObject<HTMLDivElement>;
  triggerPriceInputRef: RefObject<HTMLInputElement>;
  activatedPriceInputRef: RefObject<HTMLInputElement>;
  lastQuantityInputType: MutableRefObject<InputType>;
  leverage?: number;
};

export const OrderEntryContext = createContext<OrderEntryContextState>(
  {} as OrderEntryContextState,
);

export const useOrderEntryContext = () => {
  return useContext(OrderEntryContext);
};
