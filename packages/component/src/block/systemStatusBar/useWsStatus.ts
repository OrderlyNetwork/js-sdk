import { useEffect, useRef, useState } from "react";
import { useWS } from "@orderly.network/hooks";

export type WsNetworkStatus = "connected" | "unstable" | "disconnected";

export function useWsStatus() {
  const ws = useWS();
  const [wsStatus, setWsStatus] = useState<WsNetworkStatus>(
    ws.client.public.readyState ? "connected" : "disconnected"
  );

  const connectCount = useRef(0);

  useEffect(() => {
    ws.on("status:change", (status: any) => {
      console.log("status:change", status);

      const { type, isPrivate } = status;
      if (!isPrivate) {
        switch (type) {
          case "open":
            connectCount.current = 0;
            setWsStatus("connected");
            break;
          case "close":
            connectCount.current = 0;
            setWsStatus("disconnected");
            break;
          case "reconnecting":
            connectCount.current++;
            if (connectCount.current >= 2) {
              setWsStatus("unstable");
            }
            break;
        }
      }
    });
    return () => ws.off("websocket:status", () => {});
  }, []);

  return wsStatus;
}
