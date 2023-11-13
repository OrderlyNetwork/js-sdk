import { usePrivateInfiniteQuery } from "../usePrivateInfiniteQuery";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OrderSide, OrderEntity } from "@orderly.network/types";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useMutation } from "../useMutation";
import { useEventEmitter } from "../useEventEmitter";
import { useExecutionReport } from "./useExecutionReport";
import { useWS } from "../useWS";
import { useSWRConfig } from "swr";

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
  // CANCELLED + FILLED
  COMPLETED = "COMPLETED",
  //  NEW + PARTIAL_FILLED
  INCOMPLETE = "INCOMPLETE",
}

export const useOrderStream = ({
  status,
  symbol,
  side,
  size = 10,
}: {
  symbol?: string;
  status?: OrderStatus;
  size?: number;
  side?: OrderSide;
} = {}) => {
  // const markPrices$ = useMarkPricesSubject();
  const { mutate, cache } = useSWRConfig();
  // const ee = useEventEmitter();
  const ws = useWS();

  const { data: markPrices = {} } = useMarkPricesStream();
  const [doCancelOrder] = useMutation("/v1/order", "DELETE");
  const [doUpdateOrder] = useMutation("/v1/order", "PUT");

  const ordersResponse = usePrivateInfiniteQuery(
    (pageIndex: number, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.length) return null;

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

  // const { data: report } = useExecutionReport();

  // console.log("--!!!!!----", report);

  const orders = useMemo(() => {
    if (!ordersResponse.data) {
      return null;
    }

    //

    return ordersResponse.data?.flat().map((item) => {
      return {
        ...item,
        mark_price: (markPrices as any)[item.symbol] ?? 0,
      };
    });
  }, [ordersResponse.data, markPrices]);

  /// Hack: 为了让订单列表能够及时更新，这里需要订阅订单的变化, 后续优化
  // useEffect(() => {
  //   const handler = () => {
  //     ordersResponse.mutate();
  //   };
  //   ee.on("orders:changed", handler);

  //   return () => {
  //     ee.off("orders:changed", handler);
  //   };
  // }, []);

  useEffect(() => {
    const unsubscribe = ws.privateSubscribe(
      {
        id: "executionreport_orders",
        event: "subscribe",
        topic: "executionreport",
        ts: Date.now(),
      },
      {
        onMessage: (data: any) => {
          console.log("executionreport", data);
          // console.log("cache", cache);
          ordersResponse.mutate((prevData) => {
            // console.log("prevData", prevData);
            const { symbol, side, status } = data;

            // FIXME: 注意分页逻辑

            const newData = {
              ...data,
            };

            if (status === OrderStatus.NEW) {
              if (!prevData) return [[newData]];
              return [[newData, ...prevData?.[0]], ...prevData];
            }

            if(status === OrderStatus.CANCELED || status ===OrderStatus.FILLED) {

            }

            if(status === OrderStatus.PARTIAL_FILLED){

            }

            return prevData;
          });
        },
      }
    );
    return () => unsubscribe();
  }, []);

  /**
   * 取消所有订单
   */
  const cancelAllOrders = useCallback(() => {}, [ordersResponse.data]);

  /**
   * 更新单个订单
   */
  const updateOrder = useCallback((orderId: string, order: OrderEntity) => {
    //
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

  const loadMore = () => {
    ordersResponse.setSize(ordersResponse.size + 1);
  };

  return [
    orders,
    {
      isLoading: ordersResponse.isLoading,
      loadMore,
      cancelAllOrders,
      updateOrder,
      cancelOrder,
    },
  ];
};
