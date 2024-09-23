import { FC, useMemo } from "react";
import { commify, commifyOptional, Decimal } from "@orderly.network/utils";
import {
  ArrowDownShortIcon,
  ArrowUpShortIcon,
  Box,
  cn,
  Flex,
  Text,
  Tooltip,
} from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { useOrderBookContext } from "../orderContext";

interface DesktopMarkPriceProps {
  markPrice: number;
  lastPrice: number[];
  asks: number[][];
  bids: number[][];
  symbolInfo: BasicSymbolInfo;
}

export const DesktopMarkPrice: FC<DesktopMarkPriceProps> = (props) => {
  const { markPrice = 0, lastPrice, asks, bids, symbolInfo } = props;
  const { showTotal } = useOrderBookContext();

  return (
    <Flex py={1} pl={3} pr={showTotal ? 3 : 6} justify={"between"}>
      <Flex gap={2}>
        <MiddlePriceView
          markPrice={markPrice}
          lastPrice={lastPrice}
          quote_dp={symbolInfo.quote_dp}
        />
        <MarkPriceView markPrice={markPrice} quote_dp={symbolInfo.quote_dp} />
      </Flex>
      <Spread asks={asks} bids={bids} />
    </Flex>
  );
};

/**
 * default style is desktop effect
 */
export const MiddlePriceView: FC<{
  markPrice: number;
  lastPrice: number[];
  quote_dp: number;
  className?: string;
  iconSize?: number;
}> = (props) => {
  const {
    markPrice = 0,
    lastPrice,
    quote_dp,
    className,
    iconSize = 18,
  } = props;

  const [prevLastPrice, middlePrice] = lastPrice;

  return (
    <Flex
      gap={1}
      className={cn(
        middlePrice > prevLastPrice
          ? "oui-text-trade-profit"
          : "oui-text-trade-loss",
        className
      )}
    >
      <Text.numeral dp={quote_dp}>{middlePrice}</Text.numeral>
      <Box width={19}>
        {middlePrice < prevLastPrice && (
          <ArrowDownShortIcon size={iconSize} color="danger" opacity={1} />
        )}
        {middlePrice > prevLastPrice && (
          <ArrowUpShortIcon size={iconSize} color="success" opacity={1} />
        )}
      </Box>
    </Flex>
  );
};

/**
 * default style is desktop effect
 */
export const MarkPriceView: FC<{
  markPrice: number;
  quote_dp: number;
  className?: string;
  iconSize?: number;
}> = (props) => {
  const { quote_dp, className, iconSize = 18 } = props;

  return (
    <Tooltip
      content={
        "Obtained from a third-party oracle, the mark price is calculated as the median of three prices: the last price, the fair price based on the funding rate basis, and the fair price based on the order books."
      }
      className="oui-max-w-[270px]"
    >
      <Flex
        gap={1}
        className={cn("oui-cursor-pointer oui-text-2xs", className)}
      >
        <FlagIcon size={iconSize} />
        <Text.numeral
          dp={quote_dp}
          color="warning"
          className="oui-underline oui-decoration-dashed oui-decoration-1 oui-underline-offset-4 oui-decoration-warning"
        >
          {props.markPrice}
        </Text.numeral>
      </Flex>
    </Tooltip>
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

const FlagIcon = (props: { size: number }) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3.75 1.5a.75.75 0 0 1 .75.75h6a.75.75 0 0 1 .75.75v1.5h3a.75.75 0 0 1 .75.75V12a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75v-1.5H4.5v5.25a.75.75 0 0 1-1.5 0V2.25a.75.75 0 0 1 .75-.75M4.5 9h5.25V3.75H4.5zm6.75-3v3.75a.75.75 0 0 1-.75.75H8.25v.75h5.25V6z"
        fill="#FF7D00"
      />
    </svg>
  );
};
