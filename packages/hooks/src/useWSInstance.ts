import { useContext, useEffect, useState } from "react";
import { WS } from "@orderly.network/net";
import { AccountStatusEnum } from "@orderly.network/types";
import { getTimestamp } from "@orderly.network/utils";
import { OrderlyContext } from "./orderlyContext";
import { useAccount } from "./useAccount";

type Options = {
  accountId?: string;
};

export const useWSInstance = (options: Options) => {
  const { accountId } = options;
  const { configStore } = useContext(OrderlyContext);
  const { state, account } = useAccount();
  const [websocketClient, setWebsocketClient] = useState<WS>();

  useEffect(() => {
    if (!accountId) {
      return;
    }

    // if user login, open the private websocket
    if (
      state.status === AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected
    ) {
      const client = new WS({
        networkId: configStore.get("networkId"),
        // publicUrl: configStore.get("publicWsUrl"),
        privateUrl: configStore.get("privateWsUrl"),

        onSigntureRequest: async () => {
          const signer = account.signer;
          const timestamp = getTimestamp();
          const result = await signer.signText(timestamp.toString());

          return { ...result, timestamp };
        },
      });

      client.openPrivate(accountId);
      setWebsocketClient(client);
    }
  }, [accountId, state.status]);

  useEffect(() => {
    return () => {
      websocketClient?.close();
    };
  }, [websocketClient, accountId]);

  return websocketClient;
};
