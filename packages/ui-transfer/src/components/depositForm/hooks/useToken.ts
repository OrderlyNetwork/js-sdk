import { useCallback, useEffect, useState } from "react";
import { API } from "@orderly.network/types";
import { getTokenByTokenList } from "../../../utils";
import { CurrentChain } from "./useChainSelect";

type Options = {
  currentChain: CurrentChain | null;
  tokensFilter?: (chainInfo: API.Chain) => API.TokenInfo[];
};

export const useToken = (options: Options) => {
  const { currentChain, tokensFilter } = options;
  const [fromToken, setFromToken] = useState<API.TokenInfo>();
  const [toToken, setToToken] = useState<API.TokenInfo>();
  const [tokensList, setTokensList] = useState<API.TokenInfo[]>([]);

  // when chain changed and chain data ready then call this function
  const onChainInited = useCallback(
    (chainInfo?: API.Chain) => {
      if (chainInfo && chainInfo?.token_infos?.length > 0) {
        const tokens =
          typeof tokensFilter === "function"
            ? tokensFilter(chainInfo)
            : chainInfo.token_infos;
        setTokensList(tokens);

        const newToken = getTokenByTokenList(tokens);
        if (!newToken) {
          return;
        }
        setFromToken(newToken);
        setToToken(newToken);
      }
    },
    [tokensFilter],
  );

  useEffect(() => {
    onChainInited(currentChain?.info);
    // if settingChain is true, the currentChain will change, so use currentChain.id
  }, [currentChain?.id, onChainInited]);

  return {
    fromToken,
    toToken,
    tokensList,
    onFromTokenChange: setFromToken,
    onToTokenChange: setToToken,
  };
};
