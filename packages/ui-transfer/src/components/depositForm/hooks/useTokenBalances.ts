import { useMemo } from "react";
import { UseDepositReturn, useSWR } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { mergeTokens } from "../utils";

export const useTokenBalances = (options: {
  orderlyTokens: API.TokenInfo[];
  swapTokens: API.TokenInfo[];
  fetchBalances: UseDepositReturn["fetchBalances"];
}) => {
  const { orderlyTokens, swapTokens, fetchBalances } = options;

  const tokens = useMemo(
    () => mergeTokens(orderlyTokens, swapTokens),
    [orderlyTokens, swapTokens],
  );

  const key = useMemo(() => {
    if (tokens?.length > 0) {
      // use tokens serialization as key, ensure tokens change to re-request
      return ["tokenBalances", tokens.map((item) => item.symbol).join(",")];
    }
    return null;
  }, [tokens]);

  const fetcher = async () => {
    if (!tokens || tokens.length === 0) {
      return {};
    }
    const balances = await fetchBalances(tokens);
    console.log("tokenBalances =>", balances);
    return balances;
  };

  const { data: balances = {}, isLoading } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    // refreshInterval: 10000,
  });

  return { balances, isLoading };
};
