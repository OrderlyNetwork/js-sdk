import { useEffect, useMemo, useState } from "react";
import { useHoldingStream } from "./useHoldingStream";

import { Decimal } from "@orderly.network/utils";
import { useCollateral } from "./useCollateral";

export type WithdrawInputs = {
  amoutn: number;
  address: string;
};

export const useWithdraw = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // const positions = usePositionStream();
  const { unsettledPnL, availableBalance } = useCollateral();

  const withdraw = (amount: number): Promise<any> => {
    return Promise.resolve();
  };

  const { usdc } = useHoldingStream();

  const maxAmount = useMemo(() => {
    if (!usdc || !usdc.holding) return 0;

    if (unsettledPnL >= 0) return usdc?.holding ?? 0;

    return new Decimal(usdc.holding).add(unsettledPnL).toNumber();
  }, [usdc, unsettledPnL]);

  // const availableBalance = 0;

  return { withdraw, isLoading, maxAmount, availableBalance, unsettledPnL };
};
