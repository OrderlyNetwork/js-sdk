/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { produce } from "immer";
import {
  SubAccount,
  useAccount,
  useCollateral,
  useLocalStorage,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import type { API } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { TransferDialogId } from "@orderly.network/ui-transfer";
import { Decimal } from "@orderly.network/utils";
import { AccountType } from "./assets.ui";
import { useAssetsColumns } from "./column";

const isNumber = (val: unknown): val is number => {
  return typeof val === "number" && !Number.isNaN(val);
};

const calculateTotalHolding = (data: SubAccount[] | SubAccount["holding"]) => {
  let total = new Decimal(0);
  for (const item of data) {
    if (Array.isArray(item.holding)) {
      for (const hol of item.holding) {
        if (isNumber(hol.holding)) {
          total = total.plus(hol.holding);
        }
      }
    } else if (isNumber(item.holding)) {
      total = total.plus(item.holding);
    }
  }
  return total;
};

const ORDERLY_ASSETS_VISIBLE_KEY = "orderly_assets_visible";

const EMPTY_HOLDING: Partial<API.Holding> = {
  token: "USDC",
  holding: 0,
  frozen: 0,
};

export const useAssetsScript = () => {
  const [visible, setVisible] = useLocalStorage<boolean>(
    ORDERLY_ASSETS_VISIBLE_KEY,
    true,
  );

  const { t } = useTranslation();

  const { state, isMainAccount } = useAccount();

  const { holding = [] } = useCollateral();

  const subAccounts = state.subAccounts ?? [];

  const toggleVisible = () => {
    // @ts-ignore
    setVisible((visible: boolean) => !visible);
  };

  const [selectedAccount, setAccount] = React.useState<string>(() =>
    Array.isArray(subAccounts) && subAccounts.length
      ? AccountType.ALL
      : AccountType.MAIN,
  );

  const allAccounts = useMemo(() => {
    return produce<any[]>(subAccounts, (draft) => {
      for (const sub of draft) {
        sub.account_id = sub.id;
        if (Array.isArray(sub.holding) && sub.holding.length) {
          sub.children = sub.holding.map((item: API.Holding) => ({
            ...item,
            account_id: sub.id,
          }));
        } else {
          sub.children = [{ ...EMPTY_HOLDING, account_id: sub.id }];
        }
        Reflect.deleteProperty(sub, "holding");
      }
      if (isMainAccount) {
        draft.unshift({
          account_id: state.mainAccountId,
          description: t("common.mainAccount"),
          children:
            Array.isArray(holding) && holding.length
              ? holding.map((item: API.Holding) => ({
                  ...item,
                  account_id: state.mainAccountId,
                }))
              : [
                  {
                    ...EMPTY_HOLDING,
                    account_id: state.mainAccountId,
                  },
                ],
        });
      }
    });
  }, [holding, subAccounts, isMainAccount, state.mainAccountId]);

  const filtered = React.useMemo(() => {
    return allAccounts.filter((item) => {
      if (isMainAccount) {
        if (!selectedAccount || selectedAccount === AccountType.ALL) {
          return true;
        }
        if (selectedAccount === AccountType.MAIN) {
          return item.account_id === state.mainAccountId;
        } else {
          return item.account_id === selectedAccount;
        }
      } else {
        return item.account_id === state.accountId;
      }
    });
  }, [allAccounts, selectedAccount, isMainAccount, state]);

  const mainTotalValue = useMemo<Decimal>(
    () => calculateTotalHolding(holding),
    [holding],
  );

  const subTotalValue = useMemo<Decimal>(
    () => calculateTotalHolding(subAccounts),
    [subAccounts],
  );

  const memoizedTotalValue = useMemo<number>(() => {
    if (isMainAccount) {
      return mainTotalValue.plus(subTotalValue).toNumber();
    } else {
      const find = allAccounts.find((item) => item.id === state.accountId);
      if (Array.isArray(find?.children)) {
        return calculateTotalHolding(find.children).toNumber();
      }
      return 0;
    }
  }, [
    isMainAccount,
    mainTotalValue,
    subTotalValue,
    allAccounts,
    state.accountId,
  ]);

  const onAccountFilter = React.useCallback(
    (filter: { name: string; value: string }) => {
      const { name, value } = filter;
      if (name === "account") {
        setAccount(value);
      }
    },
    [],
  );

  const handleTransfer = (accountId: string) => {
    if (!accountId) {
      return;
    }
    modal.show(TransferDialogId, {
      toAccountId: accountId,
    });
  };

  const assetsColumns = useAssetsColumns({ onClick: handleTransfer });

  return {
    columns: assetsColumns,
    dataSource: filtered,
    visible: visible as boolean,
    onToggleVisibility: toggleVisible,
    selectedAccount,
    onFilter: onAccountFilter,
    totalValue: memoizedTotalValue,
  };
};

export type useAssetsScriptReturn = ReturnType<typeof useAssetsScript>;
