import { forwardRef } from "react";
import { useOrdersScript } from "./orders.script";
import { Orders } from "./orders.ui";
import { OrderListInstance } from "./orderList/orderList.script";

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
};

export const OrdersWidget = forwardRef<OrderListInstance, OrdersWidgetProps>(
  (props, ref) => {
    const state = useOrdersScript({ ...props, ref });

    return <Orders {...state} />;
  }
);
