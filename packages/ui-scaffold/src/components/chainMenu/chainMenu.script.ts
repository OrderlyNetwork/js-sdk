import { useEffect, useState } from "react";
import {
  useChains,
  useConfig,
  useAccount,
  useWalletConnector,
} from "@orderly.network/hooks";
import { API, Chain, NetworkId } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";

export type UseChainMenuScriptReturn = ReturnType<typeof useChainMenuScript>;

export const useChainMenuScript = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chains] = useChains();
  const { state } = useAccount();
  const { connectedChain } = useWalletConnector();
  const { wrongNetwork, currentChainId, setCurrentChainId, defaultChain } =
    useAppContext();

  console.log("currentChainId", currentChainId);

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
      let fallbackChain: Partial<Chain> | undefined;

      const firstChain =
        networkId === "mainnet" ? chains.mainnet?.[0] : chains.testnet?.[0];

      if (typeof defaultChain === "function") {
        fallbackChain = defaultChain(networkId, chains);
      } else if (typeof defaultChain === "object") {
        fallbackChain =
          networkId === "mainnet"
            ? defaultChain?.mainnet
            : defaultChain?.testnet;
      }

      const chainId = fallbackChain?.id || firstChain?.network_infos?.chain_id;
      if (!chainId) return;

      setCurrentChainId?.(chainId);
    }
  }, [
    connectedChain,
    chains,
    currentChainId,
    networkId,
    setCurrentChainId,
    defaultChain,
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
