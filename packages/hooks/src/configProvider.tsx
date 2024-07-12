import type { FC, PropsWithChildren } from "react";
import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { OrderlyProvider } from "./orderlyContext";
import {
  ConfigStore,
  // MemoryConfigStore,
  DefaultConfigStore,
  OrderlyKeyStore,
  getWalletAdapterFunc,
  WalletAdapterOptions,
  LocalStorageStore,
  EtherAdapter,
  SimpleDI,
  Account,
  IContract,
} from "@orderly.network/core";

import useConstant from "use-constant";
import {
  Chain,
  NetworkId,
  defaultMainnetChains,
  defaultTestnetChains,
} from "@orderly.network/types";
// import { usePreLoadData } from "./usePreloadData";
import { DataCenterProvider } from "./dataProvider";
import { StatusProvider } from "./statusProvider";
import { SDKError } from "@orderly.network/types";
import { ProxyConfigStore } from "./dev/proxyConfigStore";
import type { Chains } from "./orderly/useChains";
// import { useParamsCheck } from "./useParamsCheck";

type RequireOnlyOne<T, U extends keyof T = keyof T> = Omit<T, U> &
  {
    [K in U]-?: Required<Pick<T, K>> & Partial<Record<Exclude<U, K>, never>>;
  }[U];

type RequireAtLeastOne<T, R extends keyof T = keyof T> = Omit<T, R> &
  {
    [K in R]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<R, K>>>;
  }[R];

type filteredChains = {
  mainnet?: Chain[];
  testnet?: Chain[];
};

type filterChainsFunc = (config: ConfigStore) => filteredChains;

export interface ConfigProviderProps {
  configStore?: ConfigStore;
  keyStore?: OrderlyKeyStore;
  contracts?: IContract;
  getWalletAdapter?: getWalletAdapterFunc;
  brokerId: string;
  networkId: NetworkId;

  chainFilter?: filteredChains | filterChainsFunc;
  customChains?: Chains<undefined, undefined>;
}

export const OrderlyConfigProvider = (
  props: PropsWithChildren<
    RequireAtLeastOne<ConfigProviderProps, "brokerId" | "configStore">
  >
) => {
  const [account, setAccount] = React.useState<Account | null>(null);
  const {
    configStore,
    keyStore,
    getWalletAdapter,
    brokerId,
    networkId,
    contracts,
    chainFilter,
    customChains,
  } = props;

  if (!brokerId && typeof configStore === "undefined") {
    console.error("[OrderlyConfigProvider]: brokerId is required");
  }

  if (typeof configStore !== "undefined" && !configStore.get("brokerId")) {
    // console.error("[OrderlyConfigProvider]: brokerId is required");
    throw new SDKError(
      "if configStore is provided, brokerId is required in configStore"
    );
  }

  const innerConfigStore = useConstant<ConfigStore>(() => {
    return new ProxyConfigStore(
      configStore || new DefaultConfigStore({ brokerId, networkId })
    );
  });

  const innerKeyStore = useConstant<OrderlyKeyStore>(() => {
    return keyStore || new LocalStorageStore(networkId);
  });

  const innerGetWalletAdapter = useConstant<getWalletAdapterFunc>(() => {
    return (
      getWalletAdapter ||
      ((options: WalletAdapterOptions) => new EtherAdapter(options))
    );
  });

  // check params, if has mismatch, throw warning message to console
  // useParamsCheck({ brokerId: innerConfigStore.get("brokerId") });

  useLayoutEffect(() => {
    let account = SimpleDI.get<Account>(Account.instanceName);

    if (!account) {
      account = new Account(
        innerConfigStore,
        innerKeyStore,
        innerGetWalletAdapter,
        {
          contracts,
        }
      );

      SimpleDI.registerByName(Account.instanceName, account);
    }

    setAccount(account);
  }, []);

  const filteredChains = useMemo(() => {
    if (typeof chainFilter === "function") {
      return chainFilter(innerConfigStore);
    }

    return chainFilter;

    // const { mainnet, testnet } = props.chains || {};

    // return {
    //   mainnet: mainnet || defaultMainnetChains,
    //   testnet: testnet || defaultTestnetChains,
    // };
  }, [props.chainFilter, innerConfigStore]);

  if (!account) {
    return null;
  }

  return (
    <OrderlyProvider
      value={{
        configStore: innerConfigStore,
        keyStore: innerKeyStore,
        getWalletAdapter: innerGetWalletAdapter,
        networkId: networkId,
        filteredChains: filteredChains,
        // apiBaseUrl,
        customChains,
      }}
    >
      <StatusProvider>
        <DataCenterProvider>{props.children}</DataCenterProvider>
      </StatusProvider>
    </OrderlyProvider>
  );
};

// const DataPreload = () => {
//   const { error, done } = usePreLoadData();
// };
