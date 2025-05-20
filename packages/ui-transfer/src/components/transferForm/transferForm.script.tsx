import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SubAccount,
  useAccount,
  useConfig,
  useTransfer,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API, NetworkId } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useInputStatus } from "../depositForm/hooks";
import { useSettlePnl } from "../withdrawForm/hooks/useSettlePnl";

export type TransferFormScriptReturn = ReturnType<typeof useTransferFormScript>;

export type TransferFormScriptOptions = {
  /** target sub account id */
  toAccountId?: string;
  close?: () => void;
};

const DEFAULT_TOKEN = {
  symbol: "USDC",
} as API.TokenInfo;

export const useTransferFormScript = (options: TransferFormScriptOptions) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<string>("");
  const [toAccount, setToAccount] = useState<SubAccount>();
  const [mainAccount, setMainAccount] = useState<SubAccount>();
  const [tokens, setTokens] = useState<API.TokenInfo[]>([DEFAULT_TOKEN]);
  const [token, setToken] = useState<API.TokenInfo>(DEFAULT_TOKEN);

  const networkId = useConfig("networkId") as NetworkId;

  const { state, isMainAccount, subAccount } = useAccount();
  const { hasPositions, onSettlePnl } = useSettlePnl();

  const {
    transfer,
    submitting,
    maxAmount: maxQuantity,
    unsettledPnL,
    holding,
  } = useTransfer();

  const subAccounts = state.subAccounts;
  const mainAccountId = state.mainAccountId;
  const accountId = state.accountId;

  const { inputStatus, hintMessage } = useInputStatus({
    quantity,
    maxQuantity,
  });

  const onTransfer = useCallback(() => {
    const num = Number(quantity);

    if (isNaN(num) || num <= 0) {
      toast.error(t("transfer.quantity.invalid"));
      return;
    }

    if (submitting || !toAccount) return;

    transfer(token.symbol!, {
      account_id: toAccount.id,
      amount: new Decimal(quantity).toNumber(),
    })
      .then(() => {
        toast.success(t("transfer.internalTransfer.success"));
        setQuantity("");
        options.close?.();
      })
      .catch((err) => {
        toast.error(err.message || t("transfer.internalTransfer.failed"));
      });
  }, [t, token, quantity, submitting, transfer, toAccount]);

  const disabled = submitting || !quantity || inputStatus === "error";

  const amount = useMemo(() => {
    const markPrice = 1;
    return new Decimal(quantity || 0).mul(markPrice).toNumber();
  }, [quantity]);

  const toAccountAsset = useMemo(() => {
    const asset = toAccount?.holding?.find(
      (item) => item.token === token.symbol,
    );

    return asset?.holding || 0;
  }, [toAccount, token]);

  const { fromAccounts, fromValue, toAccounts, toValue } = useMemo(() => {
    if (isMainAccount) {
      return {
        fromAccounts: [],
        fromValue: mainAccount,
        toAccounts: subAccounts,
        toValue: toAccount,
      };
    }

    const currentSubAccount = subAccounts?.find(
      (item) => item.id === accountId,
    );

    return {
      fromAccounts: [],
      fromValue: currentSubAccount,
      toAccounts: [],
      toValue: mainAccount,
    };
  }, [isMainAccount, subAccounts, toAccount, accountId, mainAccount]);

  // init and update main account holding
  useEffect(() => {
    if (!mainAccountId) return;

    const _mainAccount = {
      id: mainAccountId!,
      description: "Main Account",
      holding: [],
    };

    setMainAccount(_mainAccount);

    subAccount.refresh().then((res) => {
      setMainAccount({
        ..._mainAccount,
        holding: res[mainAccountId],
      });
    });
  }, [mainAccountId]);

  // init sub account selected
  useEffect(() => {
    if (isMainAccount) {
      const selectAccount = options.toAccountId
        ? subAccounts?.find((item) => item.id === options.toAccountId)
        : subAccounts?.[0];

      if (selectAccount) {
        setToAccount(selectAccount);
      }
    } else {
      setToAccount(mainAccount);
    }
  }, [options?.toAccountId, isMainAccount, subAccounts, mainAccount]);

  // update tokens by current holding
  useEffect(() => {
    const tokens = holding?.map((item) => ({
      symbol: item.token,
    })) as API.TokenInfo[];
    if (tokens?.length) {
      setTokens(tokens);
      setToken(tokens?.[0] || DEFAULT_TOKEN);
    }
  }, [holding]);

  return {
    networkId,
    onTransfer,
    quantity,
    amount,
    onQuantityChange: setQuantity,
    maxQuantity,
    tokens,
    token,
    onTokenChange: setToken,
    disabled,
    submitting,
    hintMessage,
    inputStatus,
    hasPositions,
    onSettlePnl,
    unsettledPnL,
    toAccountAsset,
    toAccount,
    setToAccount,
    fromAccounts,
    fromValue,
    toAccounts,
    toValue,
  };
};
