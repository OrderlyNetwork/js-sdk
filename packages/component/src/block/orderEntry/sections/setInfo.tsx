import { ArrowRightIcon } from "@/icon/icons/arrowRight";
import { Numeral } from "@/text/numeral";
import { useMarginRatio } from "@orderly.network/hooks";
import { FC } from "react";

export const EstInfo: FC<{
  estLiqPrice: string;
  estLeverage: string;
}> = ({ estLeverage, estLiqPrice }) => {
  const { currentLeverage } = useMarginRatio();
  return (
    <>
      <div className="orderly-flex orderly-justify-between orderly-text-base-contrast-54">
        <span>Est. Liq. price</span>
        <span className="orderly-flex orderly-gap-1">
          <span className="orderly-text-base-contrast">
            <Numeral>{estLiqPrice}</Numeral>
          </span>
          <span>USDC</span>
        </span>
      </div>
      <div className="orderly-flex orderly-justify-between orderly-text-base-contrast-54">
        <span>Account leverage</span>
        <span className="orderly-flex orderly-items-center orderly-gap-1">
          <Numeral className="orderly-text-base-contrast" surfix={"x"}>
            {currentLeverage}
          </Numeral>
          <ArrowRightIcon size={8} />
          <span className="orderly-text-base-contrast">5.00</span>
        </span>
      </div>
    </>
  );
};
