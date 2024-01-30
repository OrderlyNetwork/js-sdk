import { SlippageDialog } from "@/block/swap";
import { Pencil } from "lucide-react";
import { FC } from "react";

interface SlippageSettingProps {
  slippage: number;
  onSlippageChange?: (slippage: number) => void;
}

export const SlippageSetting: FC<SlippageSettingProps> = (props) => {
  return (
    <SlippageDialog value={props.slippage} onConfirm={props.onSlippageChange}>
      <div className="orderly-flex orderly-items-center orderly-gap-2 orderly-cursor-pointer">
        <span>{`Slippage : ${props.slippage}%`}</span>
        {/* @ts-ignore */}
        <Pencil size={14} />
      </div>
    </SlippageDialog>
  );
};
