import { useMemo } from "react";
import { useAccount } from "@kodiak-finance/orderly-hooks";
import { useAppContext } from "@kodiak-finance/orderly-react-app";
import { AccountStatusEnum } from "@kodiak-finance/orderly-types";

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
