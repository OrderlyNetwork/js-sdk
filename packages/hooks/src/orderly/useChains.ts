import { useCallback, useContext, useMemo, useRef } from "react";
import { prop } from "ramda";
import useSWR, { SWRConfiguration } from "swr";
import {
  NetworkId,
  type API,
  Chain as FlatChain,
  MONAD_TESTNET_CHAINID,
  ArbitrumSepoliaChainInfo,
  SolanaDevnetChainInfo,
  ArbitrumSepoliaTokenInfo,
  SolanaDevnetTokenInfo,
  TesnetTokenFallback,
  SOLANA_TESTNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  ABSTRACT_TESTNET_CHAINID,
  BSC_TESTNET_CHAINID,
} from "@orderly.network/types";
import { nativeTokenAddress } from "@orderly.network/types";
import { OrderlyContext } from "../orderlyContext";
import { useMainnetChainsStore } from "../provider/store/chainInfoMainStore";
import { useTestnetChainsStore } from "../provider/store/chainInfoTestStore";
import { useMainTokenStore } from "../provider/store/mainTokenStore";
import { useSwapSupportStore } from "../provider/store/swapSupportStore";
import { useTestTokenStore } from "../provider/store/testTokenStore";
import { useQuery } from "../useQuery";

// testnet only show arb sepolia and solana devnet
const TestNetWhiteList = [
  ARBITRUM_TESTNET_CHAINID,
  SOLANA_TESTNET_CHAINID,
  MONAD_TESTNET_CHAINID,
  ABSTRACT_TESTNET_CHAINID,
  BSC_TESTNET_CHAINID,
];

export type Chain = API.Chain & {
  nativeToken?: API.TokenInfo;
  isTestnet?: boolean;
};

export type Chains<
  T extends NetworkId | undefined = undefined,
  K extends keyof API.Chain | undefined = undefined,
> = T extends NetworkId
  ? K extends keyof API.Chain
    ? API.Chain[K][]
    : API.Chain[]
  : K extends keyof API.Chain
    ? {
        testnet: API.Chain[K][];
        mainnet: API.Chain[K][];
      }
    : {
        testnet: API.Chain[];
        mainnet: API.Chain[];
      };

export type UseChainsOptions = {
  filter?: (item: API.Chain) => boolean;
  pick?: "dexs" | "network_infos" | "token_infos";
  // Whether to force the use of data returned by the API, ignoring the customChains.
  forceAPI?: boolean;
} & SWRConfiguration;

export type UseChainsReturnObject = {
  findByChainId: (chainId: number, field?: string) => Chain | undefined;
  checkChainSupport: (
    chainId: number | string,
    networkId: NetworkId,
  ) => boolean;
  error: any;
};

// const testnetTokenFallback = TesnetTokenFallback([
//   ArbitrumSepoliaTokenInfo,
//   SolanaDevnetTokenInfo,
// ]);

const testnetChainFallback = [ArbitrumSepoliaChainInfo, SolanaDevnetChainInfo];

export function useChains(
  networkId?: undefined,
  options?: undefined,
): [Chains<undefined, undefined>, UseChainsReturnObject];

export function useChains<
  T extends NetworkId | undefined,
  K extends UseChainsOptions | undefined,
>(
  networkId?: T,
  options?: K,
): [
  Chains<
    T,
    K extends UseChainsOptions
      ? K["pick"] extends keyof API.Chain
        ? K["pick"]
        : undefined
      : undefined
  >,
  UseChainsReturnObject,
];

/**
 *
 * @example
 * // { testnet: API.Chain[];  mainnet: API.Chain[]; }
 * const [chains1] = useChains();
 *
 * // { testnet: API.Chain[];  mainnet: API.Chain[]; }
 * const [chains2] = useChains(undefined);
 *
 * // { testnet: API.NetworkInfos[];  mainnet: API.NetworkInfos[]; }
 * const [chains3] = useChains(undefined, { pick: "network_infos" });
 *
 * // API.Chain[]
 * const [chains4] = useChains("testnet");
 *
 * // API.Chain[]
 * const [chains5] = useChains("mainnet");
 *
 * // API.NetworkInfos[]
 * const [chains6] = useChains("testnet", { pick: "network_infos" }); *
 *
 */
