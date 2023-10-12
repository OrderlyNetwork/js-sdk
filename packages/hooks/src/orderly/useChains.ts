import { type API } from "@orderly.network/types";
import { useCallback, useContext, useMemo, useRef } from "react";
import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { OrderlyContext } from "../orderlyContext";
import { useQuery } from "../useQuery";
import { ChainConfig } from "@orderly.network/types";
import { chainsMap } from "@orderly.network/types";
import { prop } from "ramda";

type inputOptions = {
  filter?: (item: API.Chain) => boolean;
  pick?: "dexs" | "network_infos" | "token_infos";
  crossEnabled?: boolean;
  wooSwapEnabled?: boolean; // if true, use wooSwap api, else use orderly api only
};

export const useChains = (
  networkId?: "testnet" | "mainnet",
  options: inputOptions & SWRConfiguration = {}
) => {
  const { filter, pick, crossEnabled, wooSwapEnabled, ...swrOptions } = options;
  const { configStore } = useContext(OrderlyContext);

  const field = options?.pick;

  const map = useRef(new Map<number, API.Chain>());

  const { data, error: swapSupportError } = useSWR<any>(
    () =>
      wooSwapEnabled
        ? `${configStore.get("swapSupportApiUrl")}/swap_support`
        : null,
    // `${configStore.get("swapSupportApiUrl")}/swap_support`,
    (url) => fetch(url).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...swrOptions,
    }
  );

  const { data: orderlyChains, error: tokenError } =
    useQuery<API.Chain[]>("/v1/public/token");

  // console.log(orderlyChains);

  const chains = useMemo(() => {
    if (!orderlyChains) return undefined;

    const orderlyChainsArr: API.Chain[] = [];
    const orderlyChainIds = new Set<number>();

    orderlyChains.forEach((item) => {
      item.chain_details.forEach((chain: any) => {
        const chainId = Number(chain.chain_id);
        orderlyChainIds.add(chainId);
        // const chainInfo = chainsMap.get(chainId);

        const _chain: any = {
          network_infos: {
            // name: chainInfo?.chainName ?? "--",
            name: chain.chain_name ?? "--",
            // "public_rpc_url": "https://arb1.arbitrum.io/rpc",
            chain_id: chainId,
            // decimals: chain.decimals,
            // contract_address: chain.contract_address,
            bridgeless: true,
          },
          token_infos: [
            {
              symbol: item.token,
              address: chain.contract_address,
              decimals: chain.decimals,
            },
          ],
        };

        if (typeof options?.filter === "function") {
          if (!options.filter(_chain)) return;
        }

        map.current.set(chainId, _chain);

        orderlyChainsArr.push(field ? _chain[field] : _chain);
      });
    });

    if (!wooSwapEnabled) {
      return orderlyChainsArr;
    } else {
      //
      if (!data || !data.data) return data;

      let testnetArr: API.Chain[] = [];
      let mainnetArr: API.Chain[] = [];

      Object.keys(data.data).forEach((key) => {
        if (orderlyChainIds.has(data.data[key].network_infos.chain_id)) return;

        const item = {
          ...data.data[key],
          name: key,
        };

        if (item.token_infos?.length === 0) return;

        map.current.set(item.network_infos.chain_id, item);

        if (typeof options?.filter === "function") {
          if (!options.filter(item)) return;
        }

        if (item.network_infos.mainnet) {
          mainnetArr.push(field ? item[field] : item);
        } else {
          testnetArr.push(field ? item[field] : item);
        }
      });

      if (orderlyChainIds.size > 0) {
        testnetArr = [...orderlyChainsArr, ...testnetArr];
        // mainnetArr = mainnetArr.concat(orderlyChainsArr);
      }

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
    }
  }, [data, networkId, field, options, orderlyChains, wooSwapEnabled]);

  const findByChainId = useCallback(
    (chainId: number, field?: string) => {
      const chain = map.current.get(chainId);

      if (typeof field === "string") {
        return prop(field, chain);
      }

      return chain;
    },
    [chains, map.current]
  );

  return [chains, { findByChainId, error: swapSupportError || tokenError }];
};
