import { useConfig } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { useChainChangeValidation } from "@orderly.network/ui-connector";

export type UseChainScriptOptions = {
  onAccountValidated?: (status: AccountStatusEnum) => void;
};

export const useChainScript = (options: UseChainScriptOptions = {}) => {
  const config = useConfig();
  const { wrongNetwork, currentChainId, setCurrentChainId } = useAppContext();
  const { onChainChangeBefore, onChainChangeAfter } = useChainChangeValidation({
    onAccountValidated: options.onAccountValidated,
  });

  const networkId = config.get("networkId");

  return {
    currentChainId,
    setCurrentChainId,
    networkId,
    wrongNetwork,
    onChainChangeBefore,
    onChainChangeAfter,
  };
};

export type ChainState = ReturnType<typeof useChainScript>;
