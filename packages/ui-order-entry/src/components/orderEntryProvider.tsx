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
    };
  }, [
    errorMsgVisible,
    symbolInfo,
    onFocus,
    onBlur,
    getErrorMsg,
    setOrderValue,
    setOrderValues,
  ]);

  return (
    <OrderEntryContext.Provider value={memoizedValue}>
      {props.children}
    </OrderEntryContext.Provider>
  );
};
