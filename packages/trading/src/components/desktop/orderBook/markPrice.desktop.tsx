import { FC, useMemo } from "react";
import { Decimal } from "@veltodefi/utils";
import { cn, Flex, Text, Tooltip } from "@veltodefi/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { useOrderBookContext } from "../../base/orderBook/orderContext";
import { MiddlePriceView } from "../../base/orderBook/midPriceView";
import { MarkPriceView } from "../../base/orderBook/markPrice";
import { useTranslation } from "@veltodefi/i18n";
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
    <div className="oui-flex oui-flex-row oui-pl-3 oui-tabular-nums oui-justify-between oui-text-base-contrast-80 oui-text-xs oui-relative oui-cursor-pointer oui-py-[6px]">
      <div
        className={cn(
          "oui-basis-7/12 oui-flex oui-flex-row oui-items-center oui-mr-2 oui-justify-between",
          showTotal && "oui-basis-5/12"
        )}
      >
        <MiddlePriceView
          markPrice={markPrice}
          lastPrice={lastPrice}
          quote_dp={symbolInfo.quote_dp}
          className="oui-text-base"
        />
        <MarkPriceView markPrice={markPrice} quote_dp={symbolInfo.quote_dp} />
      </div>
      <div
        className={cn(
          "oui-basis-5/12 oui-flex oui-items-center oui-fex-row oui-overflow-hidden oui-relative oui-justify-end",
          showTotal && "oui-basis-7/12",
          "oui-pr-3"
        )}
      >
        <Spread asks={asks} bids={bids} />
      </div>
    </div>
  );
};

const Spread: FC<{
  asks: number[][];
  bids: number[][];
}> = (props) => {
  const { asks, bids } = props;

  const { t } = useTranslation();

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
        content={t("trading.orderBook.spreadRatio.tooltip")}
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
