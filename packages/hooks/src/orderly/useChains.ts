// interface

import { type API } from "@orderly.network/types";
import { useCallback, useContext, useMemo } from "react";
import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { OrderlyContext } from "../orderlyContext";
import { useQuery } from "../useQuery";

type inputOptions = {
  filter?: (item: API.Chain) => boolean;
  pick?: "dexs" | "network_infos" | "token_infos";
  crossEnabled?: boolean;
  wooSwapEnabled?: boolean;
};

export const useChains = (
  networkId?: "testnet" | "mainnet",

  options: inputOptions & SWRConfiguration = {}
) => {
  const { filter, pick, crossEnabled, wooSwapEnabled, ...swrOptions } = options;
  const { configStore } = useContext(OrderlyContext);

  const field = options?.pick;

  const { data } = useSWR<any>(
    // () =>
    //   wooSwapEnabled
    //     ? `${configStore.get("swapSupportApiUrl")}/swap_support`
    //     : null,
    `${configStore.get("swapSupportApiUrl")}/swap_support`,
    (url) => fetch(url).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...swrOptions,
    }
  );

  const { data: orderlyChains } = useQuery<API.Chain[]>("/v1/public/token");

  // console.log(orderlyChains);

  const chains = useMemo(() => {
    // 不需要跨链入金
    // if (!wooSwapEnabled) {
    //   if (!orderlyChains) return orderlyChains;
    //   console.log({ orderlyChains });
    // } else {
    //
    if (!data || !data.data || !orderlyChains) return data;

    // console.log(data.data, orderlyChains);

    let testnetArr: API.Chain[] = [];
    let mainnetArr: API.Chain[] = [];

    Object.keys(data.data).forEach((key) => {
      const item = { ...data.data[key], name: key, priority: 1 };

      if (typeof options?.filter === "function") {
        if (!options.filter(item)) return;
      }

      if (item.network_infos.mainnet) {
        mainnetArr.push(field ? item[field] : item);
      } else {
        testnetArr.push(field ? item[field] : item);
      }
    });

    // if (networkId === "mainnet") {
    //   testnetArr = testnetArr.filter((item) => item.network_infos.mainnet);
    // }

    // if (networkId === "testnet") {
    //   testnetArr = testnetArr.filter((item) => !item.network_infos.mainnet);
    // }

    // if (typeof field !== "undefined") {
    //   return testnetArr.map((item) => {
    //     return item[field];
    //   });
    // }

    if (networkId === "mainnet") {
      return mainnetArr;
    }

    if (networkId === "testnet") {
      return testnetArr;
    }

    return {
      testnet: testnetArr,
      mainnet: mainnetArr,
    };
    // }
  }, [data, networkId, field, options, orderlyChains, wooSwapEnabled]);

  const findByChainId = useCallback(
    (chainId: string) => {
      if (!data || !data.data) return undefined;

      return data.data[chainId];
    },
    [data]
  );

  return [chains, { findByChainId }];
};
