import { SWRHook, Middleware } from "swr";
import { SimpleDI, Account, MessageFactor } from "@orderly.network/core";
import { getTimestamp } from "@orderly.network/utils";
import { useConfig } from "../useConfig";

export const signatureMiddleware: Middleware = (useSWRNext: SWRHook) => {
  const apiBaseUrl = useConfig("apiBaseUrl");
  return (key, fetcher, config) => {
    try {
      const extendedFetcher = async (args: any) => {
        const url = Array.isArray(args) ? args[0] : args;

        const account = SimpleDI.get<Account>("account");
        const fullUrl = `${apiBaseUrl}${url}`;

        const signer = account.signer;

        const payload: MessageFactor = {
          method: "GET",
          url,
        };

        const signature = await signer.sign(payload, getTimestamp());

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
