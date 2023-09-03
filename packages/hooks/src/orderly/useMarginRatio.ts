import { account } from "@orderly.network/futures";
import { useMemo } from "react";
import { usePositionStream } from "./usePositionStream";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useCollateral } from "./useCollateral";

export const useMarginRatio = () => {
  const [{ rows }] = usePositionStream();
  const { data: markPrices } = useMarkPricesStream();
  const { totalCollateral } = useCollateral();
  const marginRatio = useMemo(() => {
    const ratio = account.totalMarginRatio({
      totalCollateral: totalCollateral,
      markPrices: markPrices,
      positions: rows ?? [],
    });
    return ratio;
  }, [rows, markPrices, totalCollateral]);

  return marginRatio;
};
