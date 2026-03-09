import { useMemo } from "react";
import { useSWR } from "@orderly.network/hooks";

export type OnrampTransactionStatus =
  | "new"
  | "pending"
  | "completed"
  | "failed"
  | "paid"
  | "canceled";

export type WebhookEvent = {
  transactionId: string;
  status: OnrampTransactionStatus;
  outAmount?: number;
  inAmount?: number;
  statusReason?: string;
  targetCurrency: string;
  sourceCurrency: string;
  onramp: string;
  statusDate: string;
};

const PENDING_STATUSES = new Set<OnrampTransactionStatus>(["pending", "new"]);

// TODO: Replace with the actual deployed worker URL
const WORKER_URL = "https://gentle-butterfly-db9c.han-eff.workers.dev/";

export function useOnrampTransactionStatus(walletAddress: string | null) {
  const { data, error } = useSWR<WebhookEvent[] | null>(
    walletAddress ? `${WORKER_URL}?walletAddress=${walletAddress}` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return []; // Transaction not found yet
        throw new Error("Failed to fetch transaction status");
      }
      return res.json();
    },
    {
      refreshInterval: (latestData: WebhookEvent[] | null | undefined) => {
        if (!walletAddress) return 0;
        if (
          latestData &&
          latestData.some((tx) => PENDING_STATUSES.has(tx.status))
        ) {
          return 10000;
        }
        return 30000;
      },
      revalidateOnFocus: true,
    },
  );

  const transactions = useMemo(() => data || [], [data]);

  const pendingTransactions = useMemo(
    () => transactions.filter((tx) => PENDING_STATUSES.has(tx.status)),
    [transactions],
  );

  const historyTransactions = useMemo(
    () => transactions.filter((tx) => !PENDING_STATUSES.has(tx.status)),
    [transactions],
  );

  return {
    transactions,
    pendingTransactions,
    historyTransactions,
    error,
    isLoading: !data && !error && !!walletAddress,
  };
}
