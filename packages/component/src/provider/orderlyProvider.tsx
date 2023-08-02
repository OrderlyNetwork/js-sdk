import { WS } from "@orderly/net";
import { FC, PropsWithChildren } from "react";
import {
  useConstant,
  OrderlyProvider as Provider,
  type WebSocketAdpater,
} from "@orderly/hooks";

interface OrderlyProviderProps {
  ws?: WebSocketAdpater;
  networkId?: string;
}

export const OrderlyProvider: FC<PropsWithChildren<OrderlyProviderProps>> = (
  props
) => {
  const { children, networkId = "testnet" } = props;
  const ws = useConstant(
    () =>
      new WS({
        url: "wss://testnet-ws.orderly.org/ws/stream/OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY",
      })
  );
  return <Provider value={{ ws }}>{children}</Provider>;
};
