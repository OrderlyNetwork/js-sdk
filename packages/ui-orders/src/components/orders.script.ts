import { ForwardedRef, useImperativeHandle, useRef } from "react";
import type { API } from "@orderly.network/types";
import { SharePnLConfig } from "@orderly.network/ui-share";
import { OrderListInstance } from "./orderList/orderList.script";
import { TabType } from "./orders.widget";

type UseOrdersScriptOptions = {
  productType?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  current?: TabType;
  pnlNotionalDecimalPrecision?: number;
  ref: ForwardedRef<OrderListInstance>;
  sharePnLConfig?: SharePnLConfig;
};

export const useOrdersScript = (props: UseOrdersScriptOptions) => {
  const {
    current,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    productType,
    onSymbolChange,
  } = props;

  const orderListRef = useRef<OrderListInstance>(null);

  useImperativeHandle(props.ref, () => ({
    download: () => {
      orderListRef.current?.download?.();
    },
  }));

  return {
    onSymbolChange,
    productType,
    current,
    pnlNotionalDecimalPrecision,
    orderListRef,
    sharePnLConfig,
  };
};

export type OrdersBuilderState = ReturnType<typeof useOrdersScript>;
