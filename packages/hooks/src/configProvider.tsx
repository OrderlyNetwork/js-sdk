import type { FC, PropsWithChildren } from "react";
import React, { useEffect, useMemo } from "react";
import { OrderlyConfigContextState, OrderlyProvider } from "./orderlyContext";
import {
  ConfigStore,
  MemoryConfigStore,
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

export interface ConfigProviderProps {
  configStore?: ConfigStore;
  keyStore?: OrderlyKeyStore;
  getWalletAdapter?: getWalletAdapterFunc;
  brokerId: string;
  networkId: NetworkId;
}

export const OrderlyConfigProvider: FC<
  PropsWithChildren<ConfigProviderProps>
> = (props) => {
  const { configStore, keyStore, getWalletAdapter, brokerId, networkId } =
    props;

  if (!brokerId || typeof configStore === "undefined") {
    console.error("[OrderlyConfigProvider]: brokerId is required");
  }

  const innerConfigStore = useConstant<ConfigStore>(() => {
    return configStore || new MemoryConfigStore({ brokerId });
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
  }, []);

  return (
    <OrderlyProvider
      value={{
        configStore: innerConfigStore,
        keyStore: innerKeyStore,
        getWalletAdapter: innerGetWalletAdapter,
        networkId: networkId,
        // apiBaseUrl,
      }}
    >
      {props.children}
    </OrderlyProvider>
  );
};
