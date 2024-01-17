import { usePrivateInfiniteQuery } from "../usePrivateInfiniteQuery";
import { useCallback, useEffect, useMemo } from "react";
import {
  OrderSide,
  OrderEntity,
  OrderStatus,
  API,
} from "@orderly.network/types";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useMutation } from "../useMutation";
import version from "../version";
import { useDataCenterContext } from "../dataProvider";

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
  const { regesterKeyHandler } = useDataCenterContext();
  const [
    doCancelOrder,
    { error: cancelOrderError, isMutating: cancelMutating },
  ] = useMutation("/v1/order", "DELETE");
  const [
    doUpdateOrder,
    { error: updateOrderError, isMutating: updateMutating },
  ] = useMutation("/v1/order", "PUT");

  const getKey = (pageIndex: number, previousPageData: any) => {
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
  };

  useEffect(() => {
    const key = `orders:${status}:${symbol}:${side}`;
    regesterKeyHandler(key, getKey);
  }, [status, symbol, side]);

  const ordersResponse = usePrivateInfiniteQuery(getKey, {
    initialSize: 1,
    // revalidateFirstPage: false,
    // onError: (err) => {
    //   console.error("fetch failed::::", err);
    // },
    formatter: (data) => data,
  });

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
  const cancelOrder = useCallback((orderId: number, symbol?: string) => {
    return doCancelOrder(null, {
      order_id: orderId,
      symbol,
      source: `SDK_${version}`,
    }).then((res: any) => {
      if (res.success) {
        // return ordersResponse.mutate().then(() => {
        //   return res;
        // });
        //Optimistic Updates
        // ordersResponse.mutate();
        return res;
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
      refresh: ordersResponse.mutate,
      loadMore,
      cancelAllOrders,
      updateOrder,
      cancelOrder,
      errors: {
        cancelOrder: cancelOrderError,
        updateOrder: updateOrderError,
      },
      submitting: {
        cancelOrder: cancelMutating,
        updateOrder: updateMutating,
      },
    },
  ] as const;
};
