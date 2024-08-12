import {
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";

import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@orderly.network/react-app";

export const useChainMenuBuilderScript = () => {
  const [chains] = useChains();
  const { state } = useAccount();
  const { setChain, connectedChain } = useWalletConnector();

  const [currentChainId, setCurrentChainId] = useState<number | undefined>();

  const { wrongNetwork, onChainChanged } = useAppContext();

  useEffect(() => {
    if (connectedChain) {
      setCurrentChainId(
        typeof connectedChain.id === "number"
          ? connectedChain.id
          : parseInt(connectedChain.id)
      );
    } else {
      if (!!currentChainId) return;
      const firstChain =
        chains.mainnet?.[0]?.network_infos ||
        chains.testnet?.[0]?.network_infos;
      if (!firstChain) return;
      setCurrentChainId(firstChain.chain_id);
    }
  }, [connectedChain, chains]);

  const onChainChange = async (chain: { id: number; isTestnet: boolean }) => {
    if (!connectedChain) return;
    const result = await setChain({
      chainId: chain.id,
    });

    if (!result) return;

    onChainChanged?.(chain.id, chain.isTestnet);
  };

  return {
    chains: {
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
    },
    // currentChain,
    currentChainId,
    onChange: onChainChange,
    isConnected: !!connectedChain,
    wrongNetwork,
    accountStatus: state.status,
  };
};

export type UseChainMenuBuilderScript = ReturnType<
  typeof useChainMenuBuilderScript
>;
