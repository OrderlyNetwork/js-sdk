import { usePrivateInfiniteQuery } from "../usePrivateInfiniteQuery";
import { useCallback, useEffect, useMemo } from "react";
import { OrderSide, OrderEntity, OrderStatus } from "@orderly.network/types";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useMutation } from "../useMutation";

export interface UserOrdersReturn {
  data: any[];
  loading: boolean;
  update: (order: any) => void;
  cancel: (order: any) => void;
}

// const chche: Record<string, boolean> = {};

type Params = {
  symbol?: string;
  status?: OrderStatus;
  size?: number;
  side?: OrderSide;
};

export const useOrderStream = (params: Params) => {
  const { status, symbol, side, size = 100 } = params;

  const { data: markPrices = {} } = useMarkPricesStream();
  const [doCancelOrder, { error: cancelOrderError }] = useMutation(
    "/v1/order",
    "DELETE"
  );
  const [doUpdateOrder, { error: updateOrderError }] = useMutation(
    "/v1/order",
    "PUT"
  );

  const ordersResponse = usePrivateInfiniteQuery(
    (pageIndex: number, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.rows?.length) return null;

      const search = new URLSearchParams([
        ["size", size.toString()],
        ["page", `${pageIndex + 1}`],
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
      // revalidateFirstPage: false,
      // onError: (err) => {
      //   console.error("fetch failed::::", err);
      // },
      formatter: (data) => data,
    }
  );

  const orders = useMemo(() => {
    if (!ordersResponse.data) {
      return null;
    }

    return ordersResponse.data
      ?.map((item) => item.rows)
      ?.flat()
      .map((item) => {
        return {
          ...item,
          mark_price: (markPrices as any)[item.symbol] ?? 0,
        };
      });
  }, [ordersResponse.data, markPrices]);

  const total = useMemo(() => {
    return ordersResponse.data?.[0]?.meta?.total || 0;
  }, [ordersResponse.data?.[0]?.meta?.total]);

  /**
   * cancel all orders
   */
  const cancelAllOrders = useCallback(() => {}, [ordersResponse.data]);

  /**
   * update order
   */
  const updateOrder = useCallback((orderId: string, order: OrderEntity) => {
    //
    return doUpdateOrder({ ...order, order_id: orderId });
  }, []);

  /**
   * calcel order
   */
  const cancelOrder = useCallback((orderId: string, symbol?: string) => {
    return doCancelOrder(null, {
      order_id: orderId,
      symbol,
    }).then((res: any) => {
      if (res.success) {
        // return ordersResponse.mutate().then(() => {
        //   return res;
        // });
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
      total,
      isLoading: ordersResponse.isLoading,
      loadMore,
      cancelAllOrders,
      updateOrder,
      cancelOrder,
      errors: {
        cancelOrder: cancelOrderError,
        updateOrder: updateOrderError,
      },
    },
  ] as const;
};
