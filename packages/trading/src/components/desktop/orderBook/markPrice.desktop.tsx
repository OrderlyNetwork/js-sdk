import { FC, useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import {
  Flex,
  Text,
  Tooltip,
} from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { useOrderBookContext } from "../../base/orderBook/orderContext";
import { MiddlePriceView } from "../../base/orderBook/midPriceView";
import { MarkPriceView } from "../../base/orderBook/markPrice";

interface DesktopMarkPriceProps {
  markPrice: number;
  lastPrice: number[];
  asks: number[][];
  bids: number[][];
  symbolInfo: BasicSymbolInfo;
}

export const DesktopMarkPrice: FC<DesktopMarkPriceProps> = (props) => {
  const { markPrice = 0, lastPrice, asks, bids, symbolInfo } = props;
  const { showTotal, tabletMediaQuery } = useOrderBookContext();

  return (
    <Flex py={1} pl={3} pr={showTotal ? 3 : 6} justify={"between"}>
      <Flex gap={2}>
        <MiddlePriceView
          markPrice={markPrice}
          lastPrice={lastPrice}
          quote_dp={symbolInfo.quote_dp}
        />
        <MarkPriceView markPrice={markPrice} quote_dp={symbolInfo.quote_dp} tabletMediaQuery={tabletMediaQuery} />
      </Flex>
      <Spread asks={asks} bids={bids} />
    </Flex>
  );
};




const Spread: FC<{
  asks: number[][];
  bids: number[][];
}> = (props) => {
  const { asks, bids } = props;

  const spread = useMemo(() => {
    if (bids.length === 0 && asks.length === 0) {
      return 0;
    }
    const bid1 = Number.isNaN(bids[0][0]) ? 0 : bids[0][0];
    const index = asks.reverse().findIndex((item) => !Number.isNaN(item[0]));

    let ask1 = 0.0;
    if (index !== -1) {
      ask1 = Number.isNaN(asks[index][0]) ? 0 : asks[index][0];
    }
    const dValue = new Decimal(ask1)
      .sub(bid1)
      .div(new Decimal(ask1).add(bid1).div(2));
    // 0.00006416604461251195
    // 0.000065
    // 0.0065
    return Math.ceil(dValue.toNumber() * 1000000 + 0.1) / 10000;
  }, [asks, bids]);

  return (
    <div>
      <Tooltip
        content={"Spread Ratio of the ask1 and bid1."}
        className="oui-max-w-[240px]"
      >
        <Text
          size="2xs"
          intensity={36}
          className={
            "oui-cursor-pointer oui-underline oui-decoration-dashed oui-decoration-1 oui-underline-offset-4 oui-decoration-base-contrast-36"
          }
        >
          {`${spread}%`}
        </Text>
      </Tooltip>
    </div>
  );
};
