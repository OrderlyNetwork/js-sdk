import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";
import { mutate } from "@orderly.network/net";
import {
  type MessageFactor,
  type SignedMessagePayload,
} from "@orderly.network/core";
import { useAccountInstance } from "./useAccountInstance";
import { useConfig } from "./useConfig";

type HTTP_METHOD = "POST" | "PUT" | "DELETE";

const fetcher = (
  url: string,
  options: {
    arg: {
      data?: any;
      params?: any;
      method: HTTP_METHOD;
      signature: SignedMessagePayload;
    };
  }
) => {
  const init: RequestInit = {
    method: options.arg.method,
    headers: {
      ...options.arg.signature,
    },
  };

  if (options.arg.data) {
    init.body = JSON.stringify(options.arg.data);
  }

  if (
    typeof options.arg.params === "object" &&
    Object.keys(options.arg.params).length
  ) {
    let search = new URLSearchParams(options.arg.params);
    url = `${url}?${search.toString()}`;
  }

  return mutate(url, init);
};

export const useMutation = <T, E>(
  url: string,
  method: HTTP_METHOD = "POST",
  options?: SWRMutationConfiguration<T, E>
) => {
  const apiBaseUrl = useConfig("apiBaseUrl");

  let fullUrl = url;
  if (!url.startsWith("http")) {
    fullUrl = `${apiBaseUrl}${url}`;
  }

  const account = useAccountInstance();
  const signer = account.signer;
  const { trigger, data, error, reset, isMutating } = useSWRMutation(
    fullUrl,
    // method === "POST" ? fetcher : deleteFetcher,
    fetcher,
    options
  );

  const mutation = async (data: any, params?: any): Promise<any> => {
    let newUrl = url;
    if (typeof params === "object" && Object.keys(params).length) {
      let search = new URLSearchParams(params);
      newUrl = `${url}?${search.toString()}`;
    }

    const payload: MessageFactor = {
      method,
      url: newUrl,
      data,
    };

    const signature = await signer.sign(payload);

    return trigger({
      data,
      params,
      method,
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
  ] as const;
};
