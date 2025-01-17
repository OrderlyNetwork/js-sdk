import { useMemo } from "react";
import { account } from "@orderly.network/perp";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useCollateral } from "./useCollateral";
import { zero } from "@orderly.network/utils";
import { usePositionStore } from "./usePositionStream/usePosition.store";
import { useAccount } from "../useAccount";
import { AccountStatusEnum } from "@orderly.network/types";

export type MarginRatioReturn = {
  // Margin Ratio
  marginRatio: number;
  // Current Leverage
  currentLeverage: number | null;
  // account margin ratio, if user has no position, return null
  mmr: number | null;
};

export const useMarginRatio = (): MarginRatioReturn => {
  // const [{ rows, aggregated }] = usePositionStream();

  const positions = usePositionStore((state) => state.positions.all);

  const { rows } = positions;
  const { notional } = positions;
  const { state } = useAccount();

  const { data: markPrices } = useMarkPricesStream();
  //
  // const markPrices = useMarkPrices();
  //

  const { totalCollateral } = useCollateral();
  const marginRatio = useMemo(() => {
    if (!rows || !markPrices || !totalCollateral || rows.length === 0) {
      return 0;
    }

    return account.totalMarginRatio({
      totalCollateral: totalCollateral,
      markPrices: markPrices,
      positions: rows ?? [],
    });
  }, [rows, markPrices, totalCollateral]);

  const currentLeverage = useMemo(() => {
    if (
      state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected
    ) {
      return account.currentLeverage(marginRatio);
    }

    return null;
  }, [marginRatio, state.status]);

  // MMR
  const mmr = useMemo<number | null>(() => {
    if (!rows || rows.length <= 0 || notional == null) return null;
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
