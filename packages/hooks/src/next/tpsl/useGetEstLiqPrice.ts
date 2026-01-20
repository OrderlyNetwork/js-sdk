import { useMemo } from "react";

const useGetEstLiqPrice = (props: {
  estLiqPrice: number | null;
  estLiqPriceDistance: number | null;
  distance?: number;
}) => {
  const { estLiqPrice, estLiqPriceDistance, distance = 10 } = props;

  return useMemo(() => {
    if (!estLiqPrice || !estLiqPriceDistance) {
      return null;
    }
    return estLiqPriceDistance >= distance ? null : estLiqPrice;
  }, [estLiqPrice, distance]);
};

export { useGetEstLiqPrice };
