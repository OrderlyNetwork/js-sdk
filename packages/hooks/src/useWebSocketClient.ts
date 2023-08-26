import { getMockSigner, SimpleDI } from "@orderly/core";

import { WebSocket } from "@orderly/net";
import useConstant from "use-constant";

const WS_NAME = "websocketClient";

export const useWebSocketClient = () => {
  const ws = useConstant(() => {
    let websocketClient = SimpleDI.get<WebSocket>(WS_NAME);

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

      SimpleDI.registerByName(WS_NAME, websocketClient);
    }
    return websocketClient;
  });

  return ws;
};
