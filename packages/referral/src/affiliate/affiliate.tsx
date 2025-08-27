import { useMediaQuery } from "@orderly.network/hooks";
import { BarChart } from "./sections/barChart";
import { CommissionAndReferees } from "./sections/commissionAndReferees";
import { ReferralCode } from "./sections/referralCode";
import { ReferralLink } from "./sections/referralLink";
import { Summary } from "./sections/summary";

export const Affiliate = () => {
  const isXL = useMediaQuery("(max-width: 1023px)");

  return (
    <div className="orderly-h-full orderly-text-base-contrast">
      {isXL ? <_SmallLayout /> : <_BigLayout />}
    </div>
  );
};

const _SmallLayout = () => {
  return (
    <div className="orderly-px-4 orderly-py-6 lg:orderly-px-[60px]">
      <Summary />
      <ReferralLink className="orderly-mt-6" />
      <ReferralCode className="orderly-mt-6" />
      <BarChart className="orderly-mt-6" />
      <CommissionAndReferees className="orderly-mt-6 orderly-sticky orderly-top-6" />
    </div>
  );
};

const _BigLayout = () => {
  return (
    <div className="orderly-py-4 orderly-px-[60px] orderly-flex orderly-flex-col orderly-items-center orderly-justify-center">
      <div className="orderly-flex orderly-gap-6 orderly-h-[616px] 2xl:orderly-h-[636px] xl:orderly-w-[904px] 2xl:orderly-w-[1324px]">
        <div className="orderly-w-2/5 orderly-flex orderly-flex-col orderly-gap-6">
          <Summary className="orderly-flex-1" />
          <BarChart className="orderly-flex-1" />
        </div>
        <div className="orderly-flex-1 orderly-flex orderly-flex-col orderly-gap-6">
          <ReferralLink />
          <ReferralCode className="orderly-flex-1" />
        </div>
      </div>

      <CommissionAndReferees className="orderly-mt-6 xl:orderly-w-[904px] 2xl:orderly-w-[1324px]" />
    </div>
  );
};
