import { Statistic } from "@/statistic";
import { FC } from "react";

export interface FundingRateProps {
  fundingRate: string;
  timout: number;
}

export const FundingRate: FC<FundingRateProps> = (props) => {
  return (
    <Statistic
      label="Pred. Funding Rate"
      value={
        <div className="flex items-center">
          <span className="text-green-500">+0.01%</span>
          <span className="text-gray-400 ml-1">in 12:34:56</span>
        </div>
      }
    />
  );
};
