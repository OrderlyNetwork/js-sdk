import { FC } from "react";

export interface SummaryProps {
  fee: number;
  // token:
}

export const Summary: FC<SummaryProps> = (props) => {
  return (
    <div className="orderly-flex orderly-items-start orderly-py-4 orderly-text-4xs orderly-text-base-contrast-36 desktop:orderly-text-3xs">
      {`Fee ≈ ${props.fee} USDC`}
    </div>
  );
};
