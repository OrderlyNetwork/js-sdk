import { useEffect, useState } from "react";
import { useMemoizedFn, useTokensInfo } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { WithdrawTo } from "../../../types";
import { getTokenByTokenList } from "../../../utils";
import { CurrentChain } from "../../depositForm/hooks";
import { useToken } from "../../depositForm/hooks/useToken";

export function useWithdrawToken(params: {
  currentChain?: CurrentChain | null;
  withdrawTo: WithdrawTo;
}) {
  const { currentChain, withdrawTo } = params;
  const [token, setToken] = useState<API.TokenInfo>();
  const [tokens, setTokens] = useState<API.TokenInfo[]>([]);

  const tokensInfo = useTokensInfo();

  const { sourceToken, onSourceTokenChange, sourceTokens } = useToken(
    currentChain,
    (token) => token.symbol === "USDC" || token.is_collateral,
  );

  useEffect(() => {
    if (!tokensInfo?.length) return;

    const list = tokensInfo.map((item) => ({
      ...item,
      symbol: item.token,
      token_decimal: item.decimals,
      precision: item.decimals,
    }));

    // sort tokens, USDC should be the first
    list.sort((a, b) => {
      if (a.symbol === "USDC") return -1;
      if (b.symbol === "USDC") return 1;
      return 0;
    });

    const usdcToken = getTokenByTokenList(tokens);
    setToken(usdcToken || list?.[0]);
    setTokens(list);
  }, [tokensInfo]);

  const syncToken = useMemoizedFn(() => {
    if (withdrawTo === WithdrawTo.Account) {
      const findToken = tokens.find(
        (item) => item.symbol === sourceToken?.symbol,
      ) as API.TokenInfo;
      if (findToken) {
        setToken(findToken);
      }
    } else {
      const findToken = sourceTokens.find(
        (item) => item.symbol === token?.symbol,
      ) as API.TokenInfo;
      if (findToken) {
        onSourceTokenChange(findToken);
      }
    }
  });

  useEffect(() => {
    syncToken();
  }, [withdrawTo]);

  if (withdrawTo === WithdrawTo.Account) {
    return {
      sourceToken: token,
      onSourceTokenChange: setToken,
      sourceTokens: tokens,
    };
  }

  return {
    sourceToken,
    onSourceTokenChange,
    sourceTokens,
  };
}
