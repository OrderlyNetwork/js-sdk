import { NetworkId, type API, chainsInfoMap } from "@orderly.network/types";
import { useCallback, useContext, useMemo, useRef } from "react";
import useSWR, { SWRConfiguration } from "swr";
import { OrderlyContext } from "../orderlyContext";
import { useQuery } from "../useQuery";
import { mergeDeepRight, prop } from "ramda";
import { nativeTokenAddress } from "../woo/constants";
import { isTestnet } from "@orderly.network/utils";
import { TestnetChains } from "@orderly.network/types";

type inputOptions = {
  filter?: (item: API.Chain) => boolean;
  pick?: "dexs" | "network_infos" | "token_infos";
  crossEnabled?: boolean;
  /** if true, use wooSwap api, else use orderly api only  */
  wooSwapEnabled?: boolean;
};

export const useChains = (
  networkId?: NetworkId,
  options: inputOptions & SWRConfiguration = {}
) => {
  const { pick, crossEnabled, wooSwapEnabled, ...swrOptions } = options;
  const { configStore } = useContext(OrderlyContext);

  const field = options?.pick;

  const filterFun = useRef(options?.filter);
  filterFun.current = options?.filter;

  const map = useRef(
    new Map<
      number,
      API.Chain & {
        nativeToken?: API.TokenInfo;
      }
    >()
  );

  const commonSwrOpts = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    // If false, undefined data gets cached against the key.
    revalidateOnMount: true,
    // dont duplicate a request w/ same key for 1hr
    dedupingInterval: 3_600_000,
    ...swrOptions,
  };

  const { data: wooSupportData, error: swapSupportError } = useSWR<any>(
    () =>
      wooSwapEnabled
        ? `${configStore.get("swapSupportApiUrl")}/swap_support`
        : null,
    (url) => fetch(url).then((res) => res.json()),
    { ...commonSwrOpts, ...swrOptions }
  );

  const { data: chainInfos, error: chainInfoErr } = useQuery(
    "/v1/public/chain_info",
    {
      ...commonSwrOpts,
      formatter: (data) => data.rows,
    }
  );

  const { data: orderlyChains, error: tokenError } = useQuery<API.Chain[]>(
    "https://api-evm.orderly.org/v1/public/token",
    { ...commonSwrOpts }
  );

  const chains:
    | API.Chain[]
    | {
        testnet: API.Chain[];
        mainnet: API.Chain[];
      } = useMemo(() => {
    let orderlyChainsArr: API.Chain[] = [];
    const orderlyChainIds = new Set<number>();

    orderlyChains?.forEach((item) => {
      item.chain_details.forEach((chain: any) => {
        const chainId = Number(chain.chain_id);
        orderlyChainIds.add(chainId);
        const chainInfo = chainsInfoMap.get(chainId);

        const _chain: any = {
          network_infos: {
            name: chain.chain_name ?? chainInfo?.chainName ?? "--",
            // "public_rpc_url": "https://arb1.arbitrum.io/rpc",
            chain_id: chainId,
            withdrawal_fee: chain.withdrawal_fee,
            cross_chain_withdrawal_fee: chain.cross_chain_withdrawal_fee,

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

        if (typeof filterFun.current === "function") {
          if (!filterFun.current(_chain)) return;
        }

        /// if chain is testnet, update network_infos
        if (isTestnet(_chain.chain_id)) {
          const index = testnetArr?.findIndex((item) =>
            isTestnet(item.network_infos.chain_id)
          );
          if (index > -1) {
            testnetArr[index] = _chain;
          }
        }

        map.current.set(chainId, _chain);

        orderlyChainsArr.push(_chain);
      });
    });

    let testnetArr = [...TestnetChains] as API.Chain[];

    testnetArr.forEach((chain) => {
      map.current.set(chain.network_infos?.chain_id, chain as any);
    });

    let mainnetArr: API.Chain[] = [];

    if (wooSwapEnabled) {
      if (!wooSupportData || !wooSupportData.data) return wooSupportData;

      Object.keys(wooSupportData.data).forEach((key) => {
        // if (orderlyChainIds.has(data.data[key].network_infos.chain_id)) return;

        const chain = wooSupportData.data[key];

        const item: any = mergeDeepRight(chain, {
          name: key,
          network_infos: {
            bridgeless: orderlyChainIds.has(chain.network_infos.chain_id),
            shortName: key,
          },
          token_infos: chain.token_infos.filter(
            (token: API.TokenInfo) => !!token.swap_enable
          ),
        });

        if (item.token_infos?.length === 0) return;

        map.current.set(item.network_infos.chain_id, item);

        if (typeof filterFun.current === "function") {
          if (!filterFun.current(item)) return;
        }

        if (item.network_infos.mainnet) {
          mainnetArr.push(item);
        } else {
          testnetArr.push(item);
        }
      });
    } else {
      // orderly chains array form (/v1/public/token) api
      orderlyChainsArr.forEach((chain) => {
        let _chain = chain;

        const networkInfo = chainInfos?.find((item: { chain_id: any }) => {
          return item.chain_id == chain.network_infos.chain_id;
        });

        // update network_infos by chain_info api(v1/public/chain_info)
        if (networkInfo) {
          const {
            name,
            public_rpc_url,
            chain_id,
            currency_symbol,
            explorer_base_url,
          } = networkInfo;
          _chain.network_infos = {
            ..._chain.network_infos,
            name: name,
            shortName: name,
            public_rpc_url: public_rpc_url,

            currency_symbol: currency_symbol,
            bridge_enable: true,
            mainnet: true,
            explorer_base_url: explorer_base_url,
            est_txn_mins: null,
            woofi_dex_cross_chain_router: "",
            woofi_dex_depositor: "",
          };
        }

        map.current.set(_chain.network_infos.chain_id, _chain);
        if (isTestnet(_chain.network_infos.chain_id)) {
          const index = testnetArr.findIndex((item) =>
            isTestnet(item.network_infos.chain_id)
          );
          if (index > -1) {
            testnetArr[index] = _chain;
          }
        }

        if (typeof filterFun.current === "function") {
          if (!filterFun.current(_chain)) return;
        }

        mainnetArr.push(_chain);
      });
    }

    mainnetArr.sort((a, b) => {
      return a.network_infos.bridgeless ? -1 : 1;
    });

    testnetArr.sort((a, b) => {
      return a.network_infos.bridgeless ? -1 : 1;
    });

    if (!!field) {
      //@ts-ignore
      testnetArr = testnetArr.map((item) => item[field]);
      //@ts-ignore
      mainnetArr = mainnetArr.map((item) => item[field]);
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
  }, [
    wooSupportData,
    networkId,
    field,
    orderlyChains,
    wooSwapEnabled,
    chainInfos,
  ]);

  const findByChainId = useCallback(
    (chainId: number, field?: string) => {
      const chain = map.current.get(chainId);

      if (chain) {
        chain.nativeToken =
          chain.token_infos?.find(
            (item) => item.address === nativeTokenAddress
          ) ||
          ({
            symbol: chain.network_infos?.currency_symbol,
          } as any);
      }

      if (typeof field === "string") {
        return prop(field as never, chain);
      }

      return chain;
    },
    [chains, map.current]
  );

  // const findNativeTokenByChainId = useCallback(
  //   (chainId: number): API.TokenInfo | undefined => {
  //     const chain = findByChainId(chainId);
  //     if (!chain) return;
  //
  //   },
  //   [chains]
  // );

  return [
    chains,
    {
      findByChainId,
      // findNativeTokenByChainId,
      error: swapSupportError || tokenError,
      // nativeToken,
    },
  ] as const;
};
