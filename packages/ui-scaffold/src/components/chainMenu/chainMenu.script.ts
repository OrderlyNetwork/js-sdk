import { useEffect, useState } from "react";
import {
  useChains,
  useConfig,
  useAccount,
  useWalletConnector,
} from "@veltodefi/hooks";
import { useAppContext } from "@veltodefi/react-app";
import { API, Chain, NetworkId } from "@veltodefi/types";

export type UseChainMenuScriptReturn = ReturnType<typeof useChainMenuScript>;

export const useChainMenuScript = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { state } = useAccount();
  const { connectedChain } = useWalletConnector();
  const { currentChainId, wrongNetwork, disabledConnect, setCurrentChainId } =
    useAppContext();
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
    disabledConnect,
    accountStatus: state.status,
    networkId,
    open,
    onOpenChange: setOpen,
    hide,
    onChainChangeBefore,
    onChainChangeAfter,
    loading,
    setCurrentChainId,
  };
};

export type UseChainMenuBuilderScript = ReturnType<typeof useChainMenuScript>;
