/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useChains, useConfig, useAppStore } from "@orderly.network/hooks";
import { Arbitrum, type API, type NetworkId } from "@orderly.network/types";

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

interface Options {
  defaultValue?: string;
}

export const useToken = (options: Options) => {
  const { defaultValue } = options;

  const config = useConfig();

  const networkId = config.get("networkId") as NetworkId;

  const [, { findByChainId }] = useChains(networkId, {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const [sourceToken, setSourceToken] = useState<API.Chain>();
  const [targetToken, setTargetToken] = useState<API.Chain>();
  const [sourceTokens, setSourceTokens] = useState<API.Chain[]>([]);

  const tokensInfo = useAppStore((state) => state.tokensInfo);

  const chain = findByChainId(Arbitrum.id);

  const chainId = chain?.network_infos?.chain_id;

  const newTokensInfo = useMemo(() => {
    if (!tokensInfo) {
      return [];
    }
    return tokensInfo
      .filter((item) => item.on_chain_swap)
      .map<API.Chain>((item) => {
        const findToken = chain?.token_infos?.find(
          ({ symbol }) => symbol === item.token,
        );
        return {
          ...item,
          symbol: item.token,
          address: findToken?.address,
          decimals: item.chain_details[0]?.decimals,
          precision: item.decimals,
        };
      });
  }, [chain?.token_infos, tokensInfo]);

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
    chainId,
    sourceToken,
    sourceTokens,
    onSourceTokenChange: setSourceToken,
    targetToken,
  };
};
