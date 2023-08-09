import { WS } from "@orderly/net";
import { FC, PropsWithChildren, useState } from "react";
import {
  useConstant,
  OrderlyProvider as Provider,
  type WebSocketAdpater,
} from "@orderly/hooks";
import { ModalProvider } from "@/modal/modalContext";
import { Toaster } from "@/toast/Toaster";

interface OrderlyProviderProps {
  ws?: WebSocketAdpater;
  networkId?: string;
}

export const OrderlyProvider: FC<PropsWithChildren<OrderlyProviderProps>> = (
  props
) => {
  const { children, networkId = "testnet" } = props;
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    // "https://api.orderly.org/v1"
    "https://futures-api.orderly.org/v1"
  );
  const ws = useConstant(
    () =>
      new WS({
        url: "wss://ws.orderly.org/ws/stream/OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY",
      })
  );
  return (
    <Provider value={{ ws, apiBaseUrl }}>
      <ModalProvider>{children}</ModalProvider>
      <Toaster />
    </Provider>
  );
};