export function useChains(
  networkId?: NetworkId,
  options: UseChainsOptions = {},
): [any, any] {
  const { pick: pickField, ...swrOptions } = options;
  const {
    filteredChains: allowedChains,
    configStore,
    customChains,
    chainTransformer,
  } = useContext(OrderlyContext);

  const filterFun = useRef(options?.filter);
  filterFun.current = options?.filter;

  const chainsMap = useRef(new Map<number, Chain>());

  // const brokerId = configStore.get("brokerId");
  // const env = configStore.get("env");
  // const brokerIdQuery = brokerId !== "orderly" ? `?broker_id=${brokerId}` : "";

  // const urlPrefix = env === "prod" ? "https://testnet-api.orderly.org" : "";

  const needFetchFromAPI = options.forceAPI || !customChains;

  // const commonSwrOpts = {
  //   revalidateIfStale: false,
  //   revalidateOnFocus: false,
  //   revalidateOnReconnect: false,
  //   // If false, undefined data gets cached against the key.
  //   revalidateOnMount: true,
  //   // don't duplicate a request with the same key for 1hr
  //   dedupingInterval: 3_600_000,
  //   ...swrOptions,
  // };

  const { data: tokenChainsRes, error: tokenError } = useMainTokenStore();

  // only prod env return mainnet chains info
  // const { data: tokenChainsRes, error: tokenError } = useQuery<API.Chain[]>(
  //   "https://api.orderly.org/v1/public/token",
  //   { ...commonSwrOpts },
  // );

  const testTokenChainsRes = useTestTokenStore((state) => state.data);

  // testnet token info
  // const { data: testTokenChainsRes } = useQuery<API.Chain[]>(
  //   `${urlPrefix}/v1/public/token`,
  //   {
  //     ...commonSwrOpts,
  //     fallbackData: testnetTokenFallback,
  //   },
  // );

  const chainInfos = useMainnetChainsStore((state) => state.data);
  // only prod env return mainnet chains info
  // const { data: chainInfos, error: chainInfoErr } = useQuery(
  //   needFetchFromAPI
  //     ? `https://api.orderly.org/v1/public/chain_info${brokerIdQuery}`
  //     : null,
  //   { ...commonSwrOpts },
  // );

  const testChainInfos = useTestnetChainsStore((state) => state.data);
  // testnet chains info
  // const { data: testChainInfos, error: testChainInfoError } = useQuery(
  //   needFetchFromAPI
  //     ? `${urlPrefix}/v1/public/chain_info${brokerIdQuery}`
  //     : null,
  //   {
  //     ...commonSwrOpts,
  //     fallbackData: testnetChainFallback,
  //     onError: (error) => {
  //       console.error("Failed to fetch testnet chain info:", error);
  //     },
  //   },
  // );

  const { swapChains, swapChainsError } = useSwapChains();

  const chains = useMemo(() => {
    if (
      !tokenChainsRes ||
      !testTokenChainsRes ||
      !chainInfos ||
      !testChainInfos
    ) {
      return [];
    }
    const mainnetChains = formatChains({
      tokenChains: tokenChainsRes,
      chainInfos,
      swapChains,
      filter: filterFun.current,
      mainnet: true,
      chainTransformer,
    });

    const testnetChains = formatChains({
      tokenChains: testTokenChainsRes,
      chainInfos: testChainInfos,
      swapChains,
      mainnet: false,
      chainTransformer,
    });

    let mainnetArr = needFetchFromAPI ? mainnetChains : customChains?.mainnet;
    let testnetArr = needFetchFromAPI ? testnetChains : customChains?.testnet;

    testnetArr?.forEach((chain) => {
      chainsMap.current.set(chain.network_infos?.chain_id, chain);
    });

    mainnetArr?.forEach((chain) => {
      chainsMap.current.set(chain.network_infos?.chain_id, chain);
    });

    mainnetArr = filterByAllowedChains(mainnetArr, allowedChains?.mainnet);
    testnetArr = filterByAllowedChains(
      testnetArr,
      allowedChains?.testnet ??
        (TestNetWhiteList.map((id) => ({ id })) as FlatChain[]),
    );

    if (!!pickField) {
      //@ts-ignore
      testnetArr = testnetArr.map((item) => item[pickField]);
      //@ts-ignore
      mainnetArr = mainnetArr.map((item) => item[pickField]);
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
    networkId,
    tokenChainsRes,
    chainInfos,
    testChainInfos,
    testTokenChainsRes,
    customChains,
    pickField,
    allowedChains,
    swapChains,
    chainTransformer,
  ]);

  const findByChainId = useCallback(
    (chainId: number, field?: string) => {
      const chain = chainsMap.current.get(chainId);

      if (chain) {
        chain.nativeToken =
          chain.token_infos?.find(
            (item) => item.address === nativeTokenAddress,
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
    [chains, chainsMap],
  );

  const checkChainSupport = useCallback(
    (chainId: number | string, networkId: NetworkId) => {
      const _chains = Array.isArray(chains) ? chains : chains[networkId];
      return _checkChainSupport(chainId, _chains);
    },
    [chains],
  );

  return [
    chains,
    {
      findByChainId,
      checkChainSupport,
      error: tokenError || swapChainsError,
    },
  ];
}

function _checkChainSupport(chainId: number | string, chains: API.Chain[]) {
  if (typeof chainId === "string") {
    chainId = parseInt(chainId);
  }
  return chains.some((chain) => {
    return chain.network_infos.chain_id === chainId;
  });
}

export function filterByAllowedChains(
  chains: API.Chain[],
  allowedChains?: Partial<FlatChain>[],
) {
  if (!allowedChains) {
    return chains;
  }

  return chains.filter((chain) =>
    allowedChains.some(
      (allowedChain) =>
        allowedChain.id === parseInt(chain?.network_infos?.chain_id as any),
    ),
  );
}

function useSwapChains() {
  const { enableSwapDeposit } = useContext(OrderlyContext);

  const { data: swapChainsRes, error: swapChainsError } = useSwapSupportStore();

  // const { data: swapChainsRes, error: swapChainsError } = useSWR<any>(
  //   () => (enableSwapDeposit ? "https://fi-api.woo.org/swap_support" : null),
  //   (url) => fetch(url).then((res) => res.json()),
  //   {
  //     revalidateIfStale: false,
  //     revalidateOnFocus: false,
  //     revalidateOnReconnect: false,
  //     // If false, undefined data gets cached against the key.
  //     revalidateOnMount: true,
  //     // dont duplicate a request w/ same key for 1hr
  //     dedupingInterval: 3_600_000,
  //   },
  // );

  const swapChains = useMemo(() => {
    if (!enableSwapDeposit || !swapChainsRes || !swapChainsRes.data) {
      return [];
    }
    const data = swapChainsRes.data;

    return Object.keys(data).map((key) => {
      const chain = data[key];
      const { network_infos, token_infos } = chain;

      const networkInfos = {
        ...network_infos,
        // swap deposit will use shortName to get swap info
        shortName: key,
        cross_chain_router: network_infos?.woofi_dex_cross_chain_router,
        depositor: network_infos?.woofi_dex_depositor,
        est_txn_mins: network_infos?.est_txn_mins,
      };

      const nativeToken = token_infos.find(
        (item: any) => item.symbol === network_infos.currency_symbol,
      );
      if (nativeToken) {
        networkInfos.currency_decimal = nativeToken.decimals;
      } else {
        // default 18 decimals
        networkInfos.currency_decimal = 18;
      }

      // filter tokens by swap_enable
      const tokenInfos = token_infos
        ?.filter((item: any) => item.swap_enable)
        .map((item: any) => {
          const { woofi_dex_precision, ...rest } = item;
          return {
            ...rest,
            precision: woofi_dex_precision,
          };
        });

      return {
        network_infos: networkInfos,
        token_infos: tokenInfos || [],
      } as API.Chain;
    });
  }, [enableSwapDeposit, swapChainsRes]);

  return { swapChains, swapChainsError };
}

export function formatChains({
  chainInfos = [],
  tokenChains = [],
  swapChains = [],
  filter,
  mainnet,
  chainTransformer,
}: {
  chainInfos?: any;
  tokenChains?: API.Token[];
  swapChains?: any[];
  filter?: (chain: any) => boolean;
  mainnet: boolean;
  chainTransformer?: (params: {
    chains: API.Chain[];
    tokenChains: API.Token[];
    chainInfos: any[];
    swapChains: any[];
    mainnet: boolean;
  }) => API.Chain[];
}) {
  const chains: API.Chain[] = [];

  for (const chainInfo of chainInfos) {
    const chainId = Number(chainInfo.chain_id);
    const swapChainInfo = swapChains.find(
      (item: any) => item.network_infos.chain_id === chainId,
    );
    const swapNetworkInfo = swapChainInfo?.network_infos;
    const swapTokenInfos = swapChainInfo?.token_infos || [];

    const {
      name,
      public_rpc_url,
      currency_symbol,
      explorer_base_url,
      vault_address,
    } = chainInfo;

    const { shortName, cross_chain_router, depositor, est_txn_mins } =
      swapNetworkInfo || {};

    const network_infos = {
      name,
      chain_id: chainId,
      bridgeless: true,
      mainnet,

      public_rpc_url,
      currency_symbol,
      bridge_enable: true,
      explorer_base_url,

      // swap field
      shortName: shortName ?? name,
      cross_chain_router,
      depositor,
      est_txn_mins,
      vault_address,
    };

    const usdcSwapToken = swapTokenInfos.find(
      (item: any) => item.symbol === "USDC",
    );

    const tokenInfos = tokenChains
      .filter((item) =>
        item.chain_details.some((item) => Number(item.chain_id) === chainId),
      )
      .map((item) => {
        const chain = item.chain_details.find(
          (item) => Number(item.chain_id) === chainId,
        );
        const swapToken = swapTokenInfos.find(
          (swapItem: any) => swapItem.symbol === item.token,
        );

        return {
          symbol: item.token,
          // if contract_address is not exist, use nativeTokenAddress to place holder
          address: chain?.contract_address || nativeTokenAddress,
          /** chain decimals */
          decimals: chain?.decimals,
          // chain_decimals: chain?.decimals,
          /** token decimals */
          token_decimal: item?.decimals,
          precision: item.decimals,

          display_name: chain?.display_name,

          withdrawal_fee: chain?.withdrawal_fee,
          cross_chain_withdrawal_fee: chain?.cross_chain_withdrawal_fee,
          minimum_withdraw_amount: item.minimum_withdraw_amount,

          base_weight: item.base_weight,
          discount_factor: item.discount_factor,
          haircut: item.haircut,
          user_max_qty: item.user_max_qty,
          is_collateral: item.is_collateral,
          // if source token is swap token, and usdc is swap token, set swap_enable to true
          swap_enable: !!swapToken?.swap_enable && usdcSwapToken?.swap_enable,
        };
      });

    // filter swap tokens that is not in tokenInfos, chain swap deposit need to check usdc swap_enable
    const swapTokens = usdcSwapToken?.swap_enable
      ? swapTokenInfos?.filter((item: any) => {
          return !tokenInfos?.some((token) => token.symbol === item.symbol);
        })
      : [];

    const _chain: any = {
      network_infos,
      token_infos: [...tokenInfos, ...swapTokens],
    };

    if (typeof filter === "function") {
      if (!filter(_chain)) continue;
    }

    chains.push(_chain);
  }

  if (typeof chainTransformer === "function") {
    return chainTransformer({
      chains,
      chainInfos,
      tokenChains,
      swapChains,
      mainnet,
    });
  }

  return chains;
}

/** orderly chains array form (/v1/public/token) api */
// export function fillChainsInfo(
//   tokenChains?: API.Chain[],
//   filter?: (chain: any) => boolean,
//   chainInfos?: any,
// ) {
//   const chains: API.Chain[] = [];

//   tokenChains?.forEach((item) => {
//     item.chain_details.forEach((chain: any) => {
//       const chainId = Number(chain.chain_id);
//       const chainInfo = chainInfos?.find(
//         (item: any) => item.chain_id == chainId,
//       );

//       const existChain = chains.find(
//         (item) => item.network_infos?.chain_id === chainId,
//       );

//       const network_infos = {
//         name: chain.chain_name ?? chainInfo?.name ?? "--",
//         chain_id: chainId,
//         withdrawal_fee: chain.withdrawal_fee,
//         cross_chain_withdrawal_fee: chain.cross_chain_withdrawal_fee,
//         bridgeless: true,
//       };

//       const token_info: any = {
//         symbol: item.token,
//         address: chain.contract_address,
//         decimals: chain.decimals,
//         display_name: chain.display_name,

//         base_weight: item.base_weight,
//         discount_factor: item.discount_factor,
//         haircut: item.haircut,
//         user_max_qty: item.user_max_qty,
//         is_collateral: item.is_collateral,
//       };

//       const _chain: any = {
//         network_infos,
//         token_infos: [token_info],
//       };

//       if (typeof filter === "function") {
//         if (!filter(_chain)) return;
//       }

//       // if is a exist chain, add token_info to exist chain
//       if (existChain?.token_infos?.length) {
//         existChain.token_infos = [...existChain.token_infos, token_info];
//         return;
//       }

//       chains.push(_chain);
//     });
//   });

//   return chains;
// }

/** filter chains and update network_infos by chain_info api (v1/public/chain_info) */
// export function filterAndUpdateChains(
//   chains: API.Chain[],
//   chainInfos: any,
//   filter?: (chain: any) => boolean,
//   isTestNet?: boolean,
// ) {
//   // const filterChains: API.Chain[] = [];
//   const chainsMap = new Map<number, API.Chain>();

//   chains.forEach((chain) => {
//     const _chain = { ...chain };

//     const networkInfo = chainInfos?.find(
//       (item: any) => item.chain_id == chain.network_infos.chain_id,
//     );

//     if (networkInfo) {
//       const { name, public_rpc_url, currency_symbol, explorer_base_url } =
//         networkInfo;
//       _chain.network_infos = {
//         ..._chain.network_infos,
//         name,
//         shortName: name,
//         public_rpc_url,
//         currency_symbol,
//         bridge_enable: true,
//         mainnet: !isTestNet,
//         explorer_base_url,
//       };
//     }

//     if (typeof filter === "function") {
//       if (!filter(_chain)) return;
//     }

//     if (networkInfo) {
//       chainsMap.set(chain.network_infos.chain_id, _chain);
//     }
//   });

//   return Array.from(chainsMap.values());
// }

/** if chain is testnet, update testnet network_infos */
// export function updateTestnetInfo(
//   testnetArr: API.Chain[],
//   chainId: number,
//   chain: API.Chain,
// ) {
//   if (isTestnet(chainId)) {
//     const index = testnetArr?.findIndex(
//       (item) => item.network_infos.chain_id === chainId,
//     );
//     if (index > -1) {
//       testnetArr[index] = chain;
//     }
//   }
// }
