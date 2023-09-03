import { Account, SimpleDI } from "@orderly.network/core";
import { WebSocketClient, type NetworkId } from "@orderly.network/net";
import { AccountStatusEnum } from "@orderly.network/types";

export const WS_NAME = "websocketClient";

export function getWebSocketClient(
  account: Account,
  networkId: NetworkId = "testnet"
) {
  let websocketClient = SimpleDI.get<WebSocketClient>(WS_NAME);

  if (!websocketClient) {
    websocketClient = new WebSocketClient({
      accountId: account.accountId || "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY",
      // accountId: account.accountId,
      networkId,
      onSigntureRequest: async (accountId: string) => {
        //   const signer = getMockSigner();

        if (account.stateValue.status < AccountStatusEnum.SignedIn) {
          throw new Error("Account is not signed in");
        }

        const signer = account.signer;
        const timestamp = new Date().getTime();
        const result = await signer.signText(timestamp.toString());

        return { ...result, timestamp };
      },
    });

    SimpleDI.registerByName(WS_NAME, websocketClient);
  }
  return websocketClient;
}
