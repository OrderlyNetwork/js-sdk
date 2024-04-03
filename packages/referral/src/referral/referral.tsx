import { useContext } from "react";
import { ArrowRightIcon } from "./icons/arrowRight";
import { Card } from "./sections/card";
import { Introduce } from "./sections/introduce";
import { ReferralContext } from "../hooks/referralContext";
import { GradientText } from "../components/gradientText";
import { OrderlyAppContext } from "@orderly.network/react";

export const Referral = () => {

  const { brokerName } = useContext(OrderlyAppContext);


  const { learnAffiliate, learnAffiliateUrl } = useContext(ReferralContext);
  const handleOpenNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="orderly-h-full orderly-flex orderly-flex-col orderly-items-center orderly-w-full orderly-p-4 orderly-text-base-contrast">
      <div className="orderly-text-base-contrast orderly-text-center">
        <div className="orderly-text-[32px] lg:orderly-text-[42px] xl:orderly-text-[50px] 2xl:orderly-text-[56px]">
          <GradientText texts={[
            {text: 'Earn more as a '},
            {text: `${brokerName}`, gradient: true},
            {text: ' affiliate'},
          ]} />
        </div>
        <div className="orderly-mt-8 orderly-text-sm md:orderly-text-base lg:orderly-text-lg xl:orderly-text-lg 2xl:orderly-text-xl">
          Grow your brand | Get 40% commission | Unlock exclusive perks
        </div>
        <div className="orderly-flex orderly-justify-center">
          <button
            onClick={() => {
              if (learnAffiliate) {
                learnAffiliate?.();
              } else if (learnAffiliateUrl) {
                handleOpenNewTab(learnAffiliateUrl);
              }
            }}
            className="orderly-flex orderly-items-center orderly-mt-3 orderly-text-primary"
          >
            <div className="orderly-flex orderly-text-3xs 2xl:orderly-text-xs orderly-items-center">
              Learn how it works
              <ArrowRightIcon className="orderly-ml-2 orderly-fill-primary" fillOpacity={1}/>
            </div>
          </button>
        </div>
      </div>

      <div className="orderly-w-full md:orderly-w-full lg:orderly-w-[636px] xl:orderly-w-[892px] 2xl:orderly-w-[992px]">
        <Card />
        <Introduce />
      </div>

    </div>
  );
};
