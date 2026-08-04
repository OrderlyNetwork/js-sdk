import { useEffect, useMemo, useState } from "react";
import { useMainTokenStore } from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";

const splitTokenBySymbol = <T extends { token?: string }>(items: T[]) => {
  return items.reduce<Record<"usdc" | "others", T[]>>(
    (result, item) => {
      if (item.token?.toUpperCase() === "USDC") {
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
  defaultValue?: string;
}

type ConvertTokenInfo = API.Token & {
  precision: number;
  symbol: string;
};

export const getConvertTokenInfo = (
  tokenInfo: API.Token,
): ConvertTokenInfo => ({
  ...tokenInfo,
  symbol: tokenInfo.token,
  precision: tokenInfo.decimals ?? 6,
});

export const useToken = (options: Options) => {
  const { defaultValue } = options;

  const [sourceToken, setSourceToken] = useState<ConvertTokenInfo>();
  const [targetToken, setTargetToken] = useState<ConvertTokenInfo>();
  const [sourceTokens, setSourceTokens] = useState<ConvertTokenInfo[]>([]);

  const tokensInfo = useMainTokenStore((state) => state.data);

  const newTokensInfo = useMemo(() => {
    const filteredTokensInfo = (tokensInfo ?? []).filter(
      (item) => item.on_chain_swap,
    );

    return filteredTokensInfo.reduce<ConvertTokenInfo[]>((result, item) => {
      result.push(getConvertTokenInfo(item));

      return result;
    }, []);
  }, [tokensInfo]);

  useEffect(() => {
    const { usdc, others } = splitTokenBySymbol(newTokensInfo);
    setSourceToken(() => {
      if (defaultValue) {
        const defaultToken = others.find(({ token }) => token === defaultValue);
        return defaultToken ? defaultToken : others[0];
      }
      return others[0];
    });
    setSourceTokens(others);
    setTargetToken(usdc[0]);
  }, [defaultValue, newTokensInfo]);

  return {
    sourceToken,
    sourceTokens,
    onSourceTokenChange: setSourceToken,
    targetToken,
  };
};
