import { API, CurrentChain } from "@orderly.network/types";
import { useCallback, useEffect, useState } from "react";
import { getTokenByTokenList } from "../../../utils";

type Options = {
  currentChain: CurrentChain | null;
};

export function useToken(options: Options) {
  const { currentChain } = options;
  const [token, setToken] = useState<API.TokenInfo>();
  const [tokens, setTokens] = useState<API.TokenInfo[]>([]);

  // when chain changed and chain data ready then call this function
  const onChainInited = useCallback((chainInfo?: API.Chain) => {
    if (chainInfo && chainInfo?.token_infos?.length > 0) {
      const tokens = chainInfo.token_infos;
      setTokens(tokens);

      const newToken = getTokenByTokenList(tokens);

      if (!newToken) return;

      setToken(newToken);
    }
  }, []);

  useEffect(() => {
    onChainInited(currentChain?.info);
    // if settingChain is true, the currentChain will change, so use currentChain.id
  }, [currentChain?.id]);

  return { token, tokens, onTokenChange: setToken };
}
