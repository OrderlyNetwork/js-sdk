import { forwardRef } from "react";
import { SharePnLConfig } from "@kodiak-finance/orderly-ui-share";
import { OrderListInstance } from "./orderList/orderList.script";
import { useOrdersScript } from "./orders.script";
import { Orders } from "./orders.ui";

export enum TabType {
  all = "all",
  pending = "pending",
  tp_sl = "tp_sl",
  filled = "filled",
  cancelled = "cancelled",
  rejected = "rejected",
  orderHistory = "orderHistory",
}

export type OrdersWidgetProps = {
  current?: TabType;
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig;
};

export const OrdersWidget = forwardRef<OrderListInstance, OrdersWidgetProps>(
  (props, ref) => {
    const state = useOrdersScript({ ...props, ref });
    return <Orders {...state} />;
  },
);
