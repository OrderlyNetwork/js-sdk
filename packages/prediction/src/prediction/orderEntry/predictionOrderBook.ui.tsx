import React, { useMemo, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  MobileOrderBookLadder,
  OrderBookLadder,
} from "@orderly.network/trading-shared";
import {
  Text,
  Tooltip,
  cn,
  useObserverElement,
  useScreen,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { binaryOutcomeMarkPrice } from "../binary/binaryMarkPrice";
import {
  DEFAULT_BINARY_BASE_TICK,
  DEFAULT_BINARY_QUOTE_TICK,
} from "../binary/binaryOrderRules";
import type { PredictionState } from "../prediction.script";
import {
  accumulateOrderBookLevels,
  clamp,
  fitOrderBookLevels,
} from "../predictionShared";

/** Row budget per side on mobile and before the first desktop measurement. */
const MIN_BOOK_LEVELS = 7;
/** Upper bound per side on desktop, matching the perps orderbook (CELL_MAX). */
const MAX_BOOK_LEVELS = 30;
const CELL_HEIGHT = 20;
/**
 * Toolbar + header + price row of the desktop ladder, subtracted before
 * splitting the measured height across the ask/bid sides. Measured on the
 * rendered ladder: depth toolbar 44px + column header 32px + price row 36px.
 */
const DESKTOP_LADDER_CHROME = 112;

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
  const { isMobile } = useScreen();

  const [ladderEl, setLadderEl] = useState<HTMLDivElement | null>(null);
  const [ladderHeight, setLadderHeight] = useState(0);
  useObserverElement(ladderEl, (entry) => {
    setLadderHeight(entry.contentRect.height);
  });

  // The desktop section's height is set by its layout context (chart row at
  // 2xl, trade panel sibling below it), so the per-side row budget fills the
  // measured box; the mobile section is content-driven and keeps the floor.
  const levelsPerSide = useMemo(() => {
    if (isMobile || ladderHeight <= 0) return MIN_BOOK_LEVELS;
    const perSide = Math.floor(
      (ladderHeight - DESKTOP_LADDER_CHROME) / (CELL_HEIGHT + 1) / 2,
    );
    return clamp(perSide, 5, MAX_BOOK_LEVELS);
  }, [isMobile, ladderHeight]);

  // Fit to the budget: pad one-sided/empty books with inert NaN placeholder
  // rows ("-" cells) away from the price row, truncate deeper books to the
  // best levels. Past rounds have no book, which fits to all placeholders.
  const displayedAsks = useMemo(
    () => fitOrderBookLevels(isPastRound ? [] : asks, levelsPerSide, "before"),
    [isPastRound, asks, levelsPerSide],
  );
  const displayedBids = useMemo(
    () => fitOrderBookLevels(isPastRound ? [] : bids, levelsPerSide, "after"),
    [isPastRound, bids, levelsPerSide],
  );
  const displayedPrice = isPastRound
    ? undefined
    : binaryOutcomeMarkPrice(markPrice, selectedOutcome);
  const base = selectedOutcome.toUpperCase();

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
    cellHeight: CELL_HEIGHT,
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
      <div ref={setLadderEl} className="oui-min-h-0 oui-flex-1 oui-pb-3">
        {isMobile ? (
          <MobileOrderBookLadder {...ladderProps} />
        ) : (
          <OrderBookLadder {...ladderProps} />
        )}
      </div>
    </section>
  );
};
