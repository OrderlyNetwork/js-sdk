import { useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { getGlobalObject } from "@orderly.network/utils";
import { useAppStore } from "./orderly/appStore";
import { OrderlyContext } from "./orderlyContext";
import { useMainnetChainsStore } from "./provider/store/chainInfoMainStore";
import { useTestnetChainsStore } from "./provider/store/chainInfoTestStore";
import { useMainTokenStore } from "./provider/store/mainTokenStore";
import { useSwapSupportStore } from "./provider/store/swapSupportStore";
import { useSymbolStore } from "./provider/store/symbolStore";
import { useTestTokenStore } from "./provider/store/testTokenStore";

export const usePreLoadData = () => {
  const [timestampOffsetInitialized, setTimestampOffsetInitialized] =
    useState(false);

  const { configStore } = useContext(OrderlyContext);

  const env = configStore.get("env");
  const apiBaseUrl = configStore.get("apiBaseUrl");

  const urlPrefix =
    env === "prod"
      ? "https://testnet-api.orderly.org"
      : configStore.get("apiBaseUrl");

  // Optimize store selectors using Zustand's select to only get fetchData methods
  // This prevents unnecessary re-renders when other store state changes
  const fetchMainTokens = useMainTokenStore((state) => state.fetchData);
  const fetchTestTokens = useTestTokenStore((state) => state.fetchData);
  const fetchMainChains = useMainnetChainsStore((state) => state.fetchData);
  const fetchTestChains = useTestnetChainsStore((state) => state.fetchData);
  const fetchSymbols = useSymbolStore((state) => state.fetchData);
  const fetchSwapSupport = useSwapSupportStore((state) => state.fetchData);
  const setTokensInfo = useAppStore((state) => state.actions.setTokensInfo);

  const mainTokenInfo = useMainTokenStore((state) => state.data);
  const testTokenInfo = useTestTokenStore((state) => state.data);
  const swapSupportInfo = useSwapSupportStore((state) => state.data);

  useEffect(() => {
    fetchMainTokens();
    fetchSymbols(apiBaseUrl).then((symbols) => {
      // console.info("Symbols loaded:", symbols);
    });
    fetchMainChains(undefined, {
      brokerId: configStore.get("brokerId"),
    });
  }, []);

  useEffect(() => {
    if (!urlPrefix) return;
    fetchTestTokens(urlPrefix);
    fetchTestChains(urlPrefix, {
      brokerId: configStore.get("brokerId"),
    });
  }, [urlPrefix]);

  useEffect(() => {
    if (!mainTokenInfo || !testTokenInfo) return;

    setTokensInfo(env === "prod" ? mainTokenInfo : testTokenInfo);
  }, [mainTokenInfo, testTokenInfo]);

  useEffect(() => {
    if (swapSupportInfo) return;
    fetchSwapSupport();
  }, [swapSupportInfo]);

  const { data: systemInfo } = useSWR(
    "/v1/public/system_info",
    async (url: string, init?: RequestInit) => {
      const data = await fetch(
        url.startsWith("http") ? url : `${apiBaseUrl}${url}`,
        init,
      );
      return await data.json();
    },
    {
      errorRetryCount: 3,
      errorRetryInterval: 500,
    },
  );

  useEffect(() => {
    if (timestampOffsetInitialized) return;
    if (typeof systemInfo !== "undefined") {
      const serverTimestamp = systemInfo.timestamp;
      const localTimestamp = Date.now();
      // Calculate the difference between server and local time
      const timestampOffset = serverTimestamp - localTimestamp;

      if (isNaN(timestampOffset)) {
        return;
      }

      // Store the offset globally for use in API calls
      (
        getGlobalObject() as Record<string, unknown>
      ).__ORDERLY_timestamp_offset = timestampOffset;
      setTimestampOffsetInitialized(true);
    }
  }, [systemInfo, timestampOffsetInitialized]);

  const isDone = useMemo(() => {
    return timestampOffsetInitialized;
  }, [timestampOffsetInitialized]);

  return {
    error: null,
    done: isDone,
  };
};
