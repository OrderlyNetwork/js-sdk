import { useCallback, useEffect, useState } from "react";
import { useInternalTransfer } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { toast } from "@kodiak-finance/orderly-ui";
import { InputStatus, WithdrawTo } from "../../../types";
import { checkIsAccountId, getTransferErrorMessage } from "../../../utils";

type InternalWithdrawOptions = {
  token: string;
  decimals: number;
  quantity: string;
  setQuantity: (quantity: string) => void;
  close?: () => void;
  setLoading: (loading: boolean) => void;
};

export function useInternalWithdraw(options: InternalWithdrawOptions) {
  const { token, quantity, setQuantity, close, setLoading, decimals } = options;
  const { t } = useTranslation();
  const [withdrawTo, setWithdrawTo] = useState<WithdrawTo>(WithdrawTo.Wallet);
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
    withdrawTo,
    setWithdrawTo,
    toAccountId,
    setToAccountId,
    onTransfer,
    internalWithdrawSubmitting: submitting,
    toAccountIdInputStatus: inputStatus,
    toAccountIdHintMessage: hintMessage,
  };
}
