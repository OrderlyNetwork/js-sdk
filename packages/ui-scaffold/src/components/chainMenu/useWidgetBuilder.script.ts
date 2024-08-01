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

  const { wrongNetwork } = useAppContext();

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
