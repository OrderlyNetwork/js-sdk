import { useCallback, useState } from "react";
import { useEventEmitter } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { getDepositKnownErrorMessage } from "../../../utils";

type Options = {
  quantity: string;
  approve: (quantity?: string) => Promise<any>;
  deposit: () => Promise<any>;
  onSuccess?: () => void;
  swapDeposit?: () => Promise<any>;
  needSwap?: boolean;
};

export function useDepositAction(options: Options) {
  const { quantity, approve, deposit, swapDeposit, onSuccess, needSwap } =
    options;
  const [isMutating, setIsMutating] = useState(false);
  const [depositError, setDepositError] = useState("");

  const ee = useEventEmitter();
  const { t } = useTranslation();

  const doDeposit = useCallback(async () => {
    try {
      await deposit();
      setDepositError("");
    } catch (err: any) {
      console.error("orderly deposit error", err);
      const knownErrorMessage = getDepositKnownErrorMessage(err.message);
      if (knownErrorMessage) {
        setDepositError(knownErrorMessage);
        toast.error(
          <div>
            {t("common.somethingWentWrong")}
            <br />
            <div className="orderly-text-white/[0.54] orderly-text-xs">
              {t("common.details")}: {knownErrorMessage}
            </div>
          </div>,
        );
      } else {
        toast.error(err.message || t("common.somethingWentWrong"));
      }
      throw err;
    }
  }, [deposit, onSuccess, t, ee]);

  const onDeposit = useCallback(async () => {
    const num = Number(quantity);

    if (isNaN(num) || num <= 0) {
      toast.error(t("transfer.quantity.invalid"));
      return;
    }

    if (isMutating) return;

    setIsMutating(true);

    try {
      if (needSwap) {
        await swapDeposit?.();
      } else {
        await doDeposit();
      }
      toast.success(t("transfer.deposit.requested"));
      ee.emit("deposit:requested");
      onSuccess?.();
    } catch (err: any) {
      // all errors are handled by toast.error in doDeposit or swapDeposit
    } finally {
      setIsMutating(false);
    }
  }, [quantity, isMutating, needSwap, doDeposit, swapDeposit, t]);

  const onApprove = useCallback(async () => {
    if (isMutating) return;
    setIsMutating(true);

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
      setIsMutating(false);
    }
  }, [approve, isMutating, quantity, t]);

  const onApproveAndDeposit = useCallback(async () => {
    if (isMutating) return;
    setIsMutating(true);

    try {
      await onApprove();
      await onDeposit();
    } catch (err) {
      console.error("approve and deposit error", err);
    } finally {
      setIsMutating(false);
    }
  }, [isMutating, onApprove, onDeposit]);

  return {
    isMutating,
    depositError,
    setDepositError,
    onApprove,
    onDeposit,
    onApproveAndDeposit,
  };
}
