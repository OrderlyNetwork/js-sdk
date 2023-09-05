import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";

import { post, del } from "@orderly.network/net";
import {
  type MessageFactor,
  type SignedMessagePayload,
} from "@orderly.network/core";
import { OrderlyContext } from "./orderlyContext";
import { useContext } from "react";
import { SimpleDI, Account } from "@orderly.network/core";
import { useAccountInstance } from "./useAccountInstance";

const fetcher = (
  url: string,
  options: { arg: { data?: any; signature: SignedMessagePayload } }
) => {
  // console.log("muation fetcher", url, options);
  return post(url, options.arg.data, {
    headers: {
      ...options.arg.signature,
    },
  });
};

const deleteFetcher = (
  url: string,
  options: { arg: { data?: any; signature: SignedMessagePayload } }
) => {
  // console.log("muation fetcher", url, options);
  return del(url, options.arg.data, {
    headers: {
      ...options.arg.signature,
    },
  });
};

type HTTP_METHOD = "POST" | "PUT" | "DELETE" | "GET";

// export const useMutation = (
//   url: string,
//   method: any
// ):any
export const useMutation = <T, E>(
  url: string,
  options?: SWRMutationConfiguration<T, E>,
  method: HTTP_METHOD = "POST"
): [any, any] => {
  const { apiBaseUrl } = useContext(OrderlyContext);
  if (!url.startsWith("http")) {
    url = `${apiBaseUrl}${url}`;
  }

  // let account = SimpleDI.get<Account>("account");
  const account = useAccountInstance();
  // sign message;
  const signer = account.signer;
  const { trigger, data, error, reset, isMutating } = useSWRMutation(
    url,
    method === "POST" ? fetcher : deleteFetcher,
    options
  );

  const mutation = async (data: any): Promise<any> => {
    const payload: MessageFactor = {
      method,
      url,
      data,
    };

    const signature = await signer.sign(payload);

    return trigger({
      data,
      signature: {
        ...signature,
        "orderly-account-id": account.accountId,
      },
    });
  };

  return [
    mutation,
    {
      data,
      error,
      reset,
      isMutating,
    },
  ];
};
