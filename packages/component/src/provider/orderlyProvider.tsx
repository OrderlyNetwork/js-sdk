import React, {
  FC,
  PropsWithChildren,
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
import { TooltipProvider } from "@/tooltip/tooltip";

interface OrderlyProviderProps {
  ws?: WebSocketAdpater;
  networkId?: string;
  configStore: ConfigStore;
  keyStore: OrderlyKeyStore;
  walletAdapter: WalletAdapter;

  logoUrl?: string;

  onWalletConnect?: () => void;
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
    onWalletConnect,
  } = props;

  if (!configStore) {
    throw new Error("configStore is required");
  }

  const apiBaseUrl = useMemo(() => {
    return configStore.get("apiBaseUrl");
  }, [configStore]);
  const klineDataUrl = useMemo(() => {
    return configStore.get("klineDataUrl");
  }, [configStore]);

  return (
    <Provider
      value={{
        apiBaseUrl,
        klineDataUrl,
        configStore: props.configStore,
        logoUrl,
        keyStore,
        networkId,
        onWalletConnect,
      }}
    >
      <TooltipProvider>
        <ModalProvider>{children}</ModalProvider>
      </TooltipProvider>
      <Toaster />
    </Provider>
  );
};
