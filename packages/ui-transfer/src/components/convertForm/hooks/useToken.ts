import { useCallback, useEffect, useState } from "react";
import type { API } from "@orderly.network/types";
import type { CurrentChain } from "../../depositForm/hooks";

const splitTokenBySymbol = <T extends API.TokenInfo>(items: T[]) => {
  return items.reduce<Record<"usdc" | "others", T[]>>(
    (result, item) => {
      if (item.symbol.toUpperCase() === "USDC") {
        result.usdc.push(item);
      } else {
        result.others.push(item);
      }
      return result;
    },
    { usdc: [], others: [] },
  );
};

interface Options {
  currentChain?: CurrentChain | null;
}

export const useToken = (options: Options) => {
  const { currentChain } = options;

  const [sourceToken, setSourceToken] = useState<API.TokenInfo>();
  const [targetToken, setTargetToken] = useState<API.TokenInfo>();
  const [sourceTokens, setSourceTokens] = useState<API.TokenInfo[]>([]);

  // when chain changed and chain data ready then call this function
  const onChainInited = useCallback((chainInfo?: API.Chain) => {
    if (chainInfo && chainInfo?.token_infos?.length > 0) {
      const { usdc, others } = splitTokenBySymbol(chainInfo.token_infos);
      setSourceToken(others[0]);
      setSourceTokens(others);
      setTargetToken(usdc[0]);
    }
  }, []);

  useEffect(() => {
    onChainInited(currentChain?.info);
  }, [currentChain?.id, onChainInited]);

  return {
    sourceToken,
    sourceTokens,
    onSourceTokenChange: setSourceToken,
    targetToken,
  };
};
