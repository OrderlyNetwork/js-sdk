import { FC, PropsWithChildren, useMemo } from "react";
import { OrderEntryContext, OrderEntryContextState } from "./orderEntryContext";

export const OrderEntryProvider: FC<
  PropsWithChildren<OrderEntryContextState>
> = (props) => {
  const {
    errorMsgVisible,
    symbolInfo,
    onFocus,
    onBlur,
    getErrorMsg,
    setOrderValue,
    setOrderValues,
    currentFocusInput,
    errors,
    priceInputRef,
    priceInputContainerRef,
    triggerPriceInputRef,
    activatedPriceInputRef,
    leverage,
  } = props;

  const memoizedValue = useMemo<OrderEntryContextState>(() => {
    return {
      errorMsgVisible,
      symbolInfo,
      onFocus,
      onBlur,
      getErrorMsg,
      setOrderValue,
      setOrderValues,
      currentFocusInput,
      errors,
      // refs
      priceInputRef,
      priceInputContainerRef,
      triggerPriceInputRef,
      activatedPriceInputRef,
      leverage,
    };
  }, [
    errorMsgVisible,
    symbolInfo,
    onFocus,
    onBlur,
    getErrorMsg,
    setOrderValue,
    setOrderValues,
    currentFocusInput,
    errors,

    priceInputRef,
    priceInputContainerRef,
    triggerPriceInputRef,
    activatedPriceInputRef,
    leverage,
  ]);

  return (
    <OrderEntryContext.Provider value={memoizedValue}>
      {props.children}
    </OrderEntryContext.Provider>
  );
};
