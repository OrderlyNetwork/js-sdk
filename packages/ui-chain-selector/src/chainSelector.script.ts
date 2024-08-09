import { useMemo } from "react";
import { useConfig } from "@orderly.network/hooks";
import { useChains, useWalletConnector } from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";

export const useChainSelectorBuilder = (options?: {
  networkId?: NetworkId;
}) => {
  const { networkId } = options || {};
  const config = useConfig();
  const [chains, { checkChainSupport }] = useChains();
  const { setChain, connectedChain } = useWalletConnector();

  const { onChainChanged } = useAppContext();

  const onChainChange = async (chain: { id: number }) => {
    if (!connectedChain) {
      return Promise.reject("No connected chain");
    }
    const result = await setChain({
      chainId: chain.id,
    });

    if (!result) return result;

    return {
      result,
      wrongNetwork: !checkChainSupport(
        chain.id,
        config.get("networkId") as NetworkId
      ),
      chainId: chain.id,
    };
  };

  const filteredChains = useMemo(() => {
    const _chains = {
      mainnet: chains.mainnet.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
        isTestnet: false,
      })),
      testnet: chains.testnet.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
        isTestnet: true,
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
    chainChangedCallback: onChainChanged,
    currentChainId: connectedChain?.id as number | undefined,
  };
};
