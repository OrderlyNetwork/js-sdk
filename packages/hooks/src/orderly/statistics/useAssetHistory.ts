import { useMemo } from "react";

import { usePrivateInfiniteQuery } from "../../usePrivateInfiniteQuery";
import { API } from "@orderly.network/types";
import { SWRInfiniteResponse } from "swr/infinite";

const useAssetsHistory = (options: {
  token?: string;
  side?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  size?: number;
}): [
  API.AssetHistoryRow[],
  {
    meta?: API.AssetHistoryMeta;
  } & Pick<SWRInfiniteResponse, "size" | "setSize" | "isLoading">
] => {
  const queryStr = useMemo(() => {
    return "";
  }, []);

  const getKey = () => {
    return `/v1/asset/history`;
  };

  const { data, setSize, size, isLoading } = usePrivateInfiniteQuery<any>(
    getKey,
    {
      formatter: (data) => data,
    }
  );

  return [
    data?.map((d) => d.rows) || [],
    {
      meta: (data as any)?.[0]?.["meta"] || {},
      isLoading,
      size,
      setSize,
    },
  ];
};

export { useAssetsHistory };
