// interface

import { type API } from "@orderly.network/types";
import { useCallback, useMemo } from "react";
import useSWR, { SWRResponse } from "swr";

type inputOptions = {
  filter?: (item: API.Chain) => boolean;
  pick?: "dexs" | "network_infos" | "token_infos";
};

export const useChains = (
  networkId?: "testnet" | "mainnet",

  options?: inputOptions
) => {
  const field = options?.pick;

  const { data } = useSWR<any>(
    "https://fi-api.woo.org/swap_support",
    (url) => fetch(url).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const chains = useMemo(() => {
    if (!data || !data.data) return data;

    let arr: API.Chain[] = [];

    Object.keys(data.data).forEach((key) => {
      const item = data.data[key];
      arr.push({
        ...item,
        name: key,
      });
    });

    if (networkId === "mainnet") {
      arr = arr.filter((item) => item.network_infos.mainnet);
    }

    if (networkId === "testnet") {
      arr = arr.filter((item) => !item.network_infos.mainnet);
    }

    if (typeof options?.filter === "function") {
      arr = arr.filter(options.filter);
    }

    if (typeof field !== "undefined") {
      return arr.map((item) => {
        return item[field];
      });
    }

    return arr;
  }, [data, networkId, field, options]);

  const findByChainId = useCallback(
    (chainId: string) => {
      if (!data || !data.data) return undefined;

      return data.data[chainId];
    },
    [data]
  );

  return [chains, { findByChainId }];
};
