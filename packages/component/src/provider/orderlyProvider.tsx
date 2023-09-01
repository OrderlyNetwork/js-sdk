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
}
//
// API_URL: "https://dev-api-v2.orderly.org"
// WS_URL: "wss://dev-ws-v2.orderly.org"
// WS_PRIVATE_URL: "wss://dev-ws-private-v2.orderly.org"

export const OrderlyProvider: FC<PropsWithChildren<OrderlyProviderProps>> = (
  props
) => {
  const { children, networkId = "testnet", logoUrl, keyStore } = props;
  const apiBaseUrl = useMemo(() => {
    return props.configStore.get("apiBaseUrl");
  }, [props.configStore]);
  const klineDataUrl = useMemo(() => {
    return props.configStore.get("klineDataUrl");
  }, [props.configStore]);
  // const [apiBaseUrl, setApiBaseUrl] = useState<string>(
  //   "https://dev-api-v2.orderly.org/v1"
  // );

  return (
    <Provider
      value={{
        apiBaseUrl,
        klineDataUrl,
        configStore: props.configStore,
        logoUrl,
        keyStore,
        networkId,
      }}
    >
      <TooltipProvider>
        <ModalProvider>{children}</ModalProvider>
      </TooltipProvider>
      <Toaster />
    </Provider>
  );
};
