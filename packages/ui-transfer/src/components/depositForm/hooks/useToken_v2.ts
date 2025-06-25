import { useCallback, useEffect, useState } from "react";
import type { API } from "@orderly.network/types";
import { getTokenByTokenList } from "../../../utils";
import type { CurrentChain } from "./useChainSelect";

interface Options {
  currentChain?: CurrentChain | null;
  tokensFilter?: (chainInfo: API.Chain) => API.TokenInfo[];
}

export const useToken = (options: Options) => {
  const { currentChain, tokensFilter } = options;

  const [sourceToken, setSourceToken] = useState<API.TokenInfo>();
  const [targetToken, setTargetToken] = useState<API.TokenInfo>();

  const [sourceTokens, setSourceTokens] = useState<API.TokenInfo[]>([]);
  const [targetTokens, setTargetTokens] = useState<API.TokenInfo[]>([]);

  // when chain changed and chain data ready then call this function
  const onChainInited = useCallback(
    (chainInfo?: API.Chain) => {
      if (chainInfo && chainInfo?.token_infos?.length > 0) {
        const tokens =
          typeof tokensFilter === "function"
            ? tokensFilter(chainInfo)
            : chainInfo.token_infos.filter((i) => i.is_collateral);
        const usdcToken = getTokenByTokenList(tokens);
        if (!usdcToken) {
          return;
        }
        setSourceToken(usdcToken);
        setTargetToken(usdcToken);

        setSourceTokens(tokens);
        setTargetTokens([usdcToken]);
      }
    },
    [tokensFilter],
  );

  useEffect(() => {
    onChainInited(currentChain?.info);
    // if settingChain is true, the currentChain will change, so use currentChain.id
  }, [currentChain?.id, onChainInited]);

  useEffect(() => {
    if (!sourceToken || !sourceTokens.length) {
      return;
    }
    if (sourceToken.symbol === "USDC") {
      setTargetTokens([sourceToken]);
      setTargetToken(sourceToken);
    } else {
      const usdc = sourceTokens.find((t) => t.symbol === "USDC")!;
      setTargetTokens([usdc, sourceToken]);
      if (targetToken?.symbol !== usdc.symbol) {
        setTargetToken(usdc);
      }
    }
  }, [sourceToken, sourceTokens]);

  return {
    sourceToken,
    targetToken,

    sourceTokens,
    targetTokens,

    onSourceTokenChange: setSourceToken,
    onTargetTokenChange: setTargetToken,
  };
};
