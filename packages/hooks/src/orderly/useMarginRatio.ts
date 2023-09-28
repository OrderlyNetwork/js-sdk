import { useMemo } from "react";
import { account } from "@orderly.network/futures";
import { usePositionStream } from "./usePositionStream";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useCollateral } from "./useCollateral";

export const useMarginRatio = () => {
  const [{ rows }] = usePositionStream();
  const { data: markPrices } = useMarkPricesStream();

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

  return { marginRatio, currentLeverage };
};
