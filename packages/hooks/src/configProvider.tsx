import type { PropsWithChildren } from "react";
import React, { useLayoutEffect, useMemo } from "react";
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
  WalletAdapter,
} from "@orderly.network/core";

import useConstant from "use-constant";
import { Chain, NetworkId } from "@orderly.network/types";
// import { usePreLoadData } from "./usePreloadData";
import { DataCenterProvider } from "./dataProvider";
import { StatusProvider } from "./statusProvider";
import { SDKError } from "@orderly.network/types";
import { ProxyConfigStore } from "./dev/proxyConfigStore";
import type { Chains } from "./orderly/useChains";
import { DefaultEVMAdapterWalletAdapter } from "@orderly.network/default-evm-adapter";
import { EthersProvider } from "@orderly.network/web3-provider-ethers";
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
  walletAdapters: WalletAdapter[];
  brokerId: string;
  brokerName: string;
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
    walletAdapters,
    brokerId,
    brokerName,
    networkId,
    contracts,
    chainFilter,
    customChains,
  } = props;

  if (!brokerId && typeof configStore === "undefined") {
    console.error("[OrderlyConfigProvider]: brokerId is required");
  }

  // if (typeof walletAdapters === "undefined") {
  //   console.error(
  //     "[OrderlyConfigProvider]: walletAdapters is required, please provide at least one wallet adapter, " +
  //       "you can install the `@orderly.network/default-evm-adapter` or `@orderly.network/default-solana-adapter` package"
  //   );
  // }

  if (typeof configStore !== "undefined" && !configStore.get("brokerId")) {
    // console.error("[OrderlyConfigProvider]: brokerId is required");
    throw new SDKError(
      "if configStore is provided, brokerId is required in configStore"
    );
  }

  if (
    typeof brokerId !== "undefined" &&
    typeof configStore !== "undefined" &&
    brokerId !== configStore.get("brokerId")
  ) {
    throw new SDKError(
      "If you have provided a custom `configStore` and the `brokerId` is set in the `configStore`, please remove the `brokerId` prop."
    );
  }

  const innerConfigStore = useConstant<ConfigStore>(() => {
    return new ProxyConfigStore(
      configStore || new DefaultConfigStore({ brokerId, brokerName, networkId })
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

  const innerWalletAdapters = useConstant<WalletAdapter[]>(() => {
    return (
      walletAdapters || [
        new DefaultEVMAdapterWalletAdapter(new EthersProvider()),
      ]
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
        // innerGetWalletAdapter,
        innerWalletAdapters,
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
        walletAdapters: innerWalletAdapters,
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
