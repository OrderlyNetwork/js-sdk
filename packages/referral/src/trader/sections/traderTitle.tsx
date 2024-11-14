import { cn } from "@orderly.network/react";
import { FC, useContext, useMemo } from "react";
import { GradientText } from "../../components/gradientText";
import { ReferralContext } from "../../hooks/referralContext";
import { Decimal } from "@orderly.network/utils";

export const TraderTitle: FC<{
  className?: string;
}> = (props) => {
  const { referralInfo } = useContext(ReferralContext);

  const code = referralInfo?.referee_info.referer_code;
  const rebate = referralInfo?.referee_info.referee_rebate_rate;
  if (!code) {
    return <div></div>;
  }

  const rebateText = useMemo(() => {
    if (rebate !== undefined) {
      return (
        new Decimal(rebate)
          .mul(100)
          .toDecimalPlaces(2, Decimal.ROUND_DOWN)
          .toString() + "%"
      );
    }
    return "-";
  }, [rebate]);

  return (
    <div
      className={cn("orderly-flex orderly-justify-between", props.className)}
    >
      <div className="orderly-flex orderly-items-center">
        <div className="orderly-text-xs md:orderly-text-base 2xl:orderly-text-lg">
          Your referrer
        </div>
        <div className="orderly-ml-3 orderly-flex orderly-items-center orderly-justify-center orderly-px-[10px] orderly-py-2 orderly-text-primary-darken orderly-text-[13px] md:orderly-text-[14px] 2xl:orderly-text-[16px] orderly-bg-base-600 orderly-rounded">
          {code || "-"}
        </div>
      </div>
      <div className="orderly-flex orderly-items-center">
        <div className="orderly-text-xs md:orderly-text-base 2xl:orderly-text-lg orderly-text-base-contrast-54">
          Rebate:
        </div>
        <div className="orderly-text-lg md:orderly-text-xl lg:orderly-text-[24px] 2xl:orderly-text-[26px] orderly-text-primary-darken orderly-ml-3">
          <GradientText texts={[{ text: rebateText, gradient: true }]} />
        </div>
      </div>
    </div>
  );
};
