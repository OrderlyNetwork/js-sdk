import { Pencil } from "lucide-react";
import { FC } from "react";

interface SlippageSettingProps {}

export const SlippageSetting: FC<SlippageSettingProps> = (props) => {
  return (
    <div
      className={"flex items-center gap-2"}
      //   onClick={() => props.onSlippageChange?.(1)}
    >
      <span>Slippage : 1%</span>
      <Pencil size={14} />
    </div>
  );
};
