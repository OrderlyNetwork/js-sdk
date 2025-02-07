import { useEffect, useState } from "react";
import {
  useChains,
  useConfig,
  useAccount,
  useWalletConnector,
} from "@orderly.network/hooks";
import { API, NetworkId } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";

export type UseChainMenuScriptReturn = ReturnType<typeof useChainMenuScript>;

export const useChainMenuScript = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chains] = useChains();
  const { state } = useAccount();
  const { connectedChain } = useWalletConnector();
  const {
    wrongNetwork,
    currentChainId,
    setCurrentChainId,
    currentChainFallback,
  } = useAppContext();

  const networkId = useConfig("networkId") as NetworkId;

  useEffect(() => {
    if (connectedChain) {
      setCurrentChainId?.(
        typeof connectedChain.id === "number"
          ? connectedChain.id
          : parseInt(connectedChain.id)
      );
    } else {
      if (!!currentChainId) return;
      let fallbackChain: API.Chain | undefined;

      const firstChain =
        networkId === "mainnet" ? chains.mainnet?.[0] : chains.testnet?.[0];

      if (typeof currentChainFallback === "function") {
        fallbackChain = currentChainFallback(chains, networkId);
      }

      const defaultChain = fallbackChain! || firstChain;

      if (!defaultChain) return;

      setCurrentChainId?.(defaultChain.network_infos?.chain_id);
    }
  }, [
    connectedChain,
    chains,
    currentChainId,
    networkId,
    setCurrentChainId,
    currentChainFallback,
  ]);

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
