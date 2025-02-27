import { useConfig } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";

export const useChainScript = () => {
  const config = useConfig();
  const { wrongNetwork, currentChainId, setCurrentChainId } = useAppContext();

  const networkId = config.get("networkId");

  return {
    currentChainId,
    setCurrentChainId,
    networkId,
    wrongNetwork,
  };
};

export type ChainState = ReturnType<typeof useChainScript>;
