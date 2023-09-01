import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";

import { post } from "@orderly.network/net";
import {
  type MessageFactor,
  type SignedMessagePayload,
} from "@orderly.network/core";
import { OrderlyContext } from "./orderlyContext";
import { useContext } from "react";
import { SimpleDI, Account } from "@orderly.network/core";

const fetcher = (
  url: string,
  options: { arg: { data?: any; signature: SignedMessagePayload } }
) => {
  // console.log("muation fetcher", url, options);
  return post(url, options.arg.data, {
    headers: {
      ...options.arg.signature,
      // "orderly-account-id":
      //   "0x47ab075adca7dfe9dd206eb7c50a10f7b99f4f08fa6c3abd4c170d438e15093b",
    },
  });
};

export const useMutation = <T, E>(
  url: string,
  options?: SWRMutationConfiguration<T, E>
) => {
  const { apiBaseUrl } = useContext(OrderlyContext);
  if (!url.startsWith("http")) {
    url = `${apiBaseUrl}${url}`;
  }
  let account = SimpleDI.get<Account>("account");
  // sign message;
  const signer = account.signer;
  const { trigger, data, error, reset, isMutating } = useSWRMutation(
    url,
    fetcher,
    options
  );

  const mutation = async (data: any) => {
    const payload: MessageFactor = {
      method: "POST",
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

  return {
    mutation,
    data,
    error,
    reset,
    isMutating,
  };
};
