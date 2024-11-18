import { useEffect, useMemo, useState } from "react";
import { useConfig, useQuery, useSWR } from ".";
import { getGlobalObject } from "@orderly.network/utils";

export const usePreLoadData = () => {
  const [timestampOffsetInitialized, setTimestampOffsetInitialized] =
    useState(false);
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

  useEffect(() => {
    if (timestampOffsetInitialized) return;
    if (typeof systemInfo !== "undefined") {
      const sd = systemInfo.timestamp;
      const ld = Date.now();
      // @ts-ignore
      const diff = sd - ld;
      if (isNaN(diff)) {
        return;
      }
      (getGlobalObject() as any).__ORDERLY_timestamp_offset = diff;
      setTimestampOffsetInitialized(true);
    }
  }, [systemInfo, timestampOffsetInitialized]);

  const isDone = useMemo(() => {
    return !!tokenData && timestampOffsetInitialized;
  }, [timestampOffsetInitialized, tokenData]);

  return {
    error: tokenError,
    done: isDone,
  };
};
