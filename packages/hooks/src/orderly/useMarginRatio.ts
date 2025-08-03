import { useMemo } from "react";
import { account } from "@orderly.network/perp";
import { AccountStatusEnum, EMPTY_LIST } from "@orderly.network/types";
import { zero } from "@orderly.network/utils";
import { useAccount } from "../useAccount";
import { useCollateral } from "./useCollateral";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { usePositionStore } from "./usePositionStream/usePosition.store";

/**
 * The return type of useMarginRatio hook
 */
export type MarginRatioReturn = {
  /**
   * Current leverage of the account, null if trading is not enabled
   */
  currentLeverage: number | null;
  /**
   * Current margin ratio of the account
   */
  marginRatio: number;
  /**
   * Maintenance margin ratio (MMR) of the account, null if user has no positions
   */
  mmr: number | null;
};

/**
 * Hook to calculate and monitor account's margin ratio, leverage, and maintenance margin ratio (MMR)
 * @example
 * ```typescript
 * const { marginRatio, currentLeverage, mmr } = useMarginRatio();
 * ```
 */
export const useMarginRatio = (): MarginRatioReturn => {
  // const [{ rows, aggregated }] = usePositionStream();

  const positions = usePositionStore((state) => state.positions.all);

  const { rows, notional } = positions;

  const { state } = useAccount();

  const { data: markPrices } = useMarkPricesStream();
  //
  // const markPrices = useMarkPrices();
  //

  const { totalCollateral } = useCollateral();

  /**
   * Calculate the total margin ratio based on collateral, mark prices and positions
   */
  const marginRatio = useMemo(() => {
    if (!rows || !markPrices || !totalCollateral || rows.length === 0) {
      return 0;
    }

    return account.totalMarginRatio({
      totalCollateral: totalCollateral,
      markPrices: markPrices,
      positions: rows ?? EMPTY_LIST,
    });
  }, [rows, markPrices, totalCollateral]);

  /**
   * Calculate current leverage based on margin ratio
   * Returns null if trading is not enabled
   */
  const currentLeverage = useMemo(() => {
    if (
      state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected
    ) {
      return account.currentLeverage(marginRatio);
    }

    return null;
  }, [marginRatio, state.status]);

  /**
   * Calculate maintenance margin ratio (MMR) based on positions
   * Returns null if user has no positions
   */
  const mmr = useMemo<number | null>(() => {
    if (!rows || rows.length <= 0 || notional == null) {
      return null;
    }
    let positionsMM = zero;
    // const positionsNotional = positions.totalNotional(rows);

    for (let index = 0; index < rows.length; index++) {
      const item = rows[index];
      if (item.mm !== null) {
        // console.log("calc add mm", item.mm, positionsMM, notional);

        positionsMM = positionsMM.add(item.mm);
      }
    }

    return account.MMR({
      positionsMMR: positionsMM.toNumber(),
      positionsNotional: notional,
    });
  }, [rows, notional]);

  return { marginRatio, currentLeverage, mmr };
};
