import { useContext } from "react";
import useConstant from "use-constant";
import { Account, AccountState, SimpleDI } from "@veltodefi/core";
import { WS } from "@veltodefi/net";
import { AccountStatusEnum } from "@veltodefi/types";
import { getGlobalObject, getTimestamp } from "@veltodefi/utils";
import { OrderlyContext } from "./orderlyContext";

const WS_NAME = "nativeWebsocketClient";

export const useWS = () => {
  const { configStore } = useContext(OrderlyContext);
  // const prevAccountState = useRef<AccountState | null>(null);

  const ws = useConstant(() => {
    let websocketClient = SimpleDI.get<WS>(WS_NAME);
    const account = SimpleDI.get<Account>(Account.instanceName);

    if (!websocketClient) {
      websocketClient = new WS({
        networkId: configStore.get("networkId"),
        publicUrl: configStore.get("publicWsUrl"),
        privateUrl: configStore.get("privateWsUrl"),
        onSigntureRequest: async () => {
          const signer = account.signer;
          const timestamp = getTimestamp();
          const result = await signer.signText(timestamp.toString());
          return { ...result, timestamp };
        },
      });

      // if user login, open the private websocket
      if (
        (account.stateValue.status === AccountStatusEnum.EnableTrading ||
          account.stateValue.status ===
            AccountStatusEnum.EnableTradingWithoutConnected) &&
        account.accountId
      ) {
        websocketClient.openPrivate(account.accountId);
      }

      // open the pirvate websocket when user login
      account.on("change:status", (nextState: AccountState) => {
        if (
          (nextState.status === AccountStatusEnum.EnableTrading ||
            nextState.status ===
              AccountStatusEnum.EnableTradingWithoutConnected) &&
          account.accountId
        ) {
          websocketClient.openPrivate(account.accountId);
        } else {
          websocketClient.closePrivate(3887, "switch account");
        }

        // prevAccountState.current = nextState;
      });

      if (typeof window !== "undefined") {
        (getGlobalObject() as any)["__Orderly_WS"] = websocketClient;
      }

      SimpleDI.registerByName(WS_NAME, websocketClient);
    }

    return websocketClient;
  });

  // auto open private when user login;

  return ws;
};
