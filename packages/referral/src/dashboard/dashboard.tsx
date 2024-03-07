import { ArrorRightIcon } from "./icons/arrowRight";
import { Card } from "./sections/card";
import { Introduce } from "./sections/introduce";

export const Dashboard = () => {
  return (
    <div className="orderly-bg-base-900 orderly-flex orderly-flex-col orderly-items-center orderly-w-full orderly-p-4">
      <div className="orderly-text-base-contrast orderly-text-center">
        <div className="orderly-text-[32px] lg:orderly-text-[42px] xl:orderly-text-[50px] 2xl:orderly-text-[56px]">
          Earn more as a WOOFi affiliate
        </div>
        <div className="orderly-mt-8 orderly-text-sm md:orderly-text-base lg:orderly-text-lg xl:orderly-text-lg 2xl:orderly-text-xl">
          Grow your brand | Get 40% commission | Unlock exclusive perks
        </div>
        <div className="orderly-flex orderly-justify-center">
          <button className="orderly-flex orderly-items-center orderly-mt-3 orderly-text-primary">
            <div className="orderly-flex orderly-text-3xs 2xl:orderly-text-xs">
              Learn how it works
              <ArrorRightIcon className="orderly-ml-2" />
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
