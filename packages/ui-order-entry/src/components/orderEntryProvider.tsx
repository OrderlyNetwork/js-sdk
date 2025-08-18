import { FC, PropsWithChildren, useMemo } from "react";
import { OrderEntryContext, OrderEntryContextState } from "./orderEntryContext";

export const OrderEntryProvider: FC<
  PropsWithChildren<OrderEntryContextState>
> = (props) => {
  const { errorMsgVisible } = props;

  const memoizedValue = useMemo<OrderEntryContextState>(() => {
    return { errorMsgVisible };
  }, [errorMsgVisible]);

  return (
    <OrderEntryContext.Provider value={memoizedValue}>
      {props.children}
    </OrderEntryContext.Provider>
  );
};
