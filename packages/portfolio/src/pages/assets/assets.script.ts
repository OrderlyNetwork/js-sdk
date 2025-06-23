import React, { useCallback, useMemo } from "react";
import {
  SubAccount,
  useAccount,
  useCollateral,
  useLocalStorage,
} from "@orderly.network/hooks";
import { modal } from "@orderly.network/ui";
import {
  DepositAndWithdrawWithDialogId,
  TransferDialogId,
} from "@orderly.network/ui-transfer";
import { Decimal } from "@orderly.network/utils";
import { useAccountsData } from "../../hooks/useAccountsData";
import { useAssetsAccountFilter } from "../../hooks/useAssetsAccountFilter";
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

export const useAssetsScript = () => {
  const [visible, setVisible] = useLocalStorage<boolean>(
    ORDERLY_ASSETS_VISIBLE_KEY,
    true,
  );

  const { state, isMainAccount } = useAccount();

  const { holding = [] } = useCollateral();

  const subAccounts = state.subAccounts ?? [];

  const toggleVisible = () => {
    // @ts-ignore
    setVisible((visible: boolean) => !visible);
  };

  // Use the extracted accounts data hook
  const allAccounts = useAccountsData();

  // Use the extracted account filter hook
  const {
    selectedAccount,
    filteredData: filtered,
    onAccountFilter: onFilter,
  } = useAssetsAccountFilter(allAccounts);

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

  const handleTransfer = (accountId: string) => {
    if (!accountId) {
      return;
    }
    modal.show(TransferDialogId, {
      toAccountId: accountId,
    });
  };

  const assetsColumns = useAssetsColumns({ onClick: handleTransfer });

  const openDepositAndWithdraw = useCallback(
    (viewName: "deposit" | "withdraw") => {
      modal.show(DepositAndWithdrawWithDialogId, {
        activeTab: viewName,
      });
    },
    [],
  );

  const onDeposit = useCallback(() => {
    openDepositAndWithdraw("deposit");
  }, []);

  const onWithdraw = useCallback(() => {
    openDepositAndWithdraw("withdraw");
  }, []);

  return {
    columns: assetsColumns,
    dataSource: filtered,
    visible: visible as boolean,
    onToggleVisibility: toggleVisible,
    selectedAccount,
    onFilter,
    totalValue: memoizedTotalValue,
    hasSubAccount: subAccounts.length > 0,
    onDeposit,
    onWithdraw,
  };
};

export type useAssetsScriptReturn = ReturnType<typeof useAssetsScript> &
  ReturnType<typeof useAccount>;
