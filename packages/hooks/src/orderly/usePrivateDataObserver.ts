import { useEffect } from "react";

import { useWS } from "../useWS";
import { useSWRConfig } from "swr";
import { WSMessage } from "@orderly.network/types";
import { useEventEmitter } from "../useEventEmitter";

export const usePrivateDataObserver = () => {
  const ws = useWS();
  const { mutate } = useSWRConfig();
  const ee = useEventEmitter();

  useEffect(() => {
    console.log("subscribe: executionreport");
    const unsubscribe = ws.privateSubscribe("executionreport", {
      onMessage: (data: any) => {
        ee.emit("orders:changed");
      },
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    console.log("subscribe: position");
    const unsubscribe = ws.privateSubscribe("position", {
      onMessage: (data: { positions: WSMessage.Position[] }) => {
        const { positions: nextPostions } = data;
        console.info("refresh positions", nextPostions);
        mutate("/v1/positions");
      },
    });
    return () => {
      console.log("unsubscribe: private subscription position");
      unsubscribe?.();
    };
  }, []);
};
