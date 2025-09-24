import { useMemo } from "react";
import { usePrivateQuery } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

interface UsePendingWithdrawalsParams {
  vaultId: string;
}

/**
 * Hook to get pending withdrawal transactions for a specific vault
 * @param vaultId - The vault ID to get pending withdrawals for
 * @returns Array of pending withdrawal operations and loading state
 */
export const usePendingWithdrawals = ({
  vaultId,
}: UsePendingWithdrawalsParams) => {
  const { data: transactionHistory, isLoading } =
    usePrivateQuery<API.StrategyVaultHistory>(
      `/v1/account_sv_transaction_history?vault_id=${vaultId}&type=withdrawal&size=100`,
      {
        formatter: (response: {
          rows: API.StrategyVaultHistoryRow[];
          meta?: API.RecordsMeta;
        }) => {
          return {
            rows: response?.rows || [],
            meta: response?.meta || {
              total: 0,
              records_per_page: 100,
              current_page: 1,
            },
          };
        },
        revalidateOnFocus: false,
      },
    );

  const pendingWithdrawals = useMemo(() => {
    if (!transactionHistory?.rows) {
      return [];
    }

    return transactionHistory.rows.filter(
      (transaction) =>
        transaction.type === "withdrawal" && transaction.status === "pending",
    );
  }, [transactionHistory]);

  const totalPendingShares = useMemo(() => {
    return pendingWithdrawals.reduce((total, transaction) => {
      const sharesChange = transaction.shares_change || 0;
      return total + sharesChange;
    }, 0);
  }, [pendingWithdrawals]);

  return {
    pendingWithdrawals,
    totalPendingShares,
    isLoading,
  };
};
