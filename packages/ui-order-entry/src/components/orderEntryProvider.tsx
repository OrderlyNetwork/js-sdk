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
  ]);

  return (
    <OrderEntryContext.Provider value={memoizedValue}>
      {props.children}
    </OrderEntryContext.Provider>
  );
};
