import { useCallback, useMemo } from "react";
import { useMutation } from "../useMutation";
import { useCollateral } from "./useCollateral";

export type TransferReturn = ReturnType<typeof useTransfer>;

type Receiver = {
  account_id: string;
  amount: number;
};

export const useTransfer = () => {
  const { unsettledPnL, availableBalance, freeCollateral } = useCollateral();

  const [doTransfer, { isMutating: submitting }] = useMutation(
    "/v1/internal_transfer",
    "POST",
  );

  const transfer = useCallback(
    async (token: string, receivers: Receiver | Receiver[]) => {
      return doTransfer({
        token,
        receiver_list: Array.isArray(receivers) ? receivers : [receivers],
      })
        .then((res) => {
          if (res.success) {
            return res;
          }
          throw new Error(res.message);
        })
        .catch((err) => {
          throw err;
        });
    },
    [doTransfer],
  );

  const maxAmount = useMemo(() => {
    return freeCollateral;
  }, [freeCollateral]);

  const availableTransfer = useMemo(() => {
    if (unsettledPnL < 0) {
      return freeCollateral;
    } else {
      return freeCollateral - unsettledPnL;
    }
  }, [freeCollateral, unsettledPnL]);

  const dst = useMemo(() => {
    return {
      symbol: "USDC",
      decimals: 6,
    };
  }, []);

  return {
    submitting,
    transfer,
    maxAmount,
    dst,
    unsettledPnL,
    availableBalance,
    availableTransfer,
  };
};
