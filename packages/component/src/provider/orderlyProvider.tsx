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
  type ConfigStore,
  type OrderlyKeyStore,
  type WalletAdapter,
} from "@orderly.network/core";
import { Account, SimpleDI } from "@orderly.network/core";
import { TooltipProvider } from "@/tooltip/tooltip";
import { WalletConnectorContext } from "./walletConnectorProvider";

interface OrderlyProviderProps {
  ws?: WebSocketAdpater;
  networkId?: string;
  configStore: ConfigStore;
  keyStore: OrderlyKeyStore;
  walletAdapter: { new (options: any): WalletAdapter };

  logoUrl?: string;

  // onWalletConnect?: () => Promise<any>;
}
//
// API_URL: "https://dev-api-v2.orderly.org"
// WS_URL: "wss://dev-ws-v2.orderly.org"
// WS_PRIVATE_URL: "wss://dev-ws-private-v2.orderly.org"

export const OrderlyProvider: FC<PropsWithChildren<OrderlyProviderProps>> = (
  props
) => {
  const {
    children,
    networkId = "testnet",
    logoUrl,
    keyStore,
    configStore,
    walletAdapter,
    // onWalletConnect,
  } = props;

  if (!configStore) {
    throw new Error("configStore is required");
  }

  const {
    connect,
    disconnect,
    wallet: currentWallet,
  } = useContext(WalletConnectorContext);

  useEffect(() => {
    let account = SimpleDI.get<Account>(Account.instanceName);

    if (!account) {
      account = new Account(configStore, keyStore, walletAdapter);

      SimpleDI.registerByName(Account.instanceName, account);
    }
  }, []);

  const apiBaseUrl = useMemo(() => {
    return configStore.get("apiBaseUrl");
  }, [configStore]);
  const klineDataUrl = useMemo(() => {
    return configStore.get("klineDataUrl");
  }, [configStore]);

  const _onWalletConnect = useCallback(async (): Promise<any> => {
    if (connect) {
      const walletState = await connect();

      console.log("walletState", walletState);

      if (
        Array.isArray(walletState) &&
        walletState.length > 0 &&
        walletState[0].accounts.length > 0
      ) {
        const wallet = walletState[0];

        let account = SimpleDI.get<Account>(Account.instanceName);
        console.log("wallet", wallet, account);
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

  const _onWalletDisconnect = useCallback(async (): Promise<any> => {
    if (typeof disconnect === "function") {
      let account = SimpleDI.get<Account>(Account.instanceName);

      return disconnect(currentWallet).then(() => {
        return account.disconnect();
      });
    }
  }, [disconnect, currentWallet]);

  useEffect(() => {
    // console.log("currentWallet=====>>>>>>>>>>", currentWallet);
    let account = SimpleDI.get<Account>(Account.instanceName);
    if (currentWallet && account) {
      account.setAddress(currentWallet.accounts[0].address, {
        provider: currentWallet.provider,
        chain: currentWallet.chains[0],
        label: currentWallet.label,
      });
    }
  }, [currentWallet]);

  return (
    <Provider
      value={{
        apiBaseUrl,
        klineDataUrl,
        configStore: props.configStore,
        logoUrl,
        keyStore,
        walletAdapter,
        networkId,
        ready: true,
        onWalletConnect: _onWalletConnect,
        onWalletDisconnect: _onWalletDisconnect,
      }}
    >
      <TooltipProvider>
        <ModalProvider>{children}</ModalProvider>
      </TooltipProvider>
      <Toaster />
    </Provider>
  );
};
