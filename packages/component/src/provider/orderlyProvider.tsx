import { FC, PropsWithChildren, useEffect, useState } from "react";
import {
  useConstant,
  OrderlyProvider as Provider,
  type WebSocketAdpater,
} from "@orderly.network/hooks";
import { ModalProvider } from "@/modal/modalContext";
import { Toaster } from "@/toast/Toaster";
import { type ConfigStore } from "@orderly.network/core";
import { TooltipProvider } from "@/tooltip/tooltip";

interface OrderlyProviderProps {
  ws?: WebSocketAdpater;
  networkId?: string;
  configStore: ConfigStore;
}
//
// API_URL: "https://dev-api-v2.orderly.org"
// WS_URL: "wss://dev-ws-v2.orderly.org"
// WS_PRIVATE_URL: "wss://dev-ws-private-v2.orderly.org"

export const OrderlyProvider: FC<PropsWithChildren<OrderlyProviderProps>> = (
  props
) => {
  const { children, networkId = "testnet" } = props;
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    "https://dev-api-v2.orderly.org/v1"
  );

  return (
    <Provider value={{ apiBaseUrl, configStore: props.configStore }}>
      <ModalProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </ModalProvider>
      <Toaster />
    </Provider>
  );
};
