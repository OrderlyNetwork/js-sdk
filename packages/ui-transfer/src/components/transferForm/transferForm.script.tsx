import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConfig, useTransfer } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { NetworkId } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useInputStatus } from "../depositForm/hooks";
import { useSettlePnl } from "../withdrawForm/hooks/useSettlePnl";

export type TransferFormScriptReturn = ReturnType<typeof useTransferFormScript>;
type TransferFormScriptOptions = {
  // fromAccountId?: string;
  toAccountId?: string;
};

export const useTransferFormScript = (options?: TransferFormScriptOptions) => {
  const { state, isSubAccount, isMainAccount, subAccount } = useAccount();
  const networkId = useConfig("networkId") as NetworkId;
  const { t } = useTranslation();

  const {
    transfer,
    submitting,
    maxAmount: maxQuantity,
    dst,
    unsettledPnL,
    availableBalance,
    availableTransfer,
  } = useTransfer();

  const subAccounts = state.subAccounts;

  const [quantity, setQuantity] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>();
  const [token, setToken] = useState("USDC");

  const { inputStatus, hintMessage } = useInputStatus({
    quantity,
    maxQuantity,
  });

  useEffect(() => {
    subAccount.refresh();
  }, []);

  useEffect(() => {
    const id = options?.toAccountId || subAccounts?.[0]?.id;
    if (id) {
      setToAccountId(id);
    }
  }, [subAccounts, options?.toAccountId]);

  const onTransfer = useCallback(() => {
    const num = Number(quantity);

    if (isNaN(num) || num <= 0) {
      toast.error(t("transfer.quantity.invalid"));
      return;
    }

    if (submitting || !toAccountId) return;

    transfer(token, {
      account_id: toAccountId,
      amount: new Decimal(quantity).toNumber(),
    })
      .then(() => {
        toast.success(t("transfer.internalTransfer.success"));
        setQuantity("");
      })
      .catch((err) => {
        toast.error(err.message || t("transfer.internalTransfer.failed"));
      });
  }, [token, quantity, submitting, transfer, t, toAccountId]);

  const amount = useMemo(() => {
    const markPrice = 1;
    return new Decimal(quantity || 0).mul(markPrice).toNumber();
  }, [quantity]);

  const disabled = submitting || !quantity || inputStatus === "error";

  const { hasPositions, onSettlePnl } = useSettlePnl();

  const currentAssetValue = useMemo(() => {
    // TODO: if to is main account
    // if (isMainAccount) {
    //   return ;
    // }

    const currentAccount = subAccounts?.find(
      (subAccount) => subAccount.id === toAccountId,
    );
    const currentAsset = currentAccount?.holding?.find(
      (asset) => asset.token === token,
    );

    return currentAsset?.holding || 0;
  }, [subAccounts, toAccountId, token, isMainAccount]);

  return {
    networkId,
    onTransfer,
    quantity,
    amount,
    onQuantityChange: setQuantity,
    maxQuantity,
    dst,
    disabled,
    submitting,
    availableTransfer,
    subAccounts,
    accountId: state.accountId,
    mainAccountId: state.mainAccountId,
    isSubAccount,
    isMainAccount,
    toAccountId,
    setToAccountId,
    hintMessage,
    inputStatus,
    hasPositions,
    onSettlePnl,
    unsettledPnL,
    currentAssetValue,
  };
};
