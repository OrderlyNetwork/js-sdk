import { useMemo } from "react";
import { useConfig } from "@orderly.network/hooks";
import { useChains, useWalletConnector } from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";

export const useChainSelectorBuilder = (options?: {
  networkId?: NetworkId;
  bridgeLessOnly?: boolean;
}) => {
  const { networkId, bridgeLessOnly } = options || {};
  const config = useConfig();
  const [chains, { checkChainSupport }] = useChains();
  const { setChain, connectedChain } = useWalletConnector();

  const { onChainChanged, currentChainId, setCurrentChainId } = useAppContext();

  const onChainChange = async (chain: { id: number }) => {
    console.log('-- on chanin change ', chain, connectedChain, currentChainId);
    if (!connectedChain) {
      setCurrentChainId(chain.id);
      return {
        result: true,
        wrongNetwork: false,
        chainId: chain.id,
      }
      // return Promise.reject("No connected chain");
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
    const filteredChains = bridgeLessOnly
      ? chains.mainnet.filter((chain) => chain.network_infos.bridgeless)
      : chains.mainnet;

    const _chains = {
      mainnet: filteredChains.map((chain) => ({
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
  }, [chains, networkId, bridgeLessOnly]);

  return {
    chains: filteredChains,
    onChainChange,
    chainChangedCallback: onChainChanged,
    currentChainId: (connectedChain?.id ?? currentChainId )  as number | undefined,
  };
};
