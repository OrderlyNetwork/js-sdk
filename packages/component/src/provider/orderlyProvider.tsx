import { WS } from "@orderly/net";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import {
  useConstant,
  OrderlyProvider as Provider,
  type WebSocketAdpater,
} from "@orderly/hooks";
import { ModalProvider } from "@/modal/modalContext";
import { Toaster } from "@/toast/Toaster";
import { __ORDERLY_API_URL_KEY__ } from "@orderly/net";

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      //set apiUrl to window;
      (window as any)[__ORDERLY_API_URL_KEY__] = apiBaseUrl;
    }
  }, [apiBaseUrl]);

  return (
    <Provider value={{ ws, apiBaseUrl }}>
      <ModalProvider>{children}</ModalProvider>
      <Toaster />
    </Provider>
  );
};
