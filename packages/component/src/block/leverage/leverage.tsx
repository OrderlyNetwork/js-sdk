import Button from "@/button";
import { InfoIcon } from "@/icon";
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
    <div className="flex justify-between items-center text-3xs">
      <div className="text-4xs text-base-contrast-36 flex items-center">
        <button
          className="flex items-center gap-1"
          onClick={() => onShowLeverageInfo?.()}
        >
          <InfoIcon size={14} />
          <span>Max leverage</span>
        </button>
        <Button
          variant={"text"}
          size={"small"}
          className="px-1 min-w-[24px] text-4xs text-primary-light"
        >
          {`${maxLeverage}x`}
        </Button>
      </div>
      <div className="flex flex-col items-end text-4xs text-base-contrast-36">
        <div>Pred. funding rate</div>
        <div className="flex gap-1">
          <span className="text-warning">{`${predFundingRate}%`}</span>
          <span>in</span>
          <span>{countdown}</span>
        </div>
      </div>
    </div>
  );
};
