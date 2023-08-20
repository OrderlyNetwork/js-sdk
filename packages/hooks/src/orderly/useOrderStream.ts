import { usePrivateInfiniteQuery } from "../usePrivateInfiniteQuery";
import { type SWRInfiniteResponse } from "swr/infinite";
import { useCallback } from "react";
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
  status = OrderStatus.NEW,
  symbol,
}: {
  symbol?: string;
  status?: OrderStatus;
} = {}) => {
  const res = usePrivateInfiniteQuery(
    (pageIndex: number, previousPageData) => {
      // TODO: 检查是否有下一页
      // if(previousPageData){
      //
      //   const {meta} = previousPageData;
      // }
      const search = new URLSearchParams([
        ["size", "100"],
        ["page", `${pageIndex + 1}`],
        [`status`, status],
      ]);
      if (symbol) {
        search.set(`symbol`, symbol);
      }
      return `/orders?${search.toString()}`;
    },
    {
      initialSize: 1,
      onError: (err) => {
        console.error("fetch failed::::", err);
      },
    }
  );

  /**
   * 取消所有订单
   */
  const cancelAllOrders = useCallback(() => {

  },[res.data]);

  /**
   * 更新单个订单
   */
  const updateOrder = useCallback((id: string, data: any) => {},[])

  /**
   * 取消单个订单
   */
  const cancelOrder = useCallback((id: string) => {},[])

  return [
    {
      ...res,
      data: res.data?.reduce((acc, cur) => {
        return [...acc, ...cur];
      }, []),
    },
    {
      cancelAllOrders,
      updateOrder,
      cancelOrder,
    },
  ];
};
