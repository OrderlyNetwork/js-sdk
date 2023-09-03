import { Account, SimpleDI, getMockSigner } from "@orderly.network/core";
import { WS } from "@orderly.network/net";
import useConstant from "use-constant";

const WS_NAME = "nativeWebsocketClient";
export const useWS = () => {
  const ws = useConstant(() => {
    // return getWebSocketClient(account);
    let websocketClient = SimpleDI.get<WS>(WS_NAME);
    const account = SimpleDI.get<Account>(Account.instanceName);

    if (!websocketClient) {
      websocketClient = new WS({
        // accountId: "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY",
        networkId: "testnet",
        onSigntureRequest: async (accountId: string) => {
          const signer = account.signer;
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
