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
  const [
    doCanceAlgolOrder,
    { error: cancelAlgoOrderError, isMutating: cancelAlgoMutating },
  ] = useMutation("/v1/algo/order", "DELETE");
  const [
    doUpdateAlgoOrder,
    { error: updateAlgoOrderError, isMutating: updateAlgoMutating },
  ] = useMutation("/v1/algo/order", "PUT");

  const getKey = (pageIndex: number, previousPageData: any) => {
    // reached the end
    if (previousPageData && !previousPageData.rows?.length) return null;

    const search = new URLSearchParams([
      ["size", size.toString()],
      ["page", `${pageIndex + 1}`],
      ["source_type", 'ALL']
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

  const flattenOrders = useMemo(() => {
    if (!ordersResponse.data) {
      return null;
    }

    return ordersResponse.data?.map((item) => item.rows)?.flat();
  }, [ordersResponse.data]);

  const orders = useMemo(() => {
    if (!flattenOrders) {
      return null;
    }

    if (status !== OrderStatus.NEW) {
      return flattenOrders;
    }

    return flattenOrders.map((item) => {
      return {
        ...item,
        mark_price: (markPrices as any)[item.symbol] ?? 0,
      };
    });
  }, [flattenOrders, markPrices, status]);

  const total = useMemo(() => {
    return ordersResponse.data?.[0]?.meta?.total || 0;
  }, [ordersResponse.data?.[0]?.meta?.total]);

  /**
   * cancel all orders
   */
  const cancelAllOrders = useCallback(() => { }, [ordersResponse.data]);

  /**
   * update order
   */
  const updateOrder = useCallback((orderId: string, order: OrderEntity) => {
    // @ts-ignore
    if (order.algo_order_id !== undefined) {
      return doUpdateAlgoOrder({
        order_id: orderId,
        price: order["order_price"],
        quantity: order["order_quantity"],
        trigger_price: order["trigger_price"],
      });
    }
    //
    return doUpdateOrder({ ...order, order_id: orderId });
  }, []);

  /**
   * calcel order
   */
  const cancelOrder = useCallback((orderId: number | OrderEntity, symbol?: string) => {
    let isAlgoOrder = false;
    if (typeof orderId === 'number') {
      isAlgoOrder = false;
      // @ts-ignore
    } else if (orderId.algo_order_id !== undefined) {
      isAlgoOrder = true;
    }
    if (isAlgoOrder) {      
      return doCanceAlgolOrder(null, {
        // @ts-ignore
        order_id: orderId.algo_order_id,
        symbol,
        source: `SDK${version}`
      })
        .then((res: any) => {
          if (res.success) {
            ordersResponse.mutate();
            return res;
          } else {
            throw new Error(res.message);
          }
        });;
    }
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
        cancelAlgoOrder: cancelAlgoOrderError,
        updateAlgoOrder: updateAlgoOrderError,
      },
      submitting: {
        cancelOrder: cancelMutating,
        updateOrder: updateMutating,
        cancelAlgoOrder: cancelAlgoMutating,
        updateAlglOrder: updateAlgoMutating,
      },
    },
  ] as const;
};
