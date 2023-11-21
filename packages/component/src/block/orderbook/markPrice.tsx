import { SymbolContext } from "@/provider";
import { Numeral } from "@/text";
import { cn } from "@/utils/css";
import { Flag, MoveUpIcon } from "lucide-react";
import { FC, useContext, useEffect, useRef } from "react";
import { modal } from "@/modal";

interface MarkPriceProps {
  markPrice: number;
  lastPrice: number[];
}

export const MarkPrice: FC<MarkPriceProps> = (props) => {
  const { markPrice = 0, lastPrice } = props;

  const { quote_dp } = useContext(SymbolContext);

  const [prevLastPrice, middlePrice] = lastPrice;

  //
  //

  const onMarkPrice = () => {
    modal.alert({
      title: "Mark price",
      message: (
        <span className="text-3xs text-base-contrast-54">
          Obtained from a third-party oracle, the mark price is calculated as
          the median of three prices: the last price, the fair price based on
          the funding rate basis, and the fair price based on the order books.
        </span>
      ),
    });
  };

  return (
    <div className="py-2 flex justify-between text-xs ">
      <div
        className={cn("font-semibold flex items-center", {
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
      <div className={"flex items-center gap-1"} onClick={onMarkPrice}>
        <Flag size={14} className={"text-yellow-400"} />
        <Numeral precision={quote_dp}>{markPrice}</Numeral>
      </div>
    </div>
  );
};
