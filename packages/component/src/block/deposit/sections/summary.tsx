import { Pencil } from "lucide-react";
import { FC } from "react";

export interface SummaryProps {
  onSlippageChange?: () => void;
}

export const Summary: FC<SummaryProps> = (props) => {
  return (
    <div className={"flex items-start py-4 text-sm text-tertiary"}>
      <div className={"flex-1"}>
        <div>1 USDC = 1 USDC</div>
        <div>Trading Fee ≈ 0 USDC</div>
      </div>
      <div
        className={"flex items-center gap-2"}
        onClick={() => props.onSlippageChange?.()}
      >
        <span>Slippage : 1%</span>
        <Pencil size={14} />
      </div>
    </div>
  );
};
