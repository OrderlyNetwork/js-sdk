import { SymbolContext } from "@/provider";
import { Numeral } from "@/text";
import { cn } from "@/utils/css";
import { Flag, MoveUpIcon } from "lucide-react";
import { FC, useContext, useEffect, useRef } from "react";

interface MarkPriceProps {
  markPrice: number;
  lastPrice: number[];
}

export const MarkPrice: FC<MarkPriceProps> = (props) => {
  const { markPrice = 0, lastPrice } = props;

  const { quote_dp } = useContext(SymbolContext);

  const [prevLastPrice, middlePrice] = lastPrice;

  // console.log(prevLastPrice);
  // console.log(prevLastPrice, middlePrice);

  return (
    <div className="py-2 flex justify-between">
      <div
        className={cn("font-semibold text-[15px] flex items-center", {
          "text-trade-profit": middlePrice > prevLastPrice,
          "text-trade-loss": middlePrice < prevLastPrice,
        })}
      >
        <Numeral precision={quote_dp}>{middlePrice}</Numeral>
        {prevLastPrice !== middlePrice && (
          <MoveUpIcon
            size={14}
            color="currentcolor"
            className={cn({
              "rotate-180": middlePrice < prevLastPrice,
            })}
          />
        )}
      </div>
      <div className={"text-sm flex items-center gap-1"}>
        <Flag size={14} className={"text-yellow-400"} />
        <Numeral precision={quote_dp}>{markPrice}</Numeral>
      </div>
    </div>
  );
};
