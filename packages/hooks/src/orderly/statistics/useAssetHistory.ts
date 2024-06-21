import { useMemo } from "react";

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
  token?: string;
  side?: string;
  status?: AssetHistoryStatusEnum;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}): [
  API.AssetHistoryRow[],
  {
    meta?: API.AssetHistoryMeta;
  } & Pick<SWRInfiniteResponse, "size" | "setSize" | "isLoading">
] => {
  const { page = 1, pageSize = 10 } = options;

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null;
    const searchParams = new URLSearchParams();

    searchParams.set("page", (pageIndex + 1).toString());
    searchParams.set("size", pageSize.toString());

    if (options.token) searchParams.set("token", options.token);
    if (options.side) searchParams.set("side", options.side);
    if (options.status) searchParams.set("status", options.status);
    if (options.startTime) searchParams.set("start_t", options.startTime);
    if (options.endTime) searchParams.set("end_t", options.endTime);

    return `/v1/asset/history?${searchParams.toString()}`;
  };

  const { data, setSize, size, isLoading } = usePrivateInfiniteQuery<any>(
    getKey,
    {
      formatter: (data) => data,
    }
  );

  const rows = data?.map((d) => d.rows) || [];

  return [
    rows.length ? rows[size - 1] : [],
    {
      meta: (data as any)?.[0]?.["meta"] || {},
      isLoading,
      size,
      setSize,
    },
  ];
};

export { useAssetsHistory };
