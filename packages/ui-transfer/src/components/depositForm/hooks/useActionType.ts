import { useMemo } from "react";
import { DepositAction } from "../../../types";

type Options = {
  isNativeToken: boolean;
  allowance: string;
  quantity: string;
  maxQuantity: string;
};

export function useActionType(options: Options) {
  const { isNativeToken, allowance, quantity, maxQuantity } = options;

  const actionType = useMemo(() => {
    const allowanceNum = isNativeToken ? Number.MAX_VALUE : Number(allowance);

    if (allowanceNum <= 0) {
      return DepositAction.ApproveAndDeposit;
    }

    const qty = Number(quantity);
    const maxQty = Number(maxQuantity);

    if (allowanceNum < qty && qty <= maxQty) {
      // return DepositAction.Increase;
      return DepositAction.ApproveAndDeposit;
    }

    return DepositAction.Deposit;
  }, [isNativeToken, allowance, quantity, maxQuantity]);

  return actionType;
}
