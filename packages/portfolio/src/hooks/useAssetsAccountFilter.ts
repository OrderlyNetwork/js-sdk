import React, { useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { AccountType } from "../pages/assets/assets.ui";

// Account filter hook for assets-like data structures
export const useAssetsAccountFilter = <T extends { account_id?: string }>(
  data: T[],
) => {
  const { state, isMainAccount } = useAccount();
  const [selectedAccount, setSelectedAccount] = React.useState<string>(
    AccountType.ALL,
  );

  // Filter data based on selected account
  const filteredData = useMemo(() => {
    return data.filter((item) => {
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
  }, [data, selectedAccount, isMainAccount, state]);

  // Handle filter changes
  const onAccountFilter = React.useCallback(
    (filter: { name: string; value: string }) => {
      const { name, value } = filter;
      if (name === "account") {
        setSelectedAccount(value);
      }
    },
    [],
  );

  return {
    selectedAccount,
    filteredData,
    onAccountFilter,
    setSelectedAccount,
  };
};

// Generic account filter function that can be used standalone
export const filterByAccount = <T extends { account_id?: string }>(
  data: T[],
  selectedAccount: string,
  accountState: {
    isMainAccount: boolean;
    state: {
      mainAccountId?: string;
      accountId?: string;
    };
  },
): T[] => {
  const { isMainAccount, state } = accountState;

  return data.filter((item) => {
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
};
