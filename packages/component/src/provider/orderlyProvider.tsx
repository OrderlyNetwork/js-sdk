import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  OrderlyProvider as Provider,
  type WebSocketAdpater,
} from "@orderly.network/hooks";
import { ModalProvider } from "@/modal/modalContext";
import { Toaster } from "@/toast/Toaster";
import {
  IContract,
  type ConfigStore,
  type OrderlyKeyStore,
  type WalletAdapter,
} from "@orderly.network/core";
import { Account, SimpleDI } from "@orderly.network/core";
import { TooltipProvider } from "@/tooltip/tooltip";
import { WalletConnectorContext } from "./walletConnectorProvider";
import { WSObserver } from "@/dev/wsObserver";
import { useChains, useSessionStorage } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { PreDataLoader } from "@/system/preDataLoader";

interface OrderlyProviderProps {
  ws?: WebSocketAdpater;
  networkId?: string;
  configStore: ConfigStore;
  keyStore: OrderlyKeyStore;
  contractManager: IContract;
  walletAdapter: { new (options: any): WalletAdapter };

  logoUrl?: string;

  // onWalletConnect?: () => Promise<any>;
}

const CHECK_ENTRY: Record<string, boolean> = { chains_fetch: false };

export const OrderlyProvider: FC<PropsWithChildren<OrderlyProviderProps>> = (
  props
) => {
  const {
    networkId = "testnet",
    logoUrl,
    keyStore,
    configStore,
    contractManager,
    walletAdapter,
    // onWalletConnect,
  } = props;

  if (!configStore) {
    throw new Error("configStore is required");
  }
  const [ready, setReady] = useSessionStorage<boolean>("APP_READY", false);

  const onAppTestChange = (name: string) => {
    CHECK_ENTRY[name] = true;
    const isReady = Object.keys(CHECK_ENTRY).every((key) => CHECK_ENTRY[key]);

    if (isReady) {
      console.log("change app ready: true");
      setReady(true);
    }
  };

  const {
    connect,
    disconnect,
    wallet: currentWallet,
    setChain,
  } = useContext(WalletConnectorContext);

  // const [testChains] = useChains("testnet", {
  //   pick: "network_infos",
  //   filter: (item: API.Chain) => item.network_infos.chain_id === 421613,
  // });

  const testChains = useMemo(() => {
    return [
      {
        name: "Arbitrum Goerli",
        public_rpc_url: "https://goerli-rollup.arbitrum.io/rpc",
        chain_id: 421613,
        currency_symbol: "ETH",
        bridge_enable: true,
        mainnet: false,
        explorer_base_url: "https://goerli.arbiscan.io/",
      },
    ];
  }, []);

  // console.log("testChains", testChains);

  const [errors, setErrors] = useSessionStorage("APP_ERRORS", {
    ChainNetworkNotSupport: false,
    IpNotSupport: false,
    NetworkError: false,
  });

  console.log("👏 app ready >>>", ready);

  useEffect(() => {
    let account = SimpleDI.get<Account>(Account.instanceName);

    if (!account) {
      account = new Account(
        configStore,
        keyStore,
        contractManager,
        walletAdapter
      );

      SimpleDI.registerByName(Account.instanceName, account);
    }
  }, []);

  const apiBaseUrl = useMemo(() => {
    return configStore.get("apiBaseUrl");
  }, [configStore]);
  const klineDataUrl = useMemo(() => {
    return configStore.get("klineDataUrl");
  }, [configStore]);

  const checkChainId = useCallback((chainId: number): boolean => {
    console.log("*****", chainId, testChains);
    if (!chainId || !testChains) {
      return false;
    }

    if (typeof chainId !== "number") {
      chainId = parseInt(chainId);
    }

    const isSupport = testChains.some(
      (item: API.NetworkInfos) => item.chain_id === chainId
    );

    return isSupport;
  }, []);

  const _onWalletConnect = useCallback(async (): Promise<any> => {
    if (connect) {
      const walletState = await connect();

      // console.log("walletState", walletState);

      if (
        Array.isArray(walletState) &&
        walletState.length > 0 &&
        walletState[0] &&
        walletState[0].accounts.length > 0
      ) {
        const wallet = walletState[0];

        ////// check chainid ///////

        if (!checkChainId(wallet.chains[0].id)) {
          return false;
        }

        let account = SimpleDI.get<Account>(Account.instanceName);
        // console.log("wallet", wallet, account);
        if (!account) {
          throw new Error("account is not initialized");
        }
        // account.address = wallet.accounts[0].address;
        const status = await account.setAddress(wallet.accounts[0].address, {
          provider: wallet.provider,
          chain: wallet.chains[0],
          label: wallet.label,
        });

        console.log("status", status, wallet);

        return { wallet, status };
      }
    } else {
      throw new Error("walletProvider is required");
    }
  }, [connect]);

  // console.log("current wallet", currentWallet);

  const _onWalletDisconnect = useCallback(async (): Promise<any> => {
    if (typeof disconnect === "function" && currentWallet) {
      console.warn("🤜 disconnect wallet");
      let account = SimpleDI.get<Account>(Account.instanceName);

      return disconnect(currentWallet).then(() => {
        return account.disconnect();
      });
    }
  }, [disconnect, currentWallet]);

  const _onSetChain = useCallback((chainId: number) => {
    return setChain({ chainId }).then((success: boolean) => {
      // console.log("setChain result::::", result);
      if (success) {
        setErrors((errors) => ({ ...errors, ChainNetworkNotSupport: false }));
      }

      return success;
    });
  }, []);

  const currentAddress = useMemo(() => {
    if (!currentWallet) {
      return null;
    }
    return currentWallet.accounts[0].address;
  }, [currentWallet]);

  const currentChainId = useMemo(() => {
    if (!currentWallet) {
      return null;
    }
    return currentWallet.chains[0].id;
  }, [currentWallet]);

  useEffect(() => {
    // console.log("app ready?", ready);
    if (ready) {
      let account = SimpleDI.get<Account>(Account.instanceName);
      // console.log("currentWallet==== auto =>>>>>>>>>>", currentWallet, account);

      if (!!currentWallet && account) {
        if (
          account.address === currentAddress &&
          currentChainId === account.chainId
        ) {
          return;
        }
        if (!checkChainId(currentChainId)) {
          account.disconnect();

          setErrors((errors) => ({ ...errors, ChainNetworkNotSupport: true }));

          console.warn("current chain not support!");
          return;
        } else {
          setErrors((errors: any) => ({
            ...errors,
            ChainNetworkNotSupport: false,
          }));
        }

        account.setAddress(currentWallet.accounts[0].address, {
          provider: currentWallet.provider,
          chain: currentWallet.chains[0],
          label: currentWallet.label,
        });
      }
    }
    // }, [ready, currentWallet]);
  }, [ready, currentAddress, currentChainId, testChains]);

  // const content = useMemo(() => {
  //   if (!ready) {
  //     return null;
  //   }
  //   return props.children;
  // }, [ready]);

  return (
    <Provider
      value={{
        apiBaseUrl,
        klineDataUrl,
        configStore: props.configStore,
        logoUrl,
        keyStore,
        walletAdapter,
        contractManager: props.contractManager,
        networkId,
        ready,
        onWalletConnect: _onWalletConnect,
        onWalletDisconnect: _onWalletDisconnect,
        onSetChain: _onSetChain,
        onAppTestChange,
        errors,
      }}
    >
      <WSObserver />
      <PreDataLoader />
      <TooltipProvider>
        <ModalProvider>{props.children}</ModalProvider>
      </TooltipProvider>
      <Toaster />
    </Provider>
  );
};
