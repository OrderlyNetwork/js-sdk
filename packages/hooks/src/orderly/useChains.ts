import { NetworkId, type API, chainsInfoMap } from "@orderly.network/types";
import { useCallback, useContext, useMemo, useRef } from "react";
import useSWR, { SWRConfiguration } from "swr";
import { OrderlyContext } from "../orderlyContext";
import { useQuery } from "../useQuery";
import { mergeDeepRight, prop } from "ramda";
import { nativeTokenAddress } from "../woo/constants";

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
  const { filter, pick, crossEnabled, wooSwapEnabled, ...swrOptions } = options;
  const { configStore, networkId: networkEnv } = useContext(OrderlyContext);

  // const envNetworkId = useConfig("networkId");

  const field = options?.pick;
  // const wooSwapEnabled = false;

  const map = useRef(
    new Map<
      number,
      API.Chain & {
        nativeToken?: API.TokenInfo;
      }
    >()
  );

  const { data, error: swapSupportError } = useSWR<any>(
    () =>
      wooSwapEnabled
        ? `${configStore.get("swapSupportApiUrl")}/swap_support`
        : null,
    // `${configStore.get("swapSupportApiUrl")}/swap_support`,
    (url) => fetch(url).then((res) => res.json()),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true, // If false, undefined data gets cached against the key.
      dedupingInterval: 3_600_000, // dont duplicate a request w/ same key for 1hr
      ...swrOptions,
    }
  );

  const { data: chainInfos, error: chainInfoErr } = useQuery(
    "/v1/public/chain_info",
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      dedupingInterval: 3_600_000,
      formatter: (data) => data.rows,
    }
  );

  const { data: orderlyChains, error: tokenError } = useQuery<API.Chain[]>(
    // wooSwapEnabled ? "/v1/public/token" :
    "https://api-evm.orderly.org/v1/public/token",
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      dedupingInterval: 3_600_000,
    }
  );

  const apiBaseUrl = configStore.get("apiBaseUrl");


  const chains:
    | API.Chain[]
    | {
      testnet: API.Chain[];
      mainnet: API.Chain[];
    } = useMemo(() => {
      // if (!orderlyChains) return undefined;

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

          /// if chain is testnet, update network_infos
          if (_chain.chain_id === 421613) {
            const index = testnetArr.findIndex(
              (item) => item.network_infos.chain_id === 421613
            );
            if (index > -1) {
              testnetArr[index] = _chain;
            }
          }

          map.current.set(chainId, _chain);

          // orderlyChainsArr.push(field ? _chain[field] : _chain);
          orderlyChainsArr.push(_chain);
        });
      });

      // if (!wooSwapEnabled) {
      //   //
      //   let arr: any[] = orderlyChainsArr;
      //   if (typeof options?.filter === "function") {
      //     arr = orderlyChainsArr.filter(options.filter);
      //   }

      //   if (!!field) {
      //     arr = arr.map((item) => item[field]);
      //   }

      //   return arr;
      // } else {
      //

      let testnetArr: API.Chain[] = [
        //@ts-ignore
        {
          network_infos: {
            name: "Arbitrum Goerli",
            shortName: "Arbitrum Goerli",
            public_rpc_url: "https://goerli-rollup.arbitrum.io/rpc",
            chain_id: 421613,
            currency_symbol: "ETH",
            bridge_enable: true,
            mainnet: false,
            explorer_base_url: "https://goerli.arbiscan.io/",
            est_txn_mins: null,

            woofi_dex_cross_chain_router: "",
            woofi_dex_depositor: "",
          },
          token_infos: [
            {
              symbol: "USDC",
              address: "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63",
              decimals: 6,
              swap_enable: false,
              woofi_dex_precision: 2,
            },
          ],
        },
      ];

      let mainnetArr: API.Chain[] = [];

      map.current.set(421613, testnetArr[0]);

      if (wooSwapEnabled) {
        if (!data || !data.data) return data;

        Object.keys(data.data).forEach((key) => {
          // if (orderlyChainIds.has(data.data[key].network_infos.chain_id)) return;

          const chain = data.data[key];

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

          if (typeof options?.filter === "function") {
            if (!options.filter(item)) return;
          }

          if (item.network_infos.mainnet) {
            mainnetArr.push(item);
          } else {
            testnetArr.push(item);
          }
        });
      } else {
        // if (!chainInfos) return undefined;

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
          if (_chain.network_infos.chain_id === 421613) {
            const index = testnetArr.findIndex(
              (item) => item.network_infos.chain_id === 421613
            );
            if (index > -1) {
              testnetArr[index] = _chain;
            }
          }

          if (_chain.network_infos.chain_id === 420) {
            const index = testnetArr.findIndex(
              (item) => item.network_infos.chain_id === 420
            );
            if (index > -1) {
              testnetArr[index] = _chain;
            }
          }

          if (typeof options?.filter === "function") {
            if (!options.filter(_chain)) return;
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
      // }
    }, [
      data,
      networkId,
      field,
      options,
      orderlyChains,
      wooSwapEnabled,
      chainInfos,
    ]);

  const findByChainId = useCallback(
    (chainId: number, field?: string) => {
      const chain = map.current.get(chainId);

      if (chain) {
        chain.nativeToken = chain.token_infos?.find(
          (item) => item.address === nativeTokenAddress
        );
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
