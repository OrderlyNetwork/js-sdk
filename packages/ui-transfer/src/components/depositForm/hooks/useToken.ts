import { useCallback, useEffect, useState } from "react";
import { API } from "@orderly.network/types";
import { getTokenByTokenList } from "../../../utils";
import { CurrentChain } from "./useChainSelect";

type Options = {
  currentChain: CurrentChain | null;
  tokensFilter?: (chainInfo: API.Chain) => API.TokenInfo[];
};

// TODO: 需要替换成真实数据
const hardCode = [
  {
    token: "USDC",
    decimals: 6,
    minimum_withdraw_amount: 0.000001,
    base_weight: 1,
    discount_factor: null,
    haircut: 0,
    user_max_qty: -1,
    is_collateral: true,
    display_name: "USDC",
    address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    symbol: "USDC",
  },
  {
    token: "ETH",
    decimals: 6,
    minimum_withdraw_amount: 0.000001,
    base_weight: 1,
    discount_factor: null,
    haircut: 0,
    user_max_qty: -1,
    is_collateral: true,
    display_name: "ETH",
    address: "",
    symbol: "ETH",
  },
  {
    token: "USDT",
    decimals: 6,
    minimum_withdraw_amount: 0.000001,
    base_weight: 1,
    discount_factor: null,
    haircut: 0,
    user_max_qty: -1,
    is_collateral: true,
    display_name: "USDT",
    address: "0xEf54C221Fc94517877F0F40eCd71E0A3866D66C2",
    symbol: "USDT",
  },
];

export const useToken = (options: Options) => {
  const { currentChain, tokensFilter } = options;

  const [fromToken, setFromToken] = useState<API.TokenInfo>(hardCode[0] as any);
  const [toToken, setToToken] = useState<API.TokenInfo>(hardCode[0] as any);
  const [tokens, setTokens] = useState<API.TokenInfo[]>(hardCode as any);

  // when chain changed and chain data ready then call this function
  const onChainInited = useCallback(
    (chainInfo?: API.Chain) => {
      if (chainInfo && chainInfo?.token_infos?.length > 0) {
        const tokens =
          typeof tokensFilter === "function"
            ? tokensFilter(chainInfo)
            : chainInfo.token_infos;
        setTokens(tokens);
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

  // TODO: 暂时注释掉，后面需要替换成真实数据
  // useEffect(() => {
  //   onChainInited(currentChain?.info);
  //   // if settingChain is true, the currentChain will change, so use currentChain.id
  // }, [currentChain?.id, onChainInited]);

  return {
    fromToken,
    toToken,
    tokens,
    onFromTokenChange: setFromToken,
    onToTokenChange: setToToken,
  };
};
