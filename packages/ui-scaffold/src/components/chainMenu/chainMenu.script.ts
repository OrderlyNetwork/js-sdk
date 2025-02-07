import { useEffect, useState } from "react";
import {
  useChains,
  useConfig,
  useAccount,
  useWalletConnector,
} from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";

export type UseChainMenuScriptReturn = ReturnType<typeof useChainMenuScript>;

export const useChainMenuScript = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chains] = useChains();
  const { state } = useAccount();
  const { connectedChain } = useWalletConnector();
  const { wrongNetwork, currentChainId, setCurrentChainId } = useAppContext();

  const networkId = useConfig("networkId") as NetworkId;

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
        networkId === "mainnet"
          ? chains.mainnet?.[0]?.network_infos
          : chains.testnet?.[0]?.network_infos;

      if (!firstChain) return;

      setCurrentChainId(firstChain.chain_id);
    }
  }, [connectedChain, chains, currentChainId, networkId, setCurrentChainId]);

  const hide = () => {
    setOpen(false);
  };

  const onChainChangeBefore = () => {
    setLoading(true);
    hide();
  };

  const onChainChangeAfter = () => {
    setLoading(false);
  };

  return {
    currentChainId,
    isConnected: !!connectedChain,
    wrongNetwork,
    accountStatus: state.status,
    networkId,
    open,
    onOpenChange: setOpen,
    hide,
    onChainChangeBefore,
    onChainChangeAfter,
    loading,
  };
};

export type UseChainMenuBuilderScript = ReturnType<typeof useChainMenuScript>;
