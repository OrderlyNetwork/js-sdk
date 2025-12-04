import { useMemo } from "react";
import { useAccount } from "@veltodefi/hooks";
import { useAppContext } from "@veltodefi/react-app";
import { AccountStatusEnum } from "@veltodefi/types";

export function useCanTrade() {
  const { state } = useAccount();

  const { wrongNetwork, disabledConnect } = useAppContext();

  const canTrade = useMemo(() => {
    return (
      !wrongNetwork &&
      !disabledConnect &&
      (state.status === AccountStatusEnum.EnableTrading ||
        state.status === AccountStatusEnum.EnableTradingWithoutConnected)
    );
  }, [state.status, wrongNetwork, disabledConnect]);

  return canTrade;
}
