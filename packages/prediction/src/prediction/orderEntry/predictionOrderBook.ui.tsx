import React, { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  MobileOrderBookLadder,
  OrderBookLadder,
} from "@orderly.network/trading-common";
import { Text, Tooltip, cn, useScreen } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { binaryOutcomeMarkPrice } from "../binary/binaryMarkPrice";
import {
  DEFAULT_BINARY_BASE_TICK,
  DEFAULT_BINARY_QUOTE_TICK,
} from "../binary/binaryOrderRules";
import type { PredictionState } from "../prediction.script";
import { accumulateOrderBookLevels } from "../predictionShared";

const predictionSymbolInfo = (
  base: string,
  quote: string,
  baseTick: number,
  quoteTick: number,
) => ({
  base_dp: new Decimal(baseTick).decimalPlaces(),
  quote_dp: new Decimal(quoteTick).decimalPlaces(),
  base_tick: baseTick,
  base,
  quote,
});

export const PredictionOrderBook: React.FC<
  Pick<
    PredictionState,
    | "orderBook"
    | "selectedOutcome"
    | "markPrice"
    | "setLimitPrice"
    | "setOrderType"
    | "isRoundTradable"
    | "roundPhase"
    | "selectedRow"
    | "market"
  >
> = ({
  orderBook,
  selectedOutcome,
  markPrice,
  setLimitPrice,
  setOrderType,
  isRoundTradable,
  roundPhase,
  selectedRow,
  market,
}) => {
  const { t } = useTranslation();
  const quoteTick = selectedRow?.quote_tick ?? DEFAULT_BINARY_QUOTE_TICK;
  const baseTick = selectedRow?.base_tick ?? DEFAULT_BINARY_BASE_TICK;
  const quote = market?.quote ?? "USDC";
  const selectPrice = (price: number) => {
    setOrderType("limit");
    setLimitPrice(price.toFixed(new Decimal(quoteTick).decimalPlaces()));
  };

  const asks = useMemo(
    // Asks render best-last, so cumulative totals grow from the last level.
    () => accumulateOrderBookLevels(orderBook.asks, "backward"),
    [orderBook.asks],
  );

  const bids = useMemo(
    () => accumulateOrderBookLevels(orderBook.bids, "forward"),
    [orderBook.bids],
  );

  const isPastRound =
    roundPhase === "closed" ||
    roundPhase === "resolvedUp" ||
    roundPhase === "resolvedDown";
  const emptyLevels = useMemo(
    () =>
      Array.from({ length: 7 }, () => [
        Number.NaN,
        Number.NaN,
        Number.NaN,
        Number.NaN,
      ]),
    [],
  );
  const displayedAsks = isPastRound ? emptyLevels : asks;
  const displayedBids = isPastRound ? emptyLevels : bids;
  const displayedPrice = isPastRound
    ? undefined
    : binaryOutcomeMarkPrice(markPrice, selectedOutcome);
  const base = selectedOutcome.toUpperCase();
  const { isMobile } = useScreen();

  // Shared by the desktop and mobile ladders; the mobile variant swaps the
  // three-column header for the perps mobile two-column picker header.
  const ladderProps = {
    asks: displayedAsks,
    bids: displayedBids,
    middlePriceContent: (
      <Tooltip content={t("prediction.markPrice.tooltip")}>
        <span className="oui-prediction-orderBook-markPrice oui-cursor-pointer oui-text-base oui-text-base-contrast oui-underline oui-decoration-dashed oui-underline-offset-4">
          {displayedPrice == null ? (
            "--"
          ) : (
            <Text.numeral
              dp={new Decimal(quoteTick).decimalPlaces()}
              intensity={98}
            >
              {displayedPrice}
            </Text.numeral>
          )}
        </span>
      </Tooltip>
    ),
    markPrice: displayedPrice ?? Number.NaN,
    lastPrice: [Number.NaN, Number.NaN],
    depths: [String(quoteTick)],
    base,
    quote,
    symbolInfo: predictionSymbolInfo(base, quote, baseTick, quoteTick),
    onItemClick: (item: number[]) => selectPrice(item[0]),
    showMarkPrice: false,
    cellHeight: 20,
  };

  return (
    <section
      className={cn(
        "oui-prediction-orderBook oui-flex oui-h-full oui-min-h-[300px] oui-flex-col oui-overflow-hidden oui-rounded-xl oui-bg-base-9 xl:oui-min-h-[420px]",
        !isRoundTradable && "oui-pointer-events-none",
      )}
    >
      <div className="oui-flex oui-items-center oui-px-3 oui-pt-3">
        <span className="oui-text-sm oui-font-semibold oui-text-base-contrast">
          {t("prediction.orderBook")}
        </span>
      </div>
      <div className="oui-min-h-0 oui-flex-1 oui-pb-3">
        {isMobile ? (
          <MobileOrderBookLadder {...ladderProps} />
        ) : (
          <OrderBookLadder {...ladderProps} />
        )}
      </div>
    </section>
  );
};
