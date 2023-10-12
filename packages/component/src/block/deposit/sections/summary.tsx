import { Pencil } from "lucide-react";
import { FC, useState } from "react";
import { SlippageSetting } from "./slippageSetting";

export interface SummaryProps {
  onSlippageChange?: (slippage: number) => void;
  needSwap?: boolean;
}

export const Summary: FC<SummaryProps> = (props) => {
  return (
    <div className={"flex items-start py-4 text-sm text-tertiary"}>
      <div className={"flex-1"}>
        <div>1 USDC = 1 USDC</div>
        <div>Trading Fee ≈ 0 USDC</div>
      </div>
      {props.needSwap && <SlippageSetting />}
    </div>
  );
};
