import { useMemo } from "react";
import {
  useAccount,
  useCollateral,
  useIndexPricesStream,
} from "@orderly.network/hooks";
import { SubAccount } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { useAccountsData } from "./useAccountsData";

const isNumber = (val: unknown): val is number => {
  return typeof val === "number" && !Number.isNaN(val);
};

// Extract index price calculation logic
export const getIndexPrice = (
  token: string,
  indexPrices?: Record<string, number>,
) => {
  return token === "USDC" ? 1 : (indexPrices?.[`PERP_${token}_USDC`] ?? 0);
};

// Extract asset value calculation logic
export const calculateAssetValue = (
  holding: number,
  token: string,
  indexPrices?: Record<string, number>,
) => {
  const indexPrice = getIndexPrice(token, indexPrices);
  return new Decimal(holding).mul(indexPrice);
};

export const calculateTotalHolding = (
  data: SubAccount[] | SubAccount["holding"],
  indexPrices?: Record<string, number>,
) => {
  let total = new Decimal(0);
  for (const item of data) {
    if (Array.isArray(item.holding)) {
      for (const hol of item.holding) {
        if (isNumber(hol.holding)) {
          // Use extracted function for asset value calculation
          const assetValue = calculateAssetValue(
            hol.holding,
            hol.token,
            indexPrices,
          );
          total = total.plus(assetValue);
        }
      }
    } else if (isNumber(item.holding) && "token" in item) {
      // Use extracted function for asset value calculation
      const assetValue = calculateAssetValue(
        item.holding,
        (item as any).token,
        indexPrices,
      );
      total = total.plus(assetValue);
    }
  }
  return total;
};

/**
 * Hook to calculate total asset value across all accounts
 * @returns {number} Total asset value in USDC
 */
export const useAssetTotalValue = () => {
  const { state, isMainAccount } = useAccount();
  const { holding = [] } = useCollateral();
  const { data: indexPrices } = useIndexPricesStream();
  const allAccounts = useAccountsData();

  const subAccounts = state.subAccounts ?? [];

  // Calculate main account total value
  const mainTotalValue = useMemo<Decimal>(
    () => calculateTotalHolding(holding, indexPrices),
    [holding, indexPrices],
  );

  // Calculate sub accounts total value
  const subTotalValue = useMemo<Decimal>(
    () => calculateTotalHolding(subAccounts, indexPrices),
    [subAccounts, indexPrices],
  );

  // Calculate final total value
  const totalValue = useMemo<number>(() => {
    if (isMainAccount) {
      return mainTotalValue.plus(subTotalValue).toNumber();
    } else {
      const find = allAccounts.find((item) => item.id === state.accountId);
      if (Array.isArray(find?.children)) {
        return calculateTotalHolding(find.children, indexPrices).toNumber();
      }
      return 0;
    }
  }, [
    isMainAccount,
    mainTotalValue,
    subTotalValue,
    allAccounts,
    state.accountId,
    indexPrices,
  ]);

  return totalValue;
};
