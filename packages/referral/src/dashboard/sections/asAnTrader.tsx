import { TraderIcon } from "../icons/trader";
import { Button } from "@orderly.network/react";

export const AsAnTrader = () => {
  return (
    <div className="orderly-rounded-lg orderly-p-6 orderly-w-full orderly-bg-[rgba(0,104,92,1)]">
    <div className="orderly-flex orderly-justify-between">
      <div className="orderly-justify-between">
        <div className="orderly-text-2xl lg:orderly-text-[26px] xl:orderly-text-[28px] 2xl:orderly-text-[30px]">As a trader</div>
        <div className="orderly-mt-6 orderly-text-2xs lg:orderly-text-xs md:orderly-text-xs xl:orderly-text-xs 2xl:orderly-text-base">
        Get fee rebates on every trade
        </div>
      </div>
      <TraderIcon />
    </div>

    <div className="orderly-flex orderly-justify-between orderly-mt-2">
      <Button className="orderly-text-base xl:orderly-text-lg 2xl:orderly-text-lg">Enter code</Button>

      <div>
        <div className="orderly-text-[22px] md:orderly-text-[24px] lg:orderly-text-[26px] xl:orderly-text-[26px] 2xl:orderly-text-[28px]">0%~20%</div>
        <div className="orderly-text-3xs 2xl:orderly-text-xs orderly-text-right">Rebate</div>
      </div>
    </div>
  </div>
  );
};
