import { useCallback, useState } from "react";
import { toast } from "@orderly.network/ui";
import { useEventEmitter } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";

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
  const { t } = useTranslation();

  const onApprove = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    return approve(quantity)
      .then((res: any) => {
        toast.success(t("transfer.deposit.approve.success"));
      })
      .catch((err) => {
        console.error("approve error", err);
        toast.error(
          err.message || err.errorCode || t("transfer.deposit.approve.failed")
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [approve, submitting, quantity, allowance, t]);

  const doDeposit = useCallback(async () => {
    return deposit()
      .then((res: any) => {
        toast.success(t("transfer.deposit.requested"));
        ee.emit("deposit:requested");
        onSuccess?.();
      })
      .catch((err) => {
        console.error("deposit error", err);
        toast.error(
          err.message || err.errorCode || t("transfer.deposit.failed")
        );
      });
  }, [deposit, onSuccess, t]);

  const onDeposit = useCallback(() => {
    const num = Number(quantity);

    if (isNaN(num) || num <= 0) {
      toast.error(t("transfer.quantity.invalid"));
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
  }, [quantity, submitting, doDeposit, enableCustomDeposit, customDeposit, t]);

  return { submitting, onApprove, onDeposit };
}
