import { usePrivateInfiniteQuery } from "../usePrivateInfiniteQuery";
import { useCallback, useEffect, useMemo } from "react";
import { OrderSide, OrderEntity, OrderStatus } from "@orderly.network/types";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useMutation } from "../useMutation";
import { useWS } from "../useWS";

export interface UserOrdersReturn {
  data: any[];
  loading: boolean;
  update: (order: any) => void;
  cancel: (order: any) => void;
}

const chche: Record<string, boolean> = {};

type Params = {
  symbol?: string;
  status?: OrderStatus;
  size?: number;
  side?: OrderSide;
};

export const useOrderStream = (params: Params) => {
  const { status, symbol, side, size = 100 } = params;
  const ws = useWS();

  const { data: markPrices = {} } = useMarkPricesStream();
  const [doCancelOrder] = useMutation("/v1/order", "DELETE");
  const [doUpdateOrder] = useMutation("/v1/order", "PUT");

  const ordersResponse = usePrivateInfiniteQuery(
    (pageIndex: number, previousPageData) => {
      console.log("--- pageIndex -->>>", pageIndex);
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
      revalidateFirstPage: false,
      onError: (err) => {
        console.error("fetch failed::::", err);
      },
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
  }, [ordersResponse.data]);

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
          // console.log("executionreport", data);
          const { status, orderId, timestamp } = data;
          // const key = `${status}_${orderId}_${timestamp}`;
          // if (chche[key]) {
          //   return;
          // }
          // ordersResponse.mutate();
          // return;

          ordersResponse.mutate((prevData) => {
            // console.log("prevData", prevData);

            const newOrder = {
              order_id: data.orderId,
              symbol: data.symbol,
              created_time: data.timestamp,
              quantity: data.quantity,
              side: data.side,
              executed: data.totalExecutedQuantity,
              price: data.price,
            };

            const dataList = prevData?.map((item) => item.rows)?.flat() || [];

            if (status === OrderStatus.NEW) {
              if (!prevData) {
                return {
                  meta: {
                    total: 1,
                    records_per_page: size,
                    current_page: 1,
                  },
                  rows: [newOrder],
                };
              }
              const total = (prevData?.[0]?.meta?.total || 0) + 1;
              const isNew = !dataList.find((item) => item.order_id === orderId);
              if (isNew) {
                const list = [newOrder, ...dataList];
                return rePageData(list, total, size);
              }

              return prevData;
            }

            if (
              status === OrderStatus.CANCELLED ||
              status === OrderStatus.FILLED
            ) {
              const total = (prevData?.[0]?.meta?.total || 0) - 1;
              const list = dataList.filter(
                (order: any) => order.order_id !== orderId
              );
              return rePageData(list!, total, size);
            }

            if (status === OrderStatus.PARTIAL_FILLED) {
              return editPageData(dataList, newOrder);
            }

            if (status === OrderStatus.REPLACED) {
              return editPageData(dataList, newOrder);
            }

            // chche[key] = true;

            return prevData;
          });
        },
      }
    );
    return () => unsubscribe();
  }, []);

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
    },
  ] as const;
};

// Re-page the data
function rePageData(list: any[], total: number, pageSize: number) {
  const newData = [] as any;
  let rows = [];
  let current_page = 0;
  for (let i = 0; i < list.length; i++) {
    rows.push(list[i]);
    if ((i + 1) % pageSize === 0 || i === list.length - 1) {
      newData.push({
        meta: {
          records_per_page: pageSize,
          total,
          current_page: current_page + 1,
        },
        rows: [...rows],
      });
      rows = [];
    }
  }
  // console.log("rePageData", list, total, newData);
  return newData;
}

// edit page data by orderId
function editPageData(list: any[], newOrder: any) {
  const newData = list.map((item) => {
    return {
      ...item,
      rows: item.rows.map((row: any) => {
        if (row.order_id === newOrder.order_id) {
          return { ...row, newOrder };
        }
        return row;
      }),
    };
  });
  // console.log("editPageData", newData);
  return newData;
}
