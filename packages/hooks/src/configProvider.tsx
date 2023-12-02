import type { FC, PropsWithChildren } from "react";
import React, { useEffect } from "react";
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
} from "@orderly.network/core";

import useConstant from "use-constant";
import { NetworkId } from "@orderly.network/types";
import { usePreLoadData } from "./usePreloadData";

type RequireOnlyOne<T, U extends keyof T = keyof T> = Omit<T, U> &
  {
    [K in U]-?: Required<Pick<T, K>> & Partial<Record<Exclude<U, K>, never>>;
  }[U];

type RequireAtLeastOne<T, R extends keyof T = keyof T> = Omit<T, R> &
  {
    [K in R]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<R, K>>>;
  }[R];

export interface ConfigProviderProps {
  configStore?: ConfigStore;
  keyStore?: OrderlyKeyStore;
  getWalletAdapter?: getWalletAdapterFunc;
  brokerId: string;
  networkId: NetworkId;
  enableSwapDeposit?: boolean;
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
    enableSwapDeposit,
  } = props;

  if (!brokerId && typeof configStore === "undefined") {
    console.error("[OrderlyConfigProvider]: brokerId is required");
  }

  const innerConfigStore = useConstant<ConfigStore>(() => {
    return configStore || new DefaultConfigStore({ brokerId, networkId });
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

  useEffect(() => {
    let account = SimpleDI.get<Account>(Account.instanceName);

    if (!account) {
      account = new Account(
        innerConfigStore,
        innerKeyStore,
        innerGetWalletAdapter
      );

      SimpleDI.registerByName(Account.instanceName, account);
    }

    setAccount(account);
  }, []);

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
        enableSwapDeposit: enableSwapDeposit,
        // apiBaseUrl,
      }}
    >
      {props.children}
    </OrderlyProvider>
  );
};

// const DataPreload = () => {
//   const { error, done } = usePreLoadData();
// };
