import { useMemo } from "react";
import { useConfig, useQuery, useSWR } from ".";
import { request } from "@orderly.network/net/src/fetch";
import { getGlobalObject } from "@orderly.network/utils";

export const usePreLoadData = () => {
  const { error: tokenError, data: tokenData } = useQuery(
    "https://api-evm.orderly.org/v1/public/token",
    {
      revalidateOnFocus: false,
    }
  );

  /// get service timestamp
  /// get local timestamp
  /// calculate delta offset = SD - LD
  /// save to getGlobalObject.__ORDERLY_timestamp_offset

  const apiBaseUrl = useConfig("apiBaseUrl");

  const { data: systemInfo } = useSWR(
    "/v1/public/system_info",
    async (url: any, init: any) => {
      const data = await fetch(
        url.startsWith("http") ? url : `${apiBaseUrl}${url}`,
        init
      );
      return await data.json();
    },
    {
      errorRetryCount: 3,
      errorRetryInterval: 500,
    }
  );

  if (typeof systemInfo !== "undefined") {
    const sd = systemInfo.timestamp;
    const ld = Date.now();
    // @ts-ignore
    getGlobalObject().__ORDERLY_timestamp_offset = sd - ld;
  }

  // @ts-ignore
  console.log(
    "systemInfo",
    systemInfo,
    getGlobalObject().__ORDERLY_timestamp_offset
  );

  const isDone = useMemo(() => {
    return !!tokenData;
  }, [tokenData]);

  return {
    error: tokenError,
    done: isDone,
  };
};
