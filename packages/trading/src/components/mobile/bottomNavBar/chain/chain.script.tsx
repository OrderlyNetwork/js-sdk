import { useConfig } from "@kodiak-finance/orderly-hooks";
import { useAppContext } from "@kodiak-finance/orderly-react-app";

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
