import { Button } from "@orderly.network/react";
import { ReferralIcon } from "../icons/referral";


export const AsAnAffiliate = () => {
  return (
    <div className="orderly-rounded-lg orderly-w-full orderly-p-6 orderly-bg-gradient-to-t orderly-to-[rgba(41,137,226,1)] orderly-from-[rgba(39,43,147,1)]">
      <div className="orderly-flex orderly-justify-between">
        <div className="orderly-justify-between">
          <div className="orderly-text-2xl lg:orderly-text-[26px] xl:orderly-text-[28px] 2xl:orderly-text-[30px]">As an affiliate</div>
          <div className="orderly-mt-6 orderly-text-2xs lg:orderly-text-xs md:orderly-text-xs xl:orderly-text-xs 2xl:orderly-text-base">
            Onboard traders to earn passive income
          </div>
        </div>
        <ReferralIcon />
      </div>

      <div className="orderly-flex orderly-justify-between orderly-mt-2">
        <Button className="orderly-text-base xl:orderly-text-lg 2xl:orderly-text-lg">Become an affliate</Button>

        <div>
          <div className="orderly-text-[22px] md:orderly-text-[24px] lg:orderly-text-[26px] xl:orderly-text-[26px] 2xl:orderly-text-[28px]">40%~80%</div>
          <div className="orderly-text-3xs 2xl:orderly-text-xs orderly-text-right">Commission</div>
        </div>
      </div>
    </div>
  );
};
