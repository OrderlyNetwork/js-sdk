import { useCallback, useEffect, useState } from "react";
import { nativeETHAddress, type API } from "@orderly.network/types";
import { getTokenByTokenList } from "../../../utils";
import type { CurrentChain } from "./useChainSelect";

export const useToken = (
  currentChain?: CurrentChain | null,
  filter: (token: API.TokenInfo) => boolean = () => true,
) => {
  const [sourceToken, setSourceToken] = useState<API.TokenInfo>();
  const [targetToken, setTargetToken] = useState<API.TokenInfo>();

  const [sourceTokens, setSourceTokens] = useState<API.TokenInfo[]>([]);
  const [targetTokens, setTargetTokens] = useState<API.TokenInfo[]>([]);

  // when chain changed and chain data ready then call this function init tokens
  const onChainInited = useCallback((chainInfo?: API.Chain) => {
    if (chainInfo && chainInfo?.token_infos?.length > 0) {
      // const tokens = chainInfo.token_infos.filter((i) => i.is_collateral);
      // all tokens available in the chain, include swap tokens
      const tokens = chainInfo.token_infos?.filter(filter)?.map((item) => {
        // if sourceToken is ETH, set address to nativeETHAddress
        if (!item.address && item.symbol === "ETH") {
          item.address = nativeETHAddress;
        }
        return item;
      });

      const usdcToken = getTokenByTokenList(tokens);
      if (!usdcToken) {
        return;
      }
      setSourceToken(usdcToken);
      setTargetToken(usdcToken);

      setSourceTokens(tokens);
      setTargetTokens([usdcToken]);
    }
  }, []);

  useEffect(() => {
    onChainInited(currentChain?.info);
    // if settingChain is true, the currentChain will change, so use currentChain.id
    // TODO:  confirm currentChain data is correct
  }, [currentChain, onChainInited]);

  useEffect(() => {
    if (!sourceToken || !sourceTokens.length) {
      return;
    }

    // USDC => USDC
    if (sourceToken.symbol === "USDC") {
      setTargetToken(sourceToken);
      setTargetTokens([sourceToken]);
      return;
    }

    const usdc = sourceTokens.find((t) => t.symbol === "USDC")!;

    // if is_collateral: [token] => [USDC,token]
    if (sourceToken.is_collateral) {
      setTargetToken(usdc);
      setTargetTokens([usdc, sourceToken]);
      return;
    }

    // if swap token: [token] => [USDC]
    setTargetToken(usdc);
    setTargetTokens([usdc]);
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
