/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { produce } from "immer";
import {
  SubAccount,
  useAccount,
  useCollateral,
  useLocalStorage,
} from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { TransferDialogId } from "@orderly.network/ui-transfer";
import { Decimal } from "@orderly.network/utils";
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

  const { state } = useAccount();
  const { holding = [], accountInfo } = useCollateral();

  const subAccounts = state.subAccounts ?? [];

  const toggleVisible = () => {
    // @ts-ignore
    setVisible((visible: boolean) => !visible);
  };

  const [selectedAccount, setSelectedAccount] = React.useState("All accounts");

  const memoizedTotalValue = React.useMemo<number>(() => {
    const mainTotalValue = calculateTotalHolding(holding);
    const subTotalValue = calculateTotalHolding(subAccounts);
    return new Decimal(mainTotalValue).plus(subTotalValue).toNumber();
  }, [holding, subAccounts]);

  const allAccounts = React.useMemo(() => {
    return produce<any[]>(subAccounts, (draft) => {
      for (const sub of draft) {
        sub.symbol = sub.id;
        if (Array.isArray(sub.holding) && sub.holding.length) {
          sub.children = sub.holding;
        } else {
          sub.children = [EMPTY_HOLDING];
        }
        Reflect.deleteProperty(sub, "holding");
      }
      draft.unshift({
        id: accountInfo?.account_id,
        description: "Main account",
        symbol: accountInfo?.account_id,
        children:
          Array.isArray(holding) && holding.length ? holding : [EMPTY_HOLDING],
      });
    });
  }, [holding, subAccounts, accountInfo]);

  const onAccountFilter = React.useCallback(
    (filter: { name: string; value: string }) => {
      const { name, value } = filter;
      if (name === "account") {
        setSelectedAccount(value);
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

  return React.useMemo(() => {
    return {
      columns: assetsColumns,
      dataSource: allAccounts,
      totalValue: memoizedTotalValue,
      visible: visible as boolean,
      onToggleVisibility: toggleVisible,
      selectedAccount,
      onFilter: onAccountFilter,
    };
  }, [assetsColumns, visible, toggleVisible]);
};

export type useAssetsScriptReturn = ReturnType<typeof useAssetsScript>;
