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
import { InputStatus } from "../../types";
import { useSettlePnl } from "../unsettlePnlInfo/useSettlePnl";
import { useSubAccountDataObserver } from "./hooks/useSubAccountDataObserver";

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
  const [fromAccount, setFromAccount] = useState<SubAccount>();
  const [toAccount, setToAccount] = useState<SubAccount>();
  const [mainAccount, setMainAccount] = useState<SubAccount>();
  const [tokens, setTokens] = useState<API.TokenInfo[]>([DEFAULT_TOKEN]);
  const [token, setToken] = useState<API.TokenInfo>(DEFAULT_TOKEN);

  const networkId = useConfig("networkId") as NetworkId;

  const { state, isMainAccount, subAccount } = useAccount();
  const { hasPositions: currentHasPositions, onSettlePnl } = useSettlePnl();

  const {
    transfer,
    submitting,
    maxAmount: currentMaxAmount,
    unsettledPnL: currentUnsettledPnL,
    holding: currentHolding,
  } = useTransfer();

  const subAccounts = state.subAccounts;
  const mainAccountId = state.mainAccountId;
  const accountId = state.accountId;

  const observerSubAccountId =
    isMainAccount && fromAccount?.id && fromAccount?.id !== mainAccountId
      ? fromAccount?.id
      : undefined;

  // when select sub account, open the private websocket
  const { portfolio, positions } =
    useSubAccountDataObserver(observerSubAccountId);

  const formHasPositions = useMemo(
    () => !!positions?.rows?.length,
    [positions],
  );

  const hasPositions = useMemo(() => {
    return observerSubAccountId ? formHasPositions : currentHasPositions;
  }, [observerSubAccountId, formHasPositions, currentHasPositions]);

  const { unsettledPnL, holding, maxQuantity } = useMemo(() => {
    if (observerSubAccountId) {
      return {
        unsettledPnL: portfolio?.unsettledPnL,
        holding: portfolio?.holding,
        maxQuantity:
          portfolio?.freeCollateral.toDecimalPlaces(6).toNumber() || 0,
      };
    }
    return {
      holding: currentHolding,
      unsettledPnL: currentUnsettledPnL,
      maxQuantity: currentMaxAmount,
    };
  }, [
    observerSubAccountId,
    portfolio,
    currentHolding,
    currentUnsettledPnL,
    currentMaxAmount,
  ]);

  const { inputStatus, hintMessage } = useInputStatus({
    quantity,
    maxQuantity,
    unsettledPnL,
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
        console.log("transfer error: ", err);
        if (err.code === 34) {
          toast.error(t("transfer.internalTransfer.failed.transferInProgress"));
        } else if (err.code === 17) {
          toast.error(
            t("transfer.internalTransfer.failed.withdrawalInProgress"),
          );
        } else {
          toast.error(t("transfer.internalTransfer.failed"));
        }
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

  const { fromAccounts, toAccounts } = useMemo(() => {
    if (isMainAccount) {
      const _subAccounts =
        subAccounts?.filter((item) => item.id !== toAccount?.id) || [];
      return {
        fromAccounts: mainAccount ? [mainAccount, ..._subAccounts] : [],
        toAccounts: subAccounts?.filter((item) => item.id !== fromAccount?.id),
      };
    }

    return {
      fromAccounts: [],
      toAccounts: [],
    };
  }, [isMainAccount, subAccounts, mainAccount, fromAccount, toAccount]);

  // init and update main account holding
  useEffect(() => {
    if (!mainAccountId) return;

    const _mainAccount = {
      id: mainAccountId!,
      description: t("account.mainAccount"),
      holding: [],
    };

    setMainAccount(_mainAccount);

    subAccount.refresh().then((res) => {
      setMainAccount({
        ..._mainAccount,
        holding: res[mainAccountId],
      });
    });
  }, [t, mainAccountId]);

  // init from account
  useEffect(() => {
    setFromAccount(
      isMainAccount
        ? mainAccount
        : subAccounts?.find((item) => item.id === accountId),
    );
  }, [isMainAccount, mainAccount, subAccounts, accountId]);

  // init to account
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
    fromAccount,
    toAccount,
    setToAccount,
    fromAccounts,
    toAccounts,
    setFromAccount,
  };
};

type Options = {
  quantity: string;
  maxQuantity: string | number;
  unsettledPnL?: number;
};

export function useInputStatus(options: Options) {
  const { quantity, maxQuantity, unsettledPnL = 0 } = options;
  const { t } = useTranslation();

  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  useEffect(() => {
    if (!quantity) {
      // reset input status when value is empty
      setInputStatus("default");
      setHintMessage("");
      return;
    }

    const qty = new Decimal(quantity);

    if (unsettledPnL < 0) {
      if (qty.gt(maxQuantity)) {
        setInputStatus("error");
        setHintMessage(t("transfer.insufficientBalance"));
      } else {
        setInputStatus("default");
        setHintMessage("");
      }
    } else {
      if (qty.gt(maxQuantity)) {
        setInputStatus("error");
        setHintMessage(t("transfer.insufficientBalance"));
      } else if (
        qty.gt(new Decimal(maxQuantity).minus(unsettledPnL)) &&
        qty.lessThanOrEqualTo(maxQuantity)
      ) {
        setInputStatus("warning");
        setHintMessage(t("settle.settlePnl.warning"));
      } else {
        // reset input status
        setInputStatus("default");
        setHintMessage("");
      }
    }
  }, [quantity, maxQuantity]);

  return { inputStatus, hintMessage };
}
