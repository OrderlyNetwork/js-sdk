import { FC, useContext, useEffect, useRef } from "react";
import { Text, cn, modal } from "@orderly.network/ui";
import { useTradingPateContext } from "../../../provider/context";

interface MarkPriceProps {
  markPrice: number;
  lastPrice: number[];
}

export const MarkPrice: FC<MarkPriceProps> = (props) => {
  const { markPrice = 0, lastPrice } = props;

  const { quote_dp } = useTradingPateContext().symbolInfo;

  const [prevLastPrice, middlePrice] = lastPrice;

  //
  //

  const onMarkPrice = () => {
    modal.alert({
      title: "Mark price",
      message: (
        <span className="oui-text-3xs oui-text-base-contrast-54">
          Obtained from a third-party oracle, the mark price is calculated as
          the median of three prices: the last price, the fair price based on
          the funding rate basis, and the fair price based on the order books.
        </span>
      ),
    });
  };

  return (
    <div
      id="oui-order-book-mark-price"
      className="oui-py-1 oui-flex oui-justify-between oui-text-xs oui-text-base-contrast-80 desktop:oui-h-[42px] desktop:oui-text-[20px] desktop:oui-justify-center desktop:oui-gap-5 oui-tabular-nums"
    >
      <div
        className={cn(
          "oui-font-semibold oui-flex oui-items-center desktop:oui-font-normal desktop:oui-relative desktop:oui-pr-4",
          middlePrice > prevLastPrice
            ? "oui-text-trade-profit"
            : "oui-text-trade-loss"
        )}
      >
        <Text.numeral dp={quote_dp}>{middlePrice}</Text.numeral>
        {prevLastPrice !== middlePrice && (
          // @ts-ignore
          <MoveUpIcon
            size={14}
            color="currentcolor"
            className={cn(
              "desktop:oui-absolute desktop:oui-right-0",
              middlePrice < prevLastPrice ? "oui-rotate-180" : ""
            )}
          />
        )}
      </div>
      <div
        className="oui-flex oui-items-center oui-gap-1 oui-text-3xs desktop:oui-text-base"
        onClick={onMarkPrice}
      >
        {/* @ts-ignore */}
        <Flag size={14} className="oui-text-yellow-400" />
        <Text.numeral
          dp={quote_dp}
          className="desktop:oui-text-base-contrast-54"
        >
          {markPrice}
        </Text.numeral>
      </div>
    </div>
  );
};
