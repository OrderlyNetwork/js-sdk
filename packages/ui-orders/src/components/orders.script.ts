import { useState } from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { TabType } from "./orders.widget";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";
export const useOrdersScript = (props: {
  current?: TabType;
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
}) => {
  const { current, pnlNotionalDecimalPrecision, sharePnLConfig } = props;
  return {
    current,
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
  };
};

export type OrdersBuilderState = ReturnType<typeof useOrdersScript>;
