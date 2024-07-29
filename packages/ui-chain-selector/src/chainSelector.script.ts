import { useChains, useWalletConnector } from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";
import { useMemo } from "react";

export const useChainSelectorBuilder = (options?: {
  networkId?: NetworkId;
}) => {
  const { networkId } = options || {};
  const [chains] = useChains();
  const { setChain, connectedChain } = useWalletConnector();

  const onChainChange = (chain: { id: number }) => {
    if (!connectedChain) {
      return Promise.reject("No connected chain");
    }
    return setChain({
      chainId: chain.id,
    });
  };

  const filteredChains = useMemo(() => {
    const _chains = {
      mainnet: chains.mainnet.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
      })),
      testnet: chains.testnet.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
      })),
    };

    if (typeof networkId === "undefined") {
      return _chains;
    }

    if (networkId === "testnet") {
      return {
        testnet: _chains.testnet,
      };
    }

    return {
      mainnet: _chains.mainnet,
    };
  }, [chains, networkId]);

  return {
    chains: filteredChains,
    onChainChange,
    currentChainId: connectedChain?.id as number | undefined,
  };
};
