import type { FC, PropsWithChildren } from "react";
import React, { useLayoutEffect, useMemo } from "react";
import {
  ConfigStore,
  // MemoryConfigStore,
  OrderlyKeyStore,
  LocalStorageStore,
  SimpleDI,
  Account,
  IContract,
  WalletAdapter,
} from "@orderly.network/core";
import { DefaultEVMWalletAdapter } from "@orderly.network/default-evm-adapter";
import { DefaultSolanaWalletAdapter } from "@orderly.network/default-solana-adapter";
import { Chain, NetworkId } from "@orderly.network/types";
import { SDKError } from "@orderly.network/types";
import { EthersProvider } from "@orderly.network/web3-provider-ethers";
import { DEFAULT_TICK_SIZES } from "./constants";
import { ProxyConfigStore } from "./dev/proxyConfigStore";
import { ExtendedConfigStore } from "./extendedConfigStore";
import { OrderlyConfigContextState, OrderlyProvider } from "./orderlyContext";
// import { usePreLoadData } from "./usePreloadData";
import { DataCenterProvider } from "./provider/dataCenter";
import { StatusProvider } from "./statusProvider";

// import { useParamsCheck } from "./useParamsCheck";

type filteredChains = {
  mainnet?: Chain[];
  testnet?: Chain[];
};

type filterChainsFunc = (config: ConfigStore) => filteredChains;

export type BaseConfigProviderProps = {
  keyStore?: OrderlyKeyStore;
  contracts?: IContract;
  // getWalletAdapter?: getWalletAdapterFunc;
  walletAdapters?: WalletAdapter[];
  chainFilter?: filteredChains | filterChainsFunc;
  /**
   * Custom orderbook default tick sizes.
   */
  orderbookDefaultTickSizes?: Record<string, string>;
} & Pick<
  OrderlyConfigContextState,
  "enableSwapDeposit" | "customChains" | "chainTransformer" | "dataAdapter"
>;

export type ExclusiveConfigProviderProps =
  | {
      brokerId: string;
      brokerName?: string;
      networkId: NetworkId;
      configStore?: never;
    }
  | {
      brokerId?: never;
      brokerName?: never;
      networkId?: never;
      configStore: ConfigStore;
    };

export type ConfigProviderProps = BaseConfigProviderProps &
  ExclusiveConfigProviderProps;

export const OrderlyConfigProvider: FC<
  PropsWithChildren<ConfigProviderProps>
> = (props) => {
  const [account, setAccount] = React.useState<Account | null>(null);
  const {
    configStore,
    keyStore,
    // getWalletAdapter,
    walletAdapters,
    brokerId,
    brokerName,
    networkId,
    contracts,
    chainFilter,
    customChains,
    enableSwapDeposit = false,
    chainTransformer,
    dataAdapter,
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
      "if configStore is provided, brokerId is required in configStore",
    );
  }

  if (
    typeof brokerId !== "undefined" &&
    typeof configStore !== "undefined" &&
    brokerId !== (configStore as ConfigStore).get("brokerId")
  ) {
    throw new SDKError(
      "If you have provided a custom `configStore` and the `brokerId` is set in the `configStore`, please remove the `brokerId` prop.",
    );
  }

  const innerConfigStore = useMemo<ConfigStore>(() => {
    return new ProxyConfigStore(
      configStore ||
        new ExtendedConfigStore({ brokerId, brokerName, networkId }),
    );
  }, [configStore, brokerId, brokerName, networkId]);

  const innerKeyStore = useMemo<OrderlyKeyStore>(() => {
    return keyStore || new LocalStorageStore(networkId);
  }, [networkId, keyStore]);

  // const innerGetWalletAdapter = useConstant<getWalletAdapterFunc>(() => {
  //   return (
  //     getWalletAdapter ||
  //     ((options: WalletAdapterOptions) => new EtherAdapter(options))
  //   );
  // });

  const innerWalletAdapters = useMemo<WalletAdapter[]>(() => {
    return (
      walletAdapters || [
        new DefaultEVMWalletAdapter(new EthersProvider()),
        new DefaultSolanaWalletAdapter(),
      ]
    );
  }, [walletAdapters]);

  const defaultOrderbookTickSizes = useMemo<Record<string, string>>(() => {
    return props.orderbookDefaultTickSizes || DEFAULT_TICK_SIZES;
  }, [props.orderbookDefaultTickSizes]);

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
        },
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

  const memoizedValue = useMemo<OrderlyConfigContextState>(() => {
    return {
      configStore: innerConfigStore,
      keyStore: innerKeyStore,
      networkId: innerConfigStore.get("networkId") || networkId,
      filteredChains: filteredChains,
      walletAdapters: innerWalletAdapters,
      customChains,
      enableSwapDeposit,
      defaultOrderbookTickSizes,
      chainTransformer,
      dataAdapter,
    };
  }, [
    innerConfigStore,
    innerKeyStore,
    networkId,
    filteredChains,
    innerWalletAdapters,
    customChains,
    enableSwapDeposit,
    defaultOrderbookTickSizes,
    dataAdapter,
    chainTransformer,
  ]);

  if (!account) {
    return null;
  }

  return (
    <OrderlyProvider value={memoizedValue}>
      <StatusProvider>
        <DataCenterProvider>{props.children}</DataCenterProvider>
      </StatusProvider>
    </OrderlyProvider>
  );
};
