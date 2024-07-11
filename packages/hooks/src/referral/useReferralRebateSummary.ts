import { generateKeyFun } from "./swr";
import { useMemo } from "react";
import { RefferalAPI } from "./api";
import { usePrivateInfiniteQuery } from "../usePrivateInfiniteQuery";

type Params = {
  //** default is 10 */
  size?: number;
  //** YYYY-MM-dd */
  startDate?: string;
  //** YYYY-MM-dd */
  endDate?: string;
  //** default is 1 */
  initialSize?: number;
};

export const useReferralRebateSummary = (params: Params) => {
  const { size = 10, startDate, endDate, initialSize } = params;

  const response = usePrivateInfiniteQuery<any>(
    generateKeyFun({
      path: "/v1/referral/rebate_summary",
      size,
      startDate,
      endDate,
    }),
    {
      initialSize: initialSize,
      // revalidateFirstPage: false,
      // onError: (err) => {
      //   console.error("fetch failed::::", err);
      // },
      formatter: (data) => data,
      revalidateOnFocus: false,
    }
  );

  const loadMore = () => {
    response.setSize(response.size + 1);
  };

  const total = useMemo(() => {
    return response.data?.[0]?.meta?.total || 0;
  }, [response.data?.[0]?.meta?.total]);

  const flattenOrders = useMemo(():
    | RefferalAPI.ReferralRebateSummary[]
    | null => {
    if (!response.data) {
      return null;
    }

    return response.data?.map((item) => item.rows)?.flat();
  }, [response.data]);

  return [
    flattenOrders,
    {
      total,
      isLoading: response.isLoading,
      refresh: response.mutate,
      loadMore,
    },
  ];
};
