import { FC } from "react";
import { useOrdersScript } from "./orders.script";
import { Orders } from "./orders.ui";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";

export enum TabType {
  all = "all",
  pending = "pending",
  tp_sl = "tp_sl",
  filled = "filled",
  cancelled = "cancelled",
  rejected = "rejected",
  orderHistory = "orderHistory",
}

export const OrdersWidget: FC<{
  current?: TabType;
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
}> = (props) => {
  const state = useOrdersScript(props);

  return <Orders {...state} />;
};
