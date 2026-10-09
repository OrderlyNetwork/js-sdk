import { useSWRConfig } from "swr";
import { useMemoizedFn } from "./shared/useMemoizedFn";
import { useAccount } from "./useAccount";
import { refreshAccountOrderQueries } from "./utils/orderQueryRefresh";

/** Refresh mounted ordinary/algo order queries for the current account only. */
export function useRefreshOrderCaches() {
  const { cache } = useSWRConfig();
  const { state } = useAccount();
  const accountId = useMemoizedFn(() => state.accountId);
  return useMemoizedFn(
    async (expectedAccountId = accountId()): Promise<void> => {
      if (!expectedAccountId || expectedAccountId !== accountId()) return;
      await refreshAccountOrderQueries(
        cache,
        expectedAccountId,
        () => expectedAccountId === accountId(),
      );
    },
  );
}
