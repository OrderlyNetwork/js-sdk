import { usePrivateInfiniteQuery } from "../usePrivateInfiniteQuery";
import { type SWRInfiniteResponse } from "swr/infinite";
import { useCallback, useEffect, useMemo } from "react";

import { API, OrderSide } from "@orderly.network/types";
import { useMarketsStream } from "./useMarketsStream";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useMutation } from "../useMutation";
import { OrderEntity } from "@orderly.network/types";
import { useExecutionReport } from "./orderlyHooks";
import { useEventEmitter } from "../useEventEmitter";
export interface UserOrdersReturn {
  data: any[];
  loading: boolean;
  update: (order: any) => void;
  cancel: (order: any) => void;
}

export enum OrderStatus {
  FILLED = "FILLED",
  PARTIAL_FILLED = "PARTIAL_FILLED",
  CANCELED = "CANCELED",
  NEW = "NEW",
  COMPLETED = "COMPLETED",
}

export const useOrderStream = ({
  status,
  symbol,
  side,
  size = 100,
}: {
  symbol?: string;
  status?: OrderStatus;
  size?: number;
  side?: OrderSide;
} = {}) => {
  // const markPrices$ = useMarkPricesSubject();

  const ee = useEventEmitter();

  const { data: markPrices = {} } = useMarkPricesStream();
  const [doCancelOrder] = useMutation("/v1/order", "DELETE");
  const [doUpdateOrder] = useMutation("/v1/order", "PUT");

  const ordersResponse = usePrivateInfiniteQuery(
    (pageIndex: number, previousPageData) => {
      // TODO: 检查是否有下一页
      // if(previousPageData){
      //
      //   const {meta} = previousPageData;
      // }
      const search = new URLSearchParams([
        ["size", size.toString()],
        ["page", `${pageIndex + 1}`],
        // [`status`, status],
      ]);

      if (status) {
        search.set(`status`, status);
      }

      if (symbol) {
        search.set(`symbol`, symbol);
      }

      if (side) {
        search.set(`side`, side);
      }

      return `/v1/orders?${search.toString()}`;
    },
    {
      initialSize: 1,
      onError: (err) => {
        console.error("fetch failed::::", err);
      },
    }
  );

  // useExecutionReport();

  const orders = useMemo(() => {
    if (!ordersResponse.data) {
      return null;
    }

    // console.log("orders:::", markPrices);

    return ordersResponse.data?.flat().map((item) => {
      return {
        ...item,
        mark_price: (markPrices as any)[item.symbol] ?? 0,
      };
    });
  }, [ordersResponse.data, markPrices]);

  /// Hack: 为了让订单列表能够及时更新，这里需要订阅订单的变化, 后续优化
  useEffect(() => {
    const handler = () => ordersResponse.mutate();
    ee.on("orders:changed", handler);

    return () => {
      ee.off("orders:changed", handler);
    };
  }, []);

  /**
   * 取消所有订单
   */
  const cancelAllOrders = useCallback(() => {}, [ordersResponse.data]);

  /**
   * 更新单个订单
   */
  const updateOrder = useCallback((orderId: string, order: OrderEntity) => {
    // console.log("updateOrder", order, orderId);
    return doUpdateOrder({ ...order, order_id: orderId });
  }, []);

  /**
   * 取消单个订单
   */
  const cancelOrder = useCallback((orderId: string, symbol?: string) => {
    return doCancelOrder(null, {
      order_id: orderId,
      symbol,
    }).then((res: any) => {
      if (res.success) {
        return ordersResponse.mutate().then(() => {
          return res;
        });
      } else {
        throw new Error(res.message);
      }
    });
  }, []);

  return [
    orders,
    {
      cancelAllOrders,
      updateOrder,
      cancelOrder,
    },
  ];
};
