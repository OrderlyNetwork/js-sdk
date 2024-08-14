import { useState } from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { TabType } from "../orders.widget";
import { usePagination } from "@orderly.network/ui";

export const useOrderListScript = (props: {
  type: TabType;
  ordersStatus?: OrderStatus;
  filterSides?: boolean;
  filterStatus?: boolean;
  filterDate?: boolean;
}) => {
  const { ordersStatus, type } = props;
  const [ordersSide, setOrdersSide] = useState<OrderSide>();
  const [dateRange, setDateRange] = useState();

  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [
    data,
    {
      isLoading,
      loadMore,
      cancelOrder,
      updateOrder,
      cancelAlgoOrder,
      updateAlgoOrder,
      meta,
    },
  ] = useOrderStream({
    status: ordersStatus,
    side: ordersSide,
    page: page,
    size: pageSize,
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
    loadMore,
    cancelOrder,
    updateOrder,
    cancelAlgoOrder,
    updateAlgoOrder,

    // pagination
    page, pageSize, setPage, setPageSize, meta: parseMeta(meta)
  };
};

export type OrdersBuilderState = ReturnType<typeof useOrderListScript>;
