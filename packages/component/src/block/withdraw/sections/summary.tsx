import { FC } from "react";

export interface SummaryProps {
  fee: number;
  // token:
}

export const Summary: FC<SummaryProps> = (props) => {
  return (
    <div className={"flex items-start py-4 text-sm text-base-contrast/30"}>
      {`Fee ≈ ${props.fee} USDC`}
    </div>
  );
};
