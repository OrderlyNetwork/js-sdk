import { ReferralIcon } from "../../icons/referral";
import { Button } from "@orderly.network/react";

export const AsAnAffiliate = () => {
  return (
    <div className="orderly-rounded-lg orderly-p-6 orderly-bg-primary">
      <div className="orderly-flex">
        <div className="orderly-justify-between">
          <div>As an affiliate</div>
          <div className="orderly-mt-6">
            Onboard traders to earn passive income
          </div>
        </div>
        <ReferralIcon />
      </div>

      <div className="orderly-flex orderly-justify-between orderly-mt-2">
        <Button className="orderly-h-[44px]">Become an affiliate</Button>

        <div>
          <div>40%~80%</div>
          <div>Commission</div>
        </div>
      </div>
    </div>
  );
};
