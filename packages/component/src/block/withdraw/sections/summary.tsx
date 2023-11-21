import { FC } from "react";

export interface SummaryProps {
  fee: number;
  // token:
}

export const Summary: FC<SummaryProps> = (props) => {
  return (
    <div className={"flex items-start py-4 text-4xs text-base-contrast-36"}>
      {`Fee ≈ ${props.fee} USDC`}
    </div>
  );
};
