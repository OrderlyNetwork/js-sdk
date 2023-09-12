import { SymbolContext } from "@/provider";
import { Numeral } from "@/text";
import { cn } from "@/utils/css";
import { Flag } from "lucide-react";
import { FC, useContext } from "react";

interface MarkPriceProps {
  markPrice: number;
  lastPrice: number;
}

export const MarkPrice: FC<MarkPriceProps> = (props) => {
  const { markPrice = 0, lastPrice = 0 } = props;
  const { quote_dp } = useContext(SymbolContext);
  return (
    <div className="py-2 flex justify-between">
      <div className={cn("font-semibold text-[15px]")}>
        <Numeral precision={quote_dp}>{lastPrice}</Numeral>
      </div>
      <div className={"text-sm flex items-center gap-1"}>
        <Flag size={14} className={"text-yellow-400"} />
        <Numeral precision={quote_dp}>{markPrice}</Numeral>
      </div>
    </div>
  );
};
