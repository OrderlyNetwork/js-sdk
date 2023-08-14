import { Statistic } from "@/statistic";
import { FC } from "react";

export interface MarketPriceProps {
  lastPrice: number;
  percentChange: string;
}

export const MarketPrice: FC<MarketPriceProps> = (props) => {
  return (
    <Statistic
      label={Number.isNaN(props.lastPrice) ? "-" : props.lastPrice}
      value={props.percentChange}
      coloring
    />
  );
};
