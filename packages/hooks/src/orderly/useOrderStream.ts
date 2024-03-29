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
import { generateKeyFun } from "../utils/swr";
import { useEventEmitter } from "../useEventEmitter";

type OrderType = "normalOrder" | "algoOrder";

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

export const useOrderStream = (
  /**
   * Orders query params
   */
  params: Params,

  options?: {
    /**
     * Keep the state update alive
     */
    keeplive?: boolean;
    /**
     * Stop the state update when the component unmount
     */
    stopOnUnmount?: boolean;
  }
) => {
  const { status, symbol, side, size = 100 } = params;

  const { data: markPrices = {} } = useMarkPricesStream();

  const ee = useEventEmitter();

  const { regesterKeyHandler, unregisterKeyHandler } = useDataCenterContext();
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

  useEffect(() => {
    const formatKey = (value?: string) => (value ? `:${value}` : "");
    const key = `orders${formatKey(status)}${formatKey(symbol)}${formatKey(
      side
    )}`;
    regesterKeyHandler?.(key, generateKeyFun({ status, symbol, side, size }));

    return () => {
      if (!options?.stopOnUnmount) return;

      unregisterKeyHandler(key);
    };
  }, [status, symbol, side, options?.keeplive]);

  const ordersResponse = usePrivateInfiniteQuery(
    generateKeyFun({ status, symbol, side, size }),
    {
      initialSize: 1,
      // revalidateFirstPage: false,
      // onError: (err) => {
      //   console.error("fetch failed::::", err);
      // },
      formatter: (data) => data,
      revalidateOnFocus: false,
    }
  );

  const flattenOrders = useMemo(() => {
    if (!ordersResponse.data) {
      return null;
    }

    return ordersResponse.data?.map((item) => item.rows)?.flat();
  }, [ordersResponse.data]);

  // console.log(ordersResponse.data);

  const orders = useMemo(() => {
    if (!flattenOrders) {
      return null;
    }

    if (status !== OrderStatus.NEW && status !== OrderStatus.INCOMPLETE) {
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
  const cancelAllOrders = useCallback(() => {}, [ordersResponse.data]);

  const _updateOrder = useCallback(
    (orderId: string, order: OrderEntity, type: OrderType) => {
      switch (type) {
        case "algoOrder":
          return doUpdateAlgoOrder({
            order_id: orderId,
            price: order["order_price"],
            quantity: order["order_quantity"],
            trigger_price: order["trigger_price"],
          });
        default:
          return doUpdateOrder({ ...order, order_id: orderId });
      }
    },
    []
  );

  /**
   * update order
   */
  const updateOrder = useCallback((orderId: string, order: OrderEntity) => {
    return _updateOrder(orderId, order, "normalOrder");
  }, []);

  /**
   * update algo order
   */
  const updateAlgoOrder = useCallback((orderId: string, order: OrderEntity) => {
    return _updateOrder(orderId, order, "algoOrder").then((res) => {
      // TODO: remove this when the WS service provides the correct data
      ee.emit("algoOrder:cache", {
        // ...res.data.rows[0],
        ...order,
        order_id: Number(orderId),
        // trigger_price: price,
      });
      //------------fix end----------------
      return res;
    });
  }, []);

  const _cancelOrder = useCallback(
    (orderId: number, type: OrderType, symbol?: string) => {
      switch (type) {
        case "algoOrder":
          return doCanceAlgolOrder(null, {
            // @ts-ignore
            order_id: orderId,
            symbol,
            source: `SDK${version}`,
          }).then((res: any) => {
            if (res.success) {
              ordersResponse.mutate();
              return res;
            } else {
              throw new Error(res.message);
            }
          });
        default:
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
      }
    },
    []
  );
  /**
   * calcel order
   */
  const cancelOrder = useCallback((orderId: number, symbol?: string) => {
    return _cancelOrder(orderId, "normalOrder", symbol);
  }, []);

  /**
   * calcel algo order
   */
  const cancelAlgoOrder = useCallback((orderId: number, symbol?: string) => {
    return _cancelOrder(orderId, "algoOrder", symbol);
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
      updateAlgoOrder,
      cancelAlgoOrder,
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
