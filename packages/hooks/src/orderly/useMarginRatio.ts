import { useMemo } from "react";
import { account, positions } from "@orderly.network/perp";
import { usePositionStream } from "./usePositionStream/usePositionStream";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useCollateral } from "./useCollateral";
import { zero } from "@orderly.network/utils";
import { usePositionStore } from "./usePositionStream/usePositionStore";
import { useMarkPrices } from "./useMarkPrice/useMarkPriceStore";

export type MarginRatioReturn = {
  // Margin Ratio
  marginRatio: number;
  // Current Leverage
  currentLeverage: number;
  // account margin ratio, if user has no position, return null
  mmr: number | null;
};

export const useMarginRatio = (): MarginRatioReturn => {
  // const [{ rows, aggregated }] = usePositionStream();

  const positions = usePositionStore((state) => state.positions);

  const { rows } = positions;
  const { notional } = positions;

  const markPrices = useMarkPricesStream();
  //
  // const markPrices = useMarkPrices();
  //
  console.log("row", rows, notional);

  const { totalCollateral } = useCollateral();
  const marginRatio = useMemo(() => {
    if (!rows || !markPrices || !totalCollateral || rows.length === 0) {
      return 0;
    }

    const ratio = account.totalMarginRatio({
      totalCollateral: totalCollateral,
      markPrices: markPrices,
      positions: rows ?? [],
    });
    return ratio;
  }, [rows, markPrices, totalCollateral]);

  const currentLeverage = useMemo(() => {
    return account.currentLeverage(marginRatio);
  }, [marginRatio]);

  // MMR
  const mmr = useMemo<number | null>(() => {
    if (!rows || rows.length <= 0) return null;
    let positionsMM = zero;
    // const positionsNotional = positions.totalNotional(rows);

    for (let index = 0; index < rows.length; index++) {
      const item = rows[index];
      positionsMM = positionsMM.add(item.mm);
    }

    return account.MMR({
      positionsMMR: positionsMM.toNumber(),
      positionsNotional: notional,
    });
  }, [rows, notional]);

  return { marginRatio, currentLeverage, mmr };
};
