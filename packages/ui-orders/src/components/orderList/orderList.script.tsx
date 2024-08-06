import { useState } from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { TabType } from "../orders.widget";

export const useOrderListScript = (props: {
  type: TabType;
  ordersStatus: OrderStatus;
  filterSides?: boolean;
  filterStatus?: boolean;
  filterDate?: boolean;
}) => {
  const { ordersStatus, type } = props;
  const [ordersSide, setOrdersSide] = useState<OrderSide>();
  const [dateRange, setDateRange] = useState();

  const [
    data,
    {
      isLoading,
      loadMore,
      cancelOrder,
      updateOrder,
      cancelAlgoOrder,
      updateAlgoOrder,
    },
  ] = useOrderStream({
    status: ordersStatus,
    side: ordersSide,
  });

  const updateOrdersSide = (side: OrderSide) => {
    setOrdersSide(side);
  };

  return {
    type,
    ordersStatus,
    ordersSide,
    updateOrdersSide,
    dateRange,
    setDateRange,
    dataSource: data,
    isLoading,
  };
};

export type OrdersBuilderState = ReturnType<typeof useOrderListScript>;
