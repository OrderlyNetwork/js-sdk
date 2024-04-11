import { ArrowRightIcon } from "@/icon/icons";
import { Numeral } from "@/text/numeral";
import { useAccount, useMarginRatio } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { FC, useMemo } from "react";

export const EstInfo: FC<{
  estLiqPrice?: number | null;
  estLeverage?: number | null;
  precision?: number;
}> = ({ estLeverage, estLiqPrice, precision }) => {
  const { currentLeverage } = useMarginRatio();
  const { state } = useAccount();

  const leverageElement = useMemo(() => {
    if (state.status < AccountStatusEnum.EnableTrading) {
      return "0.00x";
    }

    if (typeof estLeverage === "undefined" || estLeverage === null) {
      return (
        <Numeral className="orderly-text-base-contrast" surfix={"x"}>
          {currentLeverage}
        </Numeral>
      );
    }

    return (
      <>
        <Numeral className="orderly-text-base-contrast" surfix={"x"}>
          {currentLeverage}
        </Numeral>
        <ArrowRightIcon size={8} />
        <Numeral className="orderly-text-base-contrast" surfix={"x"}>
          {Math.abs(estLeverage)}
        </Numeral>
      </>
    );
  }, [currentLeverage, estLeverage, state.status]);

  return (
    <>
      <div className="orderly-flex orderly-justify-between orderly-text-base-contrast-54">
        <span>Est. Liq. price</span>
        <span className="orderly-flex orderly-gap-1">
          <span className="orderly-text-base-contrast">
            <Numeral precision={precision}>{estLiqPrice ?? "--"}</Numeral>
          </span>
          <span>USDC</span>
        </span>
      </div>
      <div className="orderly-flex orderly-justify-between orderly-text-base-contrast-54">
        <span>Account leverage</span>
        <span className="orderly-flex orderly-items-center orderly-gap-1">
          {leverageElement}
        </span>
      </div>
    </>
  );
};
