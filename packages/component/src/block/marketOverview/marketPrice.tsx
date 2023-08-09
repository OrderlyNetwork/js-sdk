import { Statistic } from "@/statistic";
import { FC } from "react";

export interface MarketPriceProps {
  lastPrice: string;
  percentChange: string;
}

export const MarketPrice: FC<MarketPriceProps> = (props) => {
  return <Statistic label="31,205.80" value="12.34%" coloring />;
};
