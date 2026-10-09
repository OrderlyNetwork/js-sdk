import { useCallback, useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import {
  estimateBinarySlippage,
  parseSlippageTicks,
} from "../binary/binaryOrderRules";
import { getBinaryQuotes } from "../binary/binaryQuotes";
import {
  useBinaryOrderbook,
  type BinaryBookLevel,
  type BinaryOrderBook,
} from "../binary/useBinaryOrderbook";
import type {
  PredictionOrderSide,
  PredictionOutcome,
} from "../prediction.types";

export const estimateMarketSlippage = estimateBinarySlippage;

const toLevels = (levels: BinaryBookLevel[]) =>
  levels.map(([price, quantity]) => ({ price, quantity }));

export type UsePredictionOrderBookArgs = {
  /** Round-specific binary symbol driving the WS subscription. */
  symbol: string | undefined;
  active: boolean;
};

/**
 * Live orderbook quotes for the selected round in both outcome coordinates.
 */
export const usePredictionOrderBook = ({
  symbol,
  active,
}: UsePredictionOrderBookArgs) => {
  const { book, bbo, isLoading } = useBinaryOrderbook(symbol, active);

  const quotes = getBinaryQuotes(bbo.bestBid, bbo.bestAsk);
  const mid =
    quotes.upChance == null
      ? undefined
      : new Decimal(quotes.upChance).div(100).toNumber();
  const outcomePrices = {
    up: mid,
    down: mid == null ? undefined : new Decimal(1).sub(mid).toNumber(),
  };

  return {
    book,
    bbo,
    /** Current mid prices; absent quotes remain undefined. */
    outcomePrices,
    ...quotes,
    isBookLoading: isLoading,
  };
};

export type UsePredictionOrderBookViewArgs = {
  book: BinaryOrderBook;
  selectedOutcome: PredictionOutcome;
  orderSide: PredictionOrderSide;
  orderQuantity: number;
  orderType: "market" | "limit";
  slippage: string;
  quoteTick?: number;
};

/**
 * Presentation layer over the live book: renders the side matching the
 * selected outcome (ladder wants asks best-last / bids best-first) and
 * estimates slippage against the outcome's own coordinate.
 */
export const usePredictionOrderBookView = ({
  book,
  selectedOutcome,
  orderSide,
  orderQuantity,
  orderType,
  slippage,
  quoteTick = 0.01,
}: UsePredictionOrderBookViewArgs) => {
  const orderBook = useMemo(() => {
    if (selectedOutcome === "down") {
      return {
        // API down asks arrive ascending best-first; the ladder renders
        // best-last, so reverse (mirrors the UP asks handling).
        asks: toLevels([...book.downAsks].reverse()),
        bids: toLevels(book.downBids),
      };
    }
    return {
      asks: toLevels([...book.asks].reverse()),
      bids: toLevels(book.bids),
    };
  }, [book, selectedOutcome]);

  const estimateOrderSlippage = useCallback(
    (
      side: PredictionOrderSide,
      quantity: number,
      outcome: PredictionOutcome = selectedOutcome,
    ) => {
      const levels =
        outcome === "down"
          ? { asks: book.downAsks, bids: book.downBids }
          : { asks: book.asks, bids: book.bids };
      return estimateMarketSlippage(
        side,
        quantity,
        {
          asks: toLevels(levels.asks),
          bids: toLevels(levels.bids),
        },
        quoteTick,
      );
    },
    [book, selectedOutcome, quoteTick],
  );

  const estimatedSlippage = useMemo(
    () => estimateOrderSlippage(orderSide, orderQuantity),
    [estimateOrderSlippage, orderQuantity, orderSide],
  );

  const isSlippageExceeded =
    orderType === "market" &&
    (estimatedSlippage == null ||
      parseSlippageTicks(slippage) == null ||
      estimatedSlippage > parseSlippageTicks(slippage)!);

  return {
    orderBook,
    estimateOrderSlippage,
    estimatedSlippage,
    isSlippageExceeded,
  };
};

export type UsePredictionOrderBookReturn = ReturnType<
  typeof usePredictionOrderBook
>;
