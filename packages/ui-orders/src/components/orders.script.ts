import { useState } from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { TabType } from "./orders.widget";

export const useOrdersScript = (props: { current?: TabType }) => {
  const { current } = props;
  return {
    current,
  };
};

export type OrdersBuilderState = ReturnType<typeof useOrdersScript>;
