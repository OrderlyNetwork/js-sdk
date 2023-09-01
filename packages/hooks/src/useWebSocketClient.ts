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

      SimpleDI.registerByName(WS_NAME, websocketClient);
    }
    return websocketClient;
  });

  return ws;
};
