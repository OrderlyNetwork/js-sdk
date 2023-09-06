import { SWRHook, Middleware } from "swr";
import { MessageFactor, getMockSigner } from "@orderly.network/core";
import { useAccount } from "../useAccount";
import { useAccountInstance } from "../useAccountInstance";
import { SimpleDI, Account } from "@orderly.network/core";
import { useContext } from "react";
import { OrderlyContext } from "../orderlyContext";

export const signatureMiddleware: Middleware = (useSWRNext: SWRHook) => {
  const { apiBaseUrl } = useContext(OrderlyContext);
  // const { account } = useAccountInstance();
  return (key, fetcher, config) => {
    try {
      const extendedFetcher = async (url: string) => {
        // console.log("signature middleware::::::::", key, url);

        let account = SimpleDI.get<Account>("account");
        let fullUrl = `${apiBaseUrl}${url}`;

        // console.log("signature middleware account::::::::", account);
        const signer = account.signer;
        // const signer = getMockSigner();

        const payload: MessageFactor = {
          method: "GET",
          url,
        };

        const signature = await signer.sign(payload);

        // @ts-ignore
        return fetcher(fullUrl, {
          headers: {
            ...signature,
            "orderly-account-id": account.accountId,
          },
        });
      };
      return useSWRNext(key, extendedFetcher, config);
    } catch (e) {
      console.error("signature error:", e);
      throw e;
    }
  };
};
