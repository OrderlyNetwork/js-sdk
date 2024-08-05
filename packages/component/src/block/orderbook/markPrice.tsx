import { SymbolContext } from "@/provider";
import { Numeral } from "@/text";
import { cn } from "@/utils/css";
import { Flag, MoveUpIcon } from "lucide-react";
import { FC, useContext, useEffect, useRef } from "react";
import { modal } from "@orderly.network/ui";

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
        <span className="orderly-text-3xs orderly-text-base-contrast-54">
          Obtained from a third-party oracle, the mark price is calculated as
          the median of three prices: the last price, the fair price based on
          the funding rate basis, and the fair price based on the order books.
        </span>
      ),
    });
  };

  return (
    <div
      id="orderly-order-book-mark-price"
      className="orderly-py-1 orderly-flex orderly-justify-between orderly-text-xs orderly-text-base-contrast-80 desktop:orderly-h-[42px] desktop:orderly-text-[20px] desktop:orderly-justify-center desktop:orderly-gap-5 orderly-tabular-nums"
    >
      <div
        className={cn(
          "orderly-font-semibold orderly-flex orderly-items-center desktop:orderly-font-normal desktop:orderly-relative desktop:orderly-pr-4",
          {
            "orderly-text-trade-profit": middlePrice > prevLastPrice,
            "orderly-text-trade-loss": middlePrice < prevLastPrice,
          }
        )}
      >
        <Numeral precision={quote_dp}>{middlePrice}</Numeral>
        {prevLastPrice !== middlePrice && (
          // @ts-ignore
          <MoveUpIcon
            size={14}
            color="currentcolor"
            className={cn("desktop:orderly-absolute desktop:orderly-right-0", {
              "orderly-rotate-180": middlePrice < prevLastPrice,
            })}
          />
        )}
      </div>
      <div
        className="orderly-flex orderly-items-center orderly-gap-1 orderly-text-3xs desktop:orderly-text-base"
        onClick={onMarkPrice}
      >
        {/* @ts-ignore */}
        <Flag size={14} className="orderly-text-yellow-400" />
        <Numeral
          precision={quote_dp}
          className="desktop:orderly-text-base-contrast-54"
        >
          {markPrice}
        </Numeral>
      </div>
    </div>
  );
};
