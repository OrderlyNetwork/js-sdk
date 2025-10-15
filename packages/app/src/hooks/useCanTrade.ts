import { useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { useAppContext } from "../provider/appStateContext";

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
