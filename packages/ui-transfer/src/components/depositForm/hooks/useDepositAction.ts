import { useCallback, useState } from "react";
import { useEventEmitter } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { toast } from "@kodiak-finance/orderly-ui";

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

  const doDeposit = useCallback(async () => {
    try {
      await deposit();
      toast.success(t("transfer.deposit.requested"));
      ee.emit("deposit:requested");
      onSuccess?.();
    } catch (err: any) {
      console.error("deposit error", err);
      toast.error(err.message || t("transfer.deposit.failed"));
    }
  }, [deposit, onSuccess, t]);

  const onDeposit = useCallback(async () => {
    const num = Number(quantity);

    if (isNaN(num) || num <= 0) {
      toast.error(t("transfer.quantity.invalid"));
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    const execDeposit = enableCustomDeposit ? customDeposit : doDeposit;

    await execDeposit?.()?.finally(() => {
      setSubmitting(false);
    });
  }, [quantity, submitting, doDeposit, enableCustomDeposit, customDeposit, t]);

  const onApprove = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await approve(quantity);
      toast.success(t("transfer.deposit.approve.success"));
    } catch (err: any) {
      console.error("approve error", err);
      toast.error(
        err.message || err?.errorCode || t("transfer.deposit.approve.failed"),
      );
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [approve, submitting, quantity, allowance, t]);

  const onApproveAndDeposit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await onApprove();
      await onDeposit();
    } catch (err) {
      console.error("approve and deposit error", err);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, onApprove, onDeposit]);

  return { submitting, onApprove, onDeposit, onApproveAndDeposit };
}
