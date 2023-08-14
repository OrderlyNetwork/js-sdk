import { usePrivateInfiniteQuery } from "../usePrivateInfiniteQuery";
import { type SWRInfiniteResponse } from "swr/infinite";
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
    (pageIndex: number,previousPageData) => {
      // TODO: 检查是否有下一页
      // if(previousPageData){
      //
      //   const {meta} = previousPageData;
      // }
      const search = new URLSearchParams([['size', '100'],['page', `${pageIndex + 1}`],[`status`, status]]);
      if (symbol) {
        search.set(`symbol`, symbol);
      }
     return `/orders?${search.toString()}`
    },
    {
      initialSize: 1,
    }
  );

  return {
    ...res,
    data:res.data?.reduce((acc,cur)=>[...acc,...cur.rows],[]),
  };
};
