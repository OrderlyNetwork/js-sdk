import { API } from "@orderly.network/types";
import { SWRInfiniteResponse } from "swr/infinite";
import { usePrivateInfiniteQuery } from "../../usePrivateInfiniteQuery";
import { usePrivateQuery } from "../../usePrivateQuery";
import { useEventEmitter } from "../../useEventEmitter";
import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

/**
 * @deprecated use @orderly.network/types AssetHistoryStatusEnum
 */
export enum AssetHistoryStatusEnum {
  NEW = "NEW",
  CONFIRM = "CONFIRM",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  PENDING_REBALANCE = "PENDING_REBALANCE",
}

const useAssetsHistory = (options: {
  // token?: string;
  side?: string;
  // status?: AssetHistoryStatusEnum;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}) => {
  const { page = 1, pageSize = 10 } = options;
  const ee = useEventEmitter();

  const getKey = () => {
    // if (previousPageData && !previousPageData.length) return null;
    const searchParams = new URLSearchParams();

    searchParams.set("page", page.toString());
    searchParams.set("size", pageSize.toString());

    // if (options.token) searchParams.set("token", options.token);
    if (options.side && options.side !== "All")
      searchParams.set("side", options.side);
    // if (options.status) searchParams.set("status", options.status);
    if (options.startTime) searchParams.set("start_t", options.startTime);
    if (options.endTime) searchParams.set("end_t", options.endTime);

    return `/v1/asset/history?${searchParams.toString()}`;
  };

  const { data, isLoading, mutate } = usePrivateQuery<API.AssetHistory>(
    getKey(),
    {
      formatter: (data) => data,
      revalidateOnFocus: false,
      errorRetryInterval: 60 * 1000,
    }
  );
  const updateList = useDebouncedCallback(
    (data: any) => {
      mutate();
    },
    // delay in ms
    300
  );

  useEffect(() => {
    ee.on("wallet:changed", updateList);

    return () => {
      ee.off("wallet:changed", updateList);
    };
  }, []);

  return [
    data?.rows || [],
    {
      meta: data?.meta,
      isLoading,
    },
  ] as const;
};

export { useAssetsHistory };
