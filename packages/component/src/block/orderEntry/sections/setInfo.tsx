import { ArrowRightIcon } from "@/icon/icons/arrowRight";

export const EstInfo = () => {
  return (
    <>
      <div className="orderly-flex orderly-justify-between orderly-text-base-contrast-54">
        <span>Est. Liq. price</span>
        <span className="orderly-flex orderly-gap-1">
          <span className="orderly-text-base-contrast">1,232.98</span>
          <span>USDC</span>
        </span>
      </div>
      <div className="orderly-flex orderly-justify-between orderly-text-base-contrast-54">
        <span>Account leverage</span>
        <span className="orderly-flex orderly-items-center orderly-gap-1">
          <span className="orderly-text-base-contrast">1,232.98</span>
          <ArrowRightIcon size={8} />
          <span className="orderly-text-base-contrast">5.00</span>
        </span>
      </div>
    </>
  );
};
