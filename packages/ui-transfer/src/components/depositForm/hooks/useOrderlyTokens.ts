import { useCallback, useEffect, useState } from "react";
import { API } from "@orderly.network/types";
import { CurrentChain } from "../../../types";
import { sortTokensWithUSDCFirst } from "../../../utils";

export const useOrderlyTokens = (currentChain?: CurrentChain | null) => {
  const [orderlyTokens, setOrderlyTokens] = useState<API.TokenInfo[]>([]);

  // when chain changed and chain data ready then call this function init tokens
  const onChainInited = useCallback((chainInfo?: API.Chain) => {
    if (chainInfo && chainInfo?.token_infos?.length > 0) {
      const orderlyTokens = chainInfo.token_infos;

      const tokens = sortTokensWithUSDCFirst(orderlyTokens);

      setOrderlyTokens(tokens);
    }
  }, []);

  useEffect(() => {
    onChainInited(currentChain?.info);
  }, [currentChain]);

  return orderlyTokens;
};
