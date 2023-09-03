import { getMockSigner, SimpleDI } from "@orderly.network/core";

import { WebSocketClient } from "@orderly.network/net";
import useConstant from "use-constant";
import { useAccountInstance } from "./useAccountInstance";
import { getWebSocketClient } from "./utils/getWebSocketClient";

export const WS_NAME = "websocketClient";

export const useWebSocketClient = () => {
  // const account = useAccountInstance();
  const ws = useConstant(() => {
    // return getWebSocketClient(account);
    let websocketClient = SimpleDI.get<WebSocketClient>(WS_NAME);

    if (!websocketClient) {
      websocketClient = new WebSocketClient({
        accountId: "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY",
        networkId: "testnet",
        onSigntureRequest: async (accountId: string) => {
          const signer = getMockSigner();
          const timestamp = new Date().getTime();
          const result = await signer.signText(timestamp.toString());

          return { ...result, timestamp };
        },
      });

      SimpleDI.registerByName(WS_NAME, websocketClient);
    }
    return websocketClient;
  });

  return ws;
};
