import { Account, SimpleDI } from "@orderly.network/core";
import { WS } from "@orderly.network/net";
import { useContext, useEffect } from "react";
import useConstant from "use-constant";
import { useAccount } from "./useAccount";
import { AccountStatusEnum } from "@orderly.network/types";
import { OrderlyContext } from "./orderlyContext";

const WS_NAME = "nativeWebsocketClient";

export const useWS = () => {
  const { state } = useAccount();
  const { configStore } = useContext(OrderlyContext);
  const ws = useConstant(() => {
    // return getWebSocketClient(account);
    let websocketClient = SimpleDI.get<WS>(WS_NAME);
    const account = SimpleDI.get<Account>(Account.instanceName);

    if (!websocketClient) {
      websocketClient = new WS({
        // accountId: "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY",
        networkId: "testnet",
        publicUrl: configStore.get("publicWsUrl"),
        privateUrl: configStore.get("privateWsUrl"),
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

  // auto open private when user login;

  return ws;
};
