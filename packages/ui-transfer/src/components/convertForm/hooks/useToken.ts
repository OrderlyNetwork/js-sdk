import { useEffect, useMemo, useState } from "react";
import { useTokensInfo } from "@orderly.network/hooks";
import { Arbitrum, type API } from "@orderly.network/types";

const splitTokenBySymbol = <T extends API.Chain>(items: T[]) => {
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

const findChainInfo = (tokenInfo: API.Chain) => {
  const arbitrumChainInfo = tokenInfo.chain_details.find(
    (item) => parseInt(item.chain_id) === Arbitrum.id,
  );

  const nativeTokenChainInfo = tokenInfo.chain_details.find(
    (item) => !item.contract_address,
  );

  const nativeTokenAddress = "0x0000000000000000000000000000000000000000";

  if (arbitrumChainInfo) {
    return {
      contract_address:
        arbitrumChainInfo.contract_address || nativeTokenAddress,
      quoteChainId: arbitrumChainInfo.chain_id,
      decimals: arbitrumChainInfo.decimals,
    };
  }

  if (nativeTokenChainInfo) {
    return {
      contract_address: nativeTokenAddress,
      quoteChainId: nativeTokenChainInfo.chain_id,
      decimals: nativeTokenChainInfo.decimals,
    };
  }

  return {
    contract_address: tokenInfo.chain_details[0]?.contract_address,
    quoteChainId: tokenInfo.chain_details[0]?.chain_id,
    decimals: tokenInfo.chain_details[0]?.decimals,
  };
};

interface Options {
  defaultValue?: string;
}

type ConvertTokenInfo = API.Chain & {
  contract_address: string;
  quoteChainId: string;
  precision: number;
};

export const useToken = (options: Options) => {
  const { defaultValue } = options;

  const [sourceToken, setSourceToken] = useState<ConvertTokenInfo>();
  const [targetToken, setTargetToken] = useState<ConvertTokenInfo>();
  const [sourceTokens, setSourceTokens] = useState<ConvertTokenInfo[]>([]);

  const tokensInfo = useTokensInfo();

  const newTokensInfo = useMemo(() => {
    const filteredTokensInfo = tokensInfo.filter((item) => item.on_chain_swap);

    return filteredTokensInfo.map((item) => {
      const chainInfo = findChainInfo(item);
      return {
        ...item,
        symbol: item.token,
        precision: item.decimals ?? 6,
        ...chainInfo,
      };
    });
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

  const targetChainInfo = useMemo(() => {
    const info = targetToken?.chain_details?.find(
      (item) => item.chain_id === sourceToken?.quoteChainId,
    );
    return {
      ...info,
      precision: targetToken?.precision,
    };
  }, [sourceToken, targetToken]);

  return {
    sourceToken,
    sourceTokens,
    onSourceTokenChange: setSourceToken,
    targetToken,
    targetChainInfo,
  };
};
