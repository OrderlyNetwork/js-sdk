import { SWRHook, Middleware } from "swr";
import { MessageFactor, getMockSigner } from "@orderly/core";

export const signatureMiddleware: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    const extendedFetcher = async (url: string) => {
      console.log("signature middleware::", key, url);
      const signer = getMockSigner();

      const payload: MessageFactor = {
        method: "GET",
        url: url,
      };

      const signature = await signer.sign(payload);

      // @ts-ignore
      return fetcher(url, {
        headers: {
          ...signature,
          "orderly-account-id":
            "0x47ab075adca7dfe9dd206eb7c50a10f7b99f4f08fa6c3abd4c170d438e15093b",
        },
      });
    };
    return useSWRNext(key, extendedFetcher, config);
  };
};
