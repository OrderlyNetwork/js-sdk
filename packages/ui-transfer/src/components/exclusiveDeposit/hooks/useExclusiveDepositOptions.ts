import { useMemo } from "react";
import { useChains, useConfig } from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";

export type ExclusiveDepositNetwork = {
  label: string;
  value: string;
  chainId: number;
  explorerUrl: string;
};

export type ExclusiveDepositToken = {
  label: string;
  value: string;
};

// Supported chain IDs for exclusive deposit per environment
const SUPPORTED_CHAINS: Record<string, number[]> = {
  prod: [42161],
  testnet: [421614],
};

// Supported tokens for exclusive deposit
const SUPPORTED_TOKENS = ["USDC"];

export const useExclusiveDepositOptions = () => {
  const env = useConfig("env");
  const networkId = useConfig("networkId") as NetworkId;

  const [chains, { findByChainId }] = useChains(networkId, {
    pick: "network_infos",
  });

  const supportedChainIds =
    env === "prod" ? SUPPORTED_CHAINS.prod : SUPPORTED_CHAINS.testnet;

  const networkOptions = useMemo<ExclusiveDepositNetwork[]>(() => {
    return supportedChainIds.map((chainId) => {
      const chain = findByChainId(chainId);
      const name = chain?.network_infos?.name ?? `Chain ${chainId}`;
      const explorerUrl = chain?.network_infos?.explorer_base_url ?? "";
      return {
        label: name,
        value: String(chainId),
        chainId,
        explorerUrl,
      };
    });
  }, [supportedChainIds, findByChainId]);

  const tokenOptions = useMemo<ExclusiveDepositToken[]>(() => {
    return SUPPORTED_TOKENS.map((symbol) => ({
      label: symbol,
      value: symbol,
    }));
  }, []);

  return { networkOptions, tokenOptions };
};
