import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { API, AssetHistoryStatusEnum } from "@orderly.network/types";
import { useEventEmitter } from "../../useEventEmitter";
import { usePrivateQuery } from "../../usePrivateQuery";

type AssetHistoryOptions = {
  /** token name you want to search */
  token?: string;
  /** DEPOSIT、WITHDRAW, all */
  side?: string;
  status?: AssetHistoryStatusEnum;
  /** start time in milliseconds */
  startTime?: number;
  /** end time in milliseconds */
  endTime?: number;
  page?: number;
  pageSize?: number;
};

/**
 * Get asset history, including token deposits/withdrawals.
 * https://orderly.network/docs/build-on-omnichain/evm-api/restful-api/private/get-asset-history#get-asset-history
 */
export const useAssetsHistory = (
  options: AssetHistoryOptions,
  /**
   * if subscribe, the data will be updated when wallet changed
   * @default true
   * */
  subscribe = true,
) => {
  const ee = useEventEmitter();

  const getKey = () => {
    const {
      page = 1,
      pageSize = 10,
      token,
      side,
      status,
      startTime,
      endTime,
    } = options;
    const searchParams = new URLSearchParams();

    searchParams.set("page", page.toString());
    searchParams.set("size", pageSize.toString());

    if (token) {
      searchParams.set("token", token);
    }

    if (side && side !== "All") {
      searchParams.set("side", side);
    }

    if (status) {
      searchParams.set("status", status);
    }

    if (startTime) {
      searchParams.set("start_t", startTime.toString());
    }

    if (endTime) {
      searchParams.set("end_t", endTime.toString());
    }

    return `/v1/asset/history?${searchParams.toString()}`;
  };

  const { data, isLoading, mutate } = usePrivateQuery<API.AssetHistory>(
    getKey(),
    {
      formatter: (data) => data,
      revalidateOnFocus: false,
      errorRetryInterval: 60 * 1000,
    },
  );

  const updateList = useDebouncedCallback(
    (data: any) => {
      // TODO: update by side
      mutate();
    },
    // delay in ms
    300,
  );

  useEffect(() => {
    if (subscribe) {
      ee.on("wallet:changed", updateList);
    }

    return () => {
      if (subscribe) {
        ee.off("wallet:changed", updateList);
      }
    };
  }, [subscribe]);

  return [
    data?.rows || [],
    {
      meta: data?.meta,
      isLoading,
    },
  ] as const;
};
