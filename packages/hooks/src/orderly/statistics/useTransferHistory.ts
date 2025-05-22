import React from "react";
import { API } from "@orderly.network/types";
import { usePrivateQuery } from "../../usePrivateQuery";
import { useSymbolsInfo } from "../useSymbolsInfo";

interface TransferHistorySearchParams {
  dataRange?: number[];
  page: number;
  size: number;
  fromId: string;
  toId: string;
  side: "IN" | "OUT";
  mainSubOnly?: boolean;
}

export const useTransferHistory = (parmas: TransferHistorySearchParams) => {
  const { dataRange, page, size, side, fromId, toId, mainSubOnly } = parmas;

  const infos = useSymbolsInfo();

  const memoizedQueryKey = React.useMemo<string>(() => {
    const search = new URLSearchParams();
    search.set("page", page.toString());
    search.set("size", size.toString());
    search.set("side", side);
    // search.set("from_account_id", fromId);
    // search.set("to_account_id", toId);
    if (typeof mainSubOnly === "boolean") {
      search.set("main_sub_only", mainSubOnly.toString());
    }
    if (dataRange) {
      search.set("start_t", dataRange[0].toString());
      search.set("end_t", dataRange[1].toString());
    }
    return `/v1/internal_transfer_history?${search.toString()}`;
  }, [page, size, fromId, toId, dataRange]);

  const { data, isLoading } = usePrivateQuery<API.TransferHistory>(
    memoizedQueryKey,
    {
      // initialSize: 1,
      formatter: (data) => data,
      revalidateOnFocus: false,
      errorRetryCount: 3,
    },
  );

  const parsedData = React.useMemo<API.TransferHistoryRow[]>(() => {
    if (!Array.isArray(data?.rows) || !data?.rows.length || infos.isNil) {
      return [];
    }
    return data.rows;
  }, [data, infos]);

  return [parsedData, { meta: data?.meta, isLoading }] as const;
};

export type UseTransferHistoryReturn = ReturnType<typeof useTransferHistory>;
