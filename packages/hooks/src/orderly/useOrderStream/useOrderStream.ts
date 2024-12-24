import { usePrivateInfiniteQuery } from "../../usePrivateInfiniteQuery";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  OrderSide,
  OrderEntity,
  OrderStatus,
  API,
  AlgoOrderRootType,
} from "@orderly.network/types";
import { useMarkPricesStream } from "../useMarkPricesStream";
import { useMutation } from "../../useMutation";
import version from "../../version";
import { useDataCenterContext } from "../../dataProvider";
import { generateKeyFun } from "../../utils/swr";
import { useEventEmitter } from "../../useEventEmitter";
import { SDKError } from "@orderly.network/types";
import { AlgoOrderType } from "@orderly.network/types";

type CreateOrderType = "normalOrder" | "algoOrder";

type CombineOrderType = AlgoOrderRootType | "ALL";

export const useOrderStream = (
  /**
   * Orders query params
   */
  params: {
    symbol?: string;
    status?: OrderStatus;
    page?: number;
    size?: number;
    side?: OrderSide;
    /**
     * Include the order type
     * @default ["ALL"]
     */
    includes?: CombineOrderType[];
    /**
     * Exclude the order type
     * @default []
     */
    excludes?: CombineOrderType[];
    dateRange?: {
      from?: Date;
      to?: Date;
    };
  },
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
  const {
    status,
    symbol,
    side,
    size = 50,
    page,
    dateRange,
  } = params;

  const [includes, setIncludes] = useState<CombineOrderType[]>(params.includes ?? ['ALL'])
  const [excludes, setExcludes] = useState<CombineOrderType[]>(params.excludes ?? []);

  const { data: markPrices } = useMarkPricesStream();

  const { registerKeyHandler, unregisterKeyHandler } = useDataCenterContext();
  const [
    doCancelOrder,
    { error: cancelOrderError, isMutating: cancelMutating },
  ] = useMutation("/v1/order", "DELETE");

  const [doCancelAllOrders] = useMutation("/v1/orders", "DELETE");

  const [
    doUpdateOrder,
    { error: updateOrderError, isMutating: updateMutating },
  ] = useMutation("/v1/order", "PUT");

  const [
    doCancelAlgolOrder,
    { error: cancelAlgoOrderError, isMutating: cancelAlgoMutating },
  ] = useMutation("/v1/algo/order", "DELETE");

  const [doCancelAllAlgoOrders] = useMutation("/v1/algo/orders", "DELETE");

  const [
    doUpdateAlgoOrder,
    { error: updateAlgoOrderError, isMutating: updateAlgoMutating },
  ] = useMutation("/v1/algo/order", "PUT");

  useEffect(() => {
    const formatKey = (value?: string) => (value ? `:${value}` : "");
    const key = `orders${formatKey(status)}${formatKey(symbol)}${formatKey(
      side
    )}${formatKey(size.toString())}`;

    registerKeyHandler?.(
      key,
      generateKeyFun({ status, symbol, side, size, page, dateRange })
    );

    return () => {
      if (!options?.stopOnUnmount) return;

      unregisterKeyHandler(key);
    };
  }, [status, symbol, side, size, page, dateRange, options?.keeplive]);

  const ordersResponse = usePrivateInfiniteQuery(
    generateKeyFun({ status, symbol, side, size, page, dateRange }),
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
    let orders = ordersResponse.data?.map((item: any) => item.rows)?.flat();

    // return ordersResponse.data?.map((item) => item.rows)?.flat();

    if (includes.includes("ALL") && excludes.length === 0) {
      return orders;
    }

    if (includes.includes("ALL") && excludes.length > 0) {
      return orders?.filter((item) => !excludes.includes(item.algo_type));
    }

    if (includes.length > 0 && excludes.length === 0) {
      return orders?.filter((item) => includes.includes(item.algo_type));
    }

    if (includes.length > 0 && excludes.length > 0) {
      return orders?.filter(
        (item) =>
          includes.includes(item.algo_type) &&
          !excludes.includes(item.algo_type)
      );
    }

    return orders;
  }, [ordersResponse.data, includes, excludes]);

  // console.log(ordersResponse.data);

  const orders = useMemo(() => {
    if (!flattenOrders) {
      return null;
    }

    if (status !== OrderStatus.NEW && status !== OrderStatus.INCOMPLETE) {
      return flattenOrders;
    }
    return flattenOrders.map((item) => {
      const order = {
        ...item,
        mark_price: (markPrices ?? ({} as any))[item.symbol] ?? 0,
      };

      ///TODO: remove this when BE provides the correct data
      // console.log("------------->>>>>>>>", order);
      if (
        order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL ||
        order.algo_type === AlgoOrderRootType.TP_SL
      ) {
        order.quantity = order.child_orders[0].quantity;
      }
      ///-----------------todo end----------------

      return order;
    });
  }, [flattenOrders, markPrices, status]);

  const total = useMemo(() => {
    return orders?.length || 0;
    // return ordersResponse.data?.[0]?.meta?.total || 0;
  }, [orders?.length]);

  const cancelAlgoOrdersByTypes = (types: AlgoOrderRootType[]) => {
    if (!types) {
      throw new SDKError("types is required");
    }

    if (!Array.isArray(types)) {
      throw new SDKError("types should be an array");
    }

    // TODO: order type check

    return Promise.all(
      types.map((type) => {
        return doCancelAllAlgoOrders(null, { algo_type: type });
      })
    );
  };

  /**
   * cancel all orders
   */
  const cancelAllOrders = useCallback(() => {
    return Promise.all([
      doCancelAllOrders(null),
      doCancelAllAlgoOrders(null, { algo_type: "STOP" }),
    ]);
  }, [ordersResponse.data]);

  const cancelAllTPSLOrders = useCallback(() => {
    return cancelAlgoOrdersByTypes([
      AlgoOrderRootType.POSITIONAL_TP_SL,
      AlgoOrderRootType.TP_SL,
    ]);
  }, [ordersResponse.data]);

  const _updateOrder = useCallback(
    (orderId: string, order: OrderEntity, type: CreateOrderType) => {
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
    return _updateOrder(orderId, order, "algoOrder");
  }, []);

  const _cancelOrder = useCallback(
    (orderId: number, type: CreateOrderType, symbol?: string) => {
      switch (type) {
        case "algoOrder":
          return doCancelAlgolOrder(null, {
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

  // const cancelTPSLOrder = useCallback((orderId:number, symbol:string)=>{
  //   return
  // });

  const cancelTPSLChildOrder = useCallback(
    (orderId: number, rootAlgoOrderId: number): Promise<any> => {
      return doUpdateAlgoOrder({
        order_id: rootAlgoOrderId,
        child_orders: [
          {
            order_id: orderId,
            is_activated: false,
          },
        ],
      });
    },
    []
  );

  const updateTPSLOrder = useCallback(
    (
      /**
       * the root algo order id
       */
      orderId: number,
      childOrders: API.AlgoOrder["child_orders"]
    ) => {
      if (!Array.isArray(childOrders)) {
        throw new SDKError("children orders is required");
      }
      return doUpdateAlgoOrder({
        order_id: orderId,
        child_orders: childOrders,
      });
    },
    []
  );

  const meta = useMemo(() => {
    // @ts-ignore
    return ordersResponse.data?.[0]?.meta;
  }, [ordersResponse.data?.[0]]);

  return [
    orders,
    {
      total,
      isLoading: ordersResponse.isLoading,
      refresh: ordersResponse.mutate,
      loadMore,
      cancelAllOrders,
      cancelAllTPSLOrders,
      cancelAlgoOrdersByTypes,
      updateOrder,
      cancelOrder,
      updateAlgoOrder,
      cancelAlgoOrder,
      cancelTPSLChildOrder,
      updateTPSLOrder,
      meta,
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
