import { useCallback, useEffect, useState } from "react";
import { useInternalTransfer } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { InputStatus } from "../../../types";
import { checkIsAccountId, getTransferErrorMessage } from "../../../utils";

type InternalWithdrawOptions = {
  token: string;
  decimals: number;
  quantity: string;
  setQuantity: (quantity: string) => void;
  close?: () => void;
  setLoading: (loading: boolean) => void;
};

export function useWithdrawAccountId(options: InternalWithdrawOptions) {
  const { token, quantity, setQuantity, close, setLoading, decimals } = options;
  const { t } = useTranslation();
  const [toAccountId, setToAccountId] = useState<string>("");
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const { transfer, submitting } = useInternalTransfer();

  const onTransfer = useCallback(() => {
    const num = Number(quantity);

    if (Number.isNaN(num) || num <= 0) {
      toast.error(t("transfer.quantity.invalid"));
      return;
    }

    if (submitting || !toAccountId) {
      return;
    }
    setLoading(true);

    transfer({
      token,
      receiver: toAccountId,
      amount: quantity,
      decimals,
    })
      .then(() => {
        toast.success(t("transfer.internalTransfer.success"));
        setQuantity("");
        close?.();
      })
      .catch((err) => {
        console.log("transfer error", err);
        const errorMsg = getTransferErrorMessage(err.code);
        toast.error(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t, quantity, token, submitting, toAccountId, transfer]);

  useEffect(() => {
    if (!toAccountId) {
      setInputStatus("default");
      setHintMessage("");
      return;
    }

    if (checkIsAccountId(toAccountId)) {
      setInputStatus("default");
      setHintMessage("");
    } else {
      setInputStatus("error");
      setHintMessage(t("transfer.withdraw.accountId.invalid"));
    }
  }, [toAccountId]);

  return {
    toAccountId,
    setToAccountId,
    onTransfer,
    internalWithdrawSubmitting: submitting,
    toAccountIdInputStatus: inputStatus,
    toAccountIdHintMessage: hintMessage,
  };
}
