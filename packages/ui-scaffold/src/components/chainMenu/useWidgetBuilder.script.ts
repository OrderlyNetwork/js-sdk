import {
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";

import { useMemo } from "react";
import { useAppContext } from "@orderly.network/react-app";

export const useChainMenuBuilderScript = () => {
  const [chains, { findByChainId }] = useChains();
  const { setChain, connectedChain } = useWalletConnector();
  const { state } = useAccount();

  const { wrongNetwork } = useAppContext();

  const currentChain = useMemo(() => {
    const chainId = state.connectWallet?.chainId;
    let chain;

    if (chainId) {
      chain = findByChainId(chainId);
    }

    if (chain) {
      return {
        name: chain.network_infos.name,
        id: chainId,
        lowestFee: chain.network_infos.bridgeless,
      };
    }

    // if (!chain) return null;
    // if chain is null then return the first chain
    const firstChain = chains.mainnet?.[0]?.network_infos;

    if (!firstChain) return null;

    return {
      name: firstChain.name,
      id: firstChain.chain_id,
      lowestFee: firstChain.bridgeless,
    };
  }, [state, chains]);

  //

  const onChainChange = (chain: { id: number }) => {
    if (!connectedChain) return;
    return setChain({
      chainId: chain.id,
    });
  };

  return {
    chains: {
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
    },
    currentChain,
    onChange: onChainChange,
    isConnected: !!connectedChain,
    wrongNetwork,
  };
};

export type UseChainMenuBuilderScript = ReturnType<
  typeof useChainMenuBuilderScript
>;
