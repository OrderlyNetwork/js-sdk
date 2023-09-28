import { SWRHook, Middleware } from "swr";
import { MessageFactor, getMockSigner } from "@orderly.network/core";

import { SimpleDI, Account } from "@orderly.network/core";
import { useContext } from "react";
import { OrderlyContext } from "../orderlyContext";

export const signatureMiddleware: Middleware = (useSWRNext: SWRHook) => {
  const { apiBaseUrl } = useContext(OrderlyContext);
  // const { account } = useAccountInstance();
  return (key, fetcher, config) => {
    try {
      const extendedFetcher = async (args: any) => {
        let url = Array.isArray(args) ? args[0] : args;
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
