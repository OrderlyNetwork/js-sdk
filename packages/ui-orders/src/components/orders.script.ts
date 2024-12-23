import { ForwardedRef, useImperativeHandle, useRef } from "react";
import { TabType } from "./orders.widget";
import { OrderListInstance } from "./orderList/orderList.script";

type UseOrdersScriptOptions = {
  current?: TabType;
  pnlNotionalDecimalPrecision?: number;
  ref: ForwardedRef<OrderListInstance>;
};

export const useOrdersScript = (props: UseOrdersScriptOptions) => {
  const { current, pnlNotionalDecimalPrecision } = props;

  const orderListRef = useRef<OrderListInstance>(null);

  useImperativeHandle(props.ref, () => ({
    download: () => {
      orderListRef.current?.download?.();
    },
  }));

  return {
    current,
    pnlNotionalDecimalPrecision,
    orderListRef,
  };
};

export type OrdersBuilderState = ReturnType<typeof useOrdersScript>;
