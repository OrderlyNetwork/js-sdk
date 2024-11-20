import { useState } from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { TabType } from "./orders.widget";

export const useOrdersScript = (props: {
  current?: TabType;
  pnlNotionalDecimalPrecision?: number;
}) => {
  const { current, pnlNotionalDecimalPrecision } = props;
  return {
    current,
    pnlNotionalDecimalPrecision,
  };
};

export type OrdersBuilderState = ReturnType<typeof useOrdersScript>;
