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
    <div
      id="orderly-leverage"
      className="orderly-flex orderly-justify-between orderly-items-center orderly-text-3xs"
    >
      <div className="orderly-text-4xs orderly-text-base-contrast-36 orderly-flex orderly-items-center">
        <button
          className="orderly-flex orderly-items-center orderly-gap-1"
          onClick={() => onShowLeverageInfo?.()}
        >
          <InfoIcon size={14} />
          <span>Max leverage</span>
        </button>
        <Button
          variant={"text"}
          size={"small"}
          onClick={() => onShowLeverageInfo?.()}
          className="orderly-px-1 orderly-min-w-[24px] orderly-text-4xs orderly-text-link"
        >
          {`${maxLeverage}x`}
        </Button>
      </div>
      <div className="orderly-flex orderly-flex-col orderly-items-end orderly-text-4xs orderly-text-base-contrast-36">
        <div>Pred. funding rate</div>
        {predFundingRate === null ? (
          "--"
        ) : (
          <div className="orderly-flex orderly-gap-1">
            <span className="orderly-text-warning">{`${predFundingRate}%`}</span>
            <span>in</span>
            <span>{countdown}</span>
          </div>
        )}
      </div>
    </div>
  );
};
