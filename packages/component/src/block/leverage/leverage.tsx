import Button from "@/button";
import { FC } from "react";

export interface LeverageViewProps {
  maxLeverage: number;
  predFundingRate: number;
  countdown: string;
}

export const LeverageView: FC<LeverageViewProps> = ({
  maxLeverage,
  predFundingRate,
  countdown,
}) => {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="text-base-contrast/30">
        <span>Max leverage</span>
        <Button variant={"text"} size={"small"} className="px-1 min-w-[24px]">
          {`${maxLeverage}x`}
        </Button>
      </div>
      <div className="flex flex-col items-end text-base-contrast/30">
        <div>Pred. Funding Rate</div>
        <div className="flex gap-1">
          <span className="text-warning">{`${predFundingRate}%`}</span>
          <span>in</span>
          <span>{countdown}</span>
        </div>
      </div>
    </div>
  );
};
