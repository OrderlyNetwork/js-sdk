import { API } from "@orderly.network/types";
import { SWRInfiniteResponse } from "swr/infinite";
import { usePrivateInfiniteQuery } from "../../usePrivateInfiniteQuery";
import { usePrivateQuery } from "../../usePrivateQuery";

export enum AssetHistoryStatusEnum {
  NEW = "new",
  CONFIRM = "confirm",
  PROCESSING = "processing",
  COMPLETED = "completed",
  PENDDING = "pendding",
  PENDING_REBALANCE = "pending_rebalance",
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

  const { data, isLoading } = usePrivateQuery<API.AssetHistory>(getKey(), {
    formatter: (data) => data,
    revalidateOnFocus: false,
  });

  return [
    data?.rows || [],
    {
      meta: data?.meta,
      isLoading,
    },
  ] as const;
};

export { useAssetsHistory };
