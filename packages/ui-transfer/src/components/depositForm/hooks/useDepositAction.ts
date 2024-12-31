import { useCallback, useState } from "react";
import { toast } from "@orderly.network/ui";
import {
  useEventEmitter,
  useNetworkInfo,
} from "@orderly.network/hooks";
import { EnumTrackerKeys } from "@orderly.network/types";


type Options = {
  quantity: string;
  allowance?: string;
  approve: (quantity?: string) => Promise<any>;
  deposit: () => Promise<any>;
  onSuccess?: () => void;
  customDeposit?: () => Promise<any>;
  enableCustomDeposit?: boolean;
};

export function useDepositAction(options: Options) {
  const {
    quantity,
    allowance,
    approve,
    deposit,
    enableCustomDeposit,
    customDeposit,
    onSuccess,
  } = options;
  const [submitting, setSubmitting] = useState(false);
  const ee = useEventEmitter();
  const {wallet,network} = useNetworkInfo()

  const onApprove = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    return approve(quantity)
      .then((res: any) => {
        toast.success("Approve success");
      })
      .catch((err) => {
        console.error("approve error", err);
        toast.error(err.message || err.errorCode || "Approve failed");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [approve, submitting, quantity, allowance]);

  const doDeposit = useCallback(async () => {
    return deposit()
      .then((res: any) => {
        toast.success("Deposit requested");
        ee.emit("deposit:requested");
        ee.emit(EnumTrackerKeys["deposit:success"], {
          wallet,
          network,
          quantity,
        });
        onSuccess?.();
      })
      .catch((err) => {
        console.error("deposit error", err);
        ee.emit(EnumTrackerKeys["deposit:failed"], {
          wallet,
          network,
          msg: JSON.stringify(err),
        });
        toast.error(err.message || err.errorCode || "Deposit failed");
      });
  }, [deposit, onSuccess, quantity]);

  const onDeposit = useCallback(() => {
    const num = Number(quantity);

    if (isNaN(num) || num <= 0) {
      toast.error("Please input a valid number");
      return;
    }

    // if (!token) {
    //   toast.error("Please select a token");
    //   return;
    // }

    // if (inputStatus !== "default") {
    //   return;
    // }

    if (submitting) return;

    setSubmitting(true);

    const execDeposit = enableCustomDeposit ? customDeposit : doDeposit;

    execDeposit?.()?.finally(() => {
      setSubmitting(false);
    });
  }, [quantity, submitting, doDeposit, enableCustomDeposit, customDeposit]);

  return { submitting, onApprove, onDeposit };
}
