import { FC } from "react";
import { Flex, modal } from "@orderly.network/ui";
import { useOrderBookContext } from "../../base/orderBook/orderContext";
import { MarkPriceView } from "../../base/orderBook/markPrice";
import { MiddlePriceView } from "../../base/orderBook/midPriceView";

interface MarkPriceProps {
  markPrice: number;
  lastPrice: number[];
}

export const MarkPrice: FC<MarkPriceProps> = (props) => {
  const { markPrice = 0, lastPrice } = props;

  const { symbolInfo, tabletMediaQuery } = useOrderBookContext();

  const { quote_dp } = symbolInfo;

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
    <Flex id="oui-order-book-mark-price" className="oui-py-[6px]" width={"100%"} justify={"between"}>
      <MiddlePriceView
        markPrice={props.markPrice}
        lastPrice={props.lastPrice}
        quote_dp={quote_dp}
        className="oui-text-sm"
        iconSize={14}
      />
      <MarkPriceView
        markPrice={props.markPrice}
        quote_dp={quote_dp}
        className="oui-text-2xs"
        iconSize={12}
        tabletMediaQuery={tabletMediaQuery}
      />
    </Flex>
  );
};
