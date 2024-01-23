import { MoveRight } from "lucide-react";

export const EstInfo = () => {
  return (
    <>
      <div className="orderly-flex orderly-justify-between orderly-text-base-contrast-54">
        <span>Est. Liq. price</span>
        <span>
          <span>1,232.98</span>
          <span>USDC</span>
        </span>
      </div>
      <div className="orderly-flex orderly-justify-between orderly-text-base-contrast-54">
        <span>Account leverage</span>
        <span className="orderly-flex orderly-items-center">
          <span>1,232.98</span>
          <MoveRight size={14} />
          <span>5.00</span>
        </span>
      </div>
    </>
  );
};
