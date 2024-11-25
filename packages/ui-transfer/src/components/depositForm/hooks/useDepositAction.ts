import { useCallback, useState } from "react";
import { toast } from "@orderly.network/ui";
import { useEventEmitter } from "@orderly.network/hooks";

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
        onSuccess?.();
      })
      .catch((err) => {
        console.error("deposit error", err);
        toast.error(err.message || err.errorCode || "Deposit failed");
      });
  }, [deposit, onSuccess, ee]);

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
