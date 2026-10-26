import { useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { get } from "@orderly.network/net";
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

  const { configStore, enableSwapDeposit } = useContext(OrderlyContext);

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
    if (swapSupportInfo || !enableSwapDeposit) return;
    fetchSwapSupport();
  }, [swapSupportInfo, enableSwapDeposit]);

  const { data: systemInfo, mutate: refreshSystemInfo } = useSWR(
    "/v1/public/system_info",
    async (url: string, init?: RequestInit) => {
      // Use the same arrival-time calibration as every other net request.
      // Calling net directly keeps bootstrap independent of timestamp-waiting
      // query middleware.
      const data = await get(
        url.startsWith("http") ? url : `${apiBaseUrl}${url}`,
        init,
      );
      const offset = (getGlobalObject() as Record<string, unknown>)
        .__ORDERLY_timestamp_offset;
      if (typeof offset !== "number" || !Number.isFinite(offset)) {
        // Rejected samples (e.g. a slow first response) must be retried rather
        // than leaving private requests waiting for an offset indefinitely.
        throw new Error("Failed to initialize server timestamp offset");
      }
      return data;
    },
    {
      errorRetryCount: 3,
      errorRetryInterval: 500,
      // Focus uses an explicit mutation below: SWR's focus throttle reads
      // Date.now(), which can suppress revalidation after a backwards jump.
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      typeof window.addEventListener !== "function" ||
      typeof document.addEventListener !== "function"
    ) {
      return;
    }
    let pending: Promise<unknown> | undefined;
    let stopped = false;
    const refreshOnFocus = () => {
      if (stopped || document.visibilityState !== "visible" || pending) return;
      // Bound mutate() invalidates SWR's deduplication markers. A new sample is
      // required even if the last response arrived just before the clock jump.
      pending = refreshSystemInfo()
        .catch(() => undefined)
        .finally(() => {
          pending = undefined;
        });
    };
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      stopped = true;
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [refreshSystemInfo]);

  useEffect(() => {
    if (timestampOffsetInitialized) return;
    if (typeof systemInfo !== "undefined") {
      const offset = (getGlobalObject() as Record<string, unknown>)
        .__ORDERLY_timestamp_offset;
      if (typeof offset !== "number" || !Number.isFinite(offset)) {
        return;
      }
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
