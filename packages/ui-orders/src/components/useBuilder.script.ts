import { useState } from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";

export const useOrdersBuilder = () => {
  const [ordersStatus, setOrdersStatus] = useState(OrderStatus.INCOMPLETE);
  const [ordersSide, setOrdersSide] = useState<OrderSide>();

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
    // symbol: tabExtraData.showAllSymbol ? "" : context.symbol,

    side: ordersSide,
    excludes:
      ordersStatus === OrderStatus.FILLED
        ? []
        : [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
  });

  const updateStatus = (status: OrderStatus) => {
    setOrdersStatus(status);
  };

  const updateOrdersSide = (side: OrderSide) => {
    setOrdersSide(side);
  };

  return {
    ordersStatus,
    updateStatus,
    ordersSide,
    updateOrdersSide,

    dataSource: data,
    isLoading,
  };
};

export type OrdersBuilderState = ReturnType<typeof useOrdersBuilder>;
