import { useContext } from "react";

import useSWRInfinite, {
  type SWRInfiniteKeyLoader,
  type SWRInfiniteConfiguration,
} from "swr/infinite";
// import { apiPrefixMiddleware } from "./middleware/apiPrefixMiddleware";
import { signatureMiddleware } from "./middleware/signatureMiddleware";
import { OrderlyContext } from "./orderlyContext";
import { get } from "@orderly.network/net";
import { useAccount } from "./useAccount";
import { AccountStatusEnum } from "@orderly.network/types";

const fetcher = (url: string, init: RequestInit) => get(url, init);

export const usePrivateInfiniteQuery = (
  getKey: SWRInfiniteKeyLoader,
  options?: SWRInfiniteConfiguration
) => {
  const account = useAccount();

  const middleware = Array.isArray(options?.use) ? options?.use ?? [] : [];

  const result = useSWRInfinite(
    (pageIndex: number, previousPageData) =>
      account.state.status >= AccountStatusEnum.SignedIn
        ? getKey(pageIndex, previousPageData)
        : null,
    fetcher,
    {
      ...options,
      use: [signatureMiddleware, ...middleware],
    }
  );

  return result;
};
