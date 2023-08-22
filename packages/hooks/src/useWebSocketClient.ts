import { useContext, useEffect, useMemo } from "react";
import { getMockSigner, SimpleDI } from "@orderly/core";

import { WebSocket } from "@orderly/net";

export const useWebSocketClient = () => {
  const ws = useMemo(() => {
    let websocketClient = SimpleDI.get<WebSocket>("websocketClient");

    if (!websocketClient) {
      websocketClient = new WebSocket({
        accountId:
          "0x47ab075adca7dfe9dd206eb7c50a10f7b99f4f08fa6c3abd4c170d438e15093b",
        networkId: "testnet",
        onSigntureRequest: async (accountId: string) => {
          const signer = getMockSigner();
          const timestamp = new Date().getTime();
          const result = await signer.signText(timestamp.toString());

          return { ...result, timestamp };
        },
      });

      SimpleDI.registerByName("websocketClient", websocketClient);
    }
    return websocketClient;
  }, []);

  return ws;
};
