import Button from "@/button";
import { Info } from "lucide-react";
import { FC } from "react";

export interface LeverageViewProps {
  maxLeverage: number;
  predFundingRate: number;
  countdown: string;
  onShowLeverageInfo?: () => void;
}

export const LeverageView: FC<LeverageViewProps> = ({
  maxLeverage,
  predFundingRate,
  countdown,
  onShowLeverageInfo,
}) => {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="text-base-contrast/30 flex items-center">
        <button
          className="flex items-center gap-1"
          onClick={() => onShowLeverageInfo?.()}
        >
          <Info size={14} />
          <span>Max leverage</span>
        </button>
        <Button
          variant={"text"}
          size={"small"}
          className="px-1 min-w-[24px] text-primary-light"
        >
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
