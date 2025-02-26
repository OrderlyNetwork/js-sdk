import { useEffect, useState } from "react";
import {
  useChains,
  useConfig,
  useAccount,
  useWalletConnector,
  useStorageChain,
} from "@orderly.network/hooks";
import { API, Chain, NetworkId } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";

export type UseChainMenuScriptReturn = ReturnType<typeof useChainMenuScript>;

export const useChainMenuScript = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { state } = useAccount();
  const { connectedChain } = useWalletConnector();
  const { wrongNetwork, currentChainId } = useAppContext();
  const networkId = useConfig("networkId") as NetworkId;

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
    isConnected: !!connectedChain,
    currentChainId,
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
