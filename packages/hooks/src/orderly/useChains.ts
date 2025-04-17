import {
  NetworkId,
  type API,
  Chain as FlatChain,
  MONAD_TESTNET_CHAINID,
  ArbitrumSepoliaChainInfo,
  SolanaDevnetChainInfo,
  ArbitrumSepoliaTokenInfo,
  SolanaDevnetTokenInfo,
  TesntTokenFallback,
} from "@orderly.network/types";
import { useCallback, useContext, useMemo, useRef } from "react";
import { SWRConfiguration } from "swr";
import { useQuery } from "../useQuery";
import { prop } from "ramda";
import { isTestnet } from "@orderly.network/utils";
import { nativeTokenAddress } from "@orderly.network/types";
import { OrderlyContext } from "../orderlyContext";
import { ArbitrumSepolia } from "@orderly.network/types";

// testnet only show arb sepolia and solana devnet
const TestNetWhiteList = [421614, 901901901, MONAD_TESTNET_CHAINID];

export type Chain = API.Chain & {
  nativeToken?: API.TokenInfo;
  isTestnet?: boolean;
};

export type Chains<
  T extends NetworkId | undefined = undefined,
  K extends keyof API.Chain | undefined = undefined
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
    networkId: NetworkId
  ) => boolean;
  error: any;
};

const testnetTokenFallback = TesntTokenFallback([
  ArbitrumSepoliaTokenInfo,
  SolanaDevnetTokenInfo
]);

const testnetChainFallback = [
  ArbitrumSepoliaChainInfo,
  SolanaDevnetChainInfo
];


export function useChains(
  networkId?: undefined,
  options?: undefined
): [Chains<undefined, undefined>, UseChainsReturnObject];

export function useChains<
  T extends NetworkId | undefined,
  K extends UseChainsOptions | undefined
>(
  networkId?: T,
  options?: K
): [
    Chains<
      T,
      K extends UseChainsOptions
      ? K["pick"] extends keyof API.Chain
      ? K["pick"]
      : undefined
      : undefined
    >,
    UseChainsReturnObject
  ];


