import { useMemo } from "react";
import { usePrivateInfiniteQuery } from "@orderly.network/hooks";
import { generateKeyFun } from "../utils/swr";

type Params = {
  /** default is 10 */
  size?: number;
  /** YYYY-MM-dd */
  startDate?: string;
  /** YYYY-MM-dd */
  endDate?: string;
  initialSize?: number;
  page?: number;
};

type ReferralHistoryItem = {
  account_id: string;
  user_address: string;
  referral_code: string;
  volume: number;
  referral_rebate: number;
  date: string;
};

type ReferralHistoryPageResponse = {
  rows: ReferralHistoryItem[];
  meta?: {
    total: number;
    records_per_page: number;
    current_page: number;
  };
};

export const useReferralHistory = (params: Params) => {
  const { size = 10, startDate, endDate, initialSize, page } = params;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const response: ReturnType<typeof usePrivateInfiniteQuery<any>> =
    usePrivateInfiniteQuery<any>(
      generateKeyFun({
        path: "/v1/referral/referral_history",
        size,
        startDate,
        endDate,
        page,
      }),
      {
        initialSize,
        formatter: (data) => data,
        revalidateOnFocus: true,
      },
    );

  const loadMore = () => {
    response.setSize(response.size + 1);
  };

  const meta = useMemo(():
    | {
        total: number;
        records_per_page: number;
        current_page: number;
      }
    | undefined => {
    return response.data?.[0]?.meta;
  }, [response.data]);

  const total = useMemo(() => {
    return meta?.total || 0;
  }, [meta]);

  const flattenRows = useMemo((): ReferralHistoryItem[] | null => {
    if (!response.data) {
      return null;
    }
    return response.data
      .map((item: ReferralHistoryPageResponse) => item.rows)
      .flat();
  }, [response.data]);

  return [
    flattenRows,
    {
      total,
      isLoading: response.isLoading,
      refresh: response.mutate,
      loadMore,
      meta,
    },
  ] as const;
};
