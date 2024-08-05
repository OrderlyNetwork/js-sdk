import { useState } from "react";
import {
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";

export const useOrderListScript = (props: {
    ordersStatus: OrderStatus;
    filterSides?: boolean;
    filterStatus?: boolean;
    filterDate?: boolean
}) => {
    const {ordersStatus} = props;
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
      // symbol: tabExtraData.showAllSymbol ? "" : context.symbol,
  
      side: ordersSide,
      excludes:
        ordersStatus === OrderStatus.FILLED
          ? []
          : [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
    });
  
    const updateOrdersSide = (side: OrderSide) => {
      setOrdersSide(side);
    };
  
    return {
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