export function useChains(
  networkId?: NetworkId,
  options: UseChainsOptions = {}
): [any, any] {
  const { pick: pickField, ...swrOptions } = options;
  const {
    filteredChains: allowedChains,
    configStore,
    customChains,
  } = useContext(OrderlyContext);

  const filterFun = useRef(options?.filter);
  filterFun.current = options?.filter;

  const chainsMap = useRef(new Map<number, Chain>());

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

  // only prod env return mainnet chains info
  const { data: tokenChainsRes, error: tokenError } = useQuery<API.Chain[]>(
    "https://api.orderly.org/v1/public/token",
    { ...commonSwrOpts }
  );

  const { data: testTokenChainsRes } = useQuery<API.Chain[]>(
    "https://testnet-api.orderly.org/v1/public/token",
    {
      ...commonSwrOpts,
      fallbackData: testnetTokenFallback,
    }
  );


  const brokerId = configStore.get("brokerId");

  const needFetchFromAPI = options.forceAPI || !customChains;

  // only prod env return mainnet chains info
  const { data: chainInfos, error: chainInfoErr } = useQuery(
    needFetchFromAPI
      ? `https://api.orderly.org/v1/public/chain_info${brokerId !== "orderly" ? `?broker_id=${brokerId}` : ""
      }`
      : null,
    { ...commonSwrOpts }
  );

  // test chains info
  const { data: testChainInfos, error: testChainInfoError } = useQuery(
    needFetchFromAPI
      ? `https://testnet-api.orderly.org/v1/public/chain_info${brokerId !== "orderly" ? `?broker_id=${brokerId}` : ""
      }`
      : null,
    {
      ...commonSwrOpts,
      fallbackData: testnetChainFallback,
      onError: (error) => {
        console.error("Failed to fetch testnet chain info:", error);
      }
    }
  );



  const chains = useMemo(() => {
    const tokenChains = fillChainsInfo(
      tokenChainsRes,
      filterFun.current,
      chainInfos
    );
    const testTokenChains = fillChainsInfo(
      testTokenChainsRes,
      undefined,
      testChainInfos
    );

    let testnetArr = needFetchFromAPI
      ? filterAndUpdateChains(testTokenChains, testChainInfos, undefined, true)
      : customChains?.testnet;

    tokenChains?.forEach((item) => {
      const chainId = item.network_infos?.chain_id;
      chainsMap.current.set(chainId, item);
    });

    testnetArr.forEach((chain) => {
      chainsMap.current.set(chain.network_infos?.chain_id, chain);
    });

    let mainnetArr: API.Chain[] = [];

    mainnetArr = filterAndUpdateChains(
      tokenChains,
      chainInfos,
      filterFun.current
    );

    mainnetArr = needFetchFromAPI ? mainnetArr : customChains?.mainnet;

    mainnetArr.forEach((item) => {
      const chainId = item.network_infos?.chain_id;
      chainsMap.current.set(chainId, item);
    });

    mainnetArr = filterByAllowedChains(mainnetArr, allowedChains?.mainnet);
    testnetArr = filterByAllowedChains(
      testnetArr,
      allowedChains?.testnet ??
      (TestNetWhiteList.map((id) => ({ id })) as FlatChain[])
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
  ]);

  const findByChainId = useCallback(
    (chainId: number, field?: string) => {
      const chain = chainsMap.current.get(chainId);

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
    [chains, chainsMap]
  );

  const checkChainSupport = useCallback(
    (chainId: number | string, networkId: NetworkId) => {
      const _chains = Array.isArray(chains) ? chains : chains[networkId];
      return _checkChainSupport(chainId, _chains);
    },
    [chains]
  );

  return [
    chains,
    {
      findByChainId,
      checkChainSupport,
      error: tokenError,
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

/** orderly chains array form (/v1/public/token) api */
export function fillChainsInfo(
  chains?: API.Chain[],
  filter?: (chain: any) => boolean,
  chainInfos?: any
) {
  let _chains: API.Chain[] = [];

  chains?.forEach((item) => {
    item.chain_details.forEach((chain: any) => {
      const chainId = Number(chain.chain_id);
      const chainInfo = chainInfos?.find(
        (item: any) => item.chain_id == chainId
      );

      const _chain: any = {
        network_infos: {
          name: chain.chain_name ?? chainInfo?.name ?? "--",
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
            display_name: chain.display_name,
          },
        ],
      };

      if (typeof filter === "function") {
        if (!filter(_chain)) return;
      }

      _chains.push(_chain);
    });
  });

  return _chains;
}

/** filter chains and update network_infos by chain_info api (v1/public/chain_info) */
export function filterAndUpdateChains(
  chains: API.Chain[],
  chainInfos: any,
  filter?: (chain: any) => boolean,
  isTestNet?: boolean
) {
  const filterChains: API.Chain[] = [];

  chains.forEach((chain) => {
    let _chain = { ...chain };

    const networkInfo = chainInfos?.find(
      (item: any) => item.chain_id == chain.network_infos.chain_id
    );

    if (networkInfo) {
      const { name, public_rpc_url, currency_symbol, explorer_base_url } =
        networkInfo;
      _chain.network_infos = {
        ..._chain.network_infos,
        name,
        shortName: name,
        public_rpc_url,
        currency_symbol,
        bridge_enable: true,
        mainnet: !isTestNet,
        explorer_base_url,
        // est_txn_mins: null,
      };
    }

    if (typeof filter === "function") {
      if (!filter(_chain)) return;
    }

    if (networkInfo) {
      filterChains.push(_chain);
    }
  });

  return filterChains;
}

/** if chain is testnet, update testnet network_infos */
export function updateTestnetInfo(
  testnetArr: API.Chain[],
  chainId: number,
  chain: API.Chain
) {
  if (isTestnet(chainId)) {
    const index = testnetArr?.findIndex(
      (item) => item.network_infos.chain_id === chainId
    );
    if (index > -1) {
      testnetArr[index] = chain;
    }
  }
}

export function filterByAllowedChains(
  chains: API.Chain[],
  allowedChains?: FlatChain[]
) {
  if (!allowedChains) {
    return chains;
  }

  return chains.filter((chain) =>
    allowedChains.some(
      (allowedChain) =>
        allowedChain.id === parseInt(chain?.network_infos?.chain_id as any)
    )
  );
}
