import { ArrorRightIcon } from "../icons/arrowRight";
import { AsAnAffiliate } from "./sections/asAnAffiliate";
import { AsAnTrader } from "./sections/asAnTrader";
import { Apply } from "./sections/apply";
import { ArrorDownIcon } from "../icons/arrowDown";
import { Share } from "./sections/share";
import { Earn } from "./sections/earn";

export const Dashboard = () => {
  return (
    <div className="orderly-bg-base-900 orderly-w-full orderly-h-[912px] orderly-justify-center">
      <div className="orderly-text-base-contrast">
        <div className="orderly-text-[50px]">
          Earn more as a WOOFi affiliate
        </div>
        <div className=" orderly-mt-8">
          Grow your brand | Get 40% commission | Unlock exclusive perks
        </div>
        <button className="orderly-flex orderly-items-center orderly-mt-3">
          <div className="orderly-flex orderly-text-3xs">
            Learn how it works
            <ArrorRightIcon />
          </div>
        </button>
      </div>

      <div className="orderly-mt-9 desktop:orderly-flex orderly-items-center orderly-justify-center orderly-gap-2">
        <AsAnAffiliate />
        <AsAnTrader />
      </div>

      <div className="orderly-border orderly-border-red-300 orderly-rounded-lg orderly-p-6">
        <div>Becoming an affiliate is easy</div>

        <Apply />
        <ArrorDownIcon />
        <Share />
        <ArrorDownIcon />
        <Earn />
      </div>
    </div>
  );
};
