import { useCallback, useEffect, useMemo, useState } from "react";
import { Decimal } from "@orderly.network/utils";
import {
  useBinaryOrderbook,
  type BinaryBookLevel,
  type BinaryOrderBook,
} from "../binary/useBinaryOrderbook";
import type {
  PredictionOrderBookLevel,
  PredictionOrderSide,
  PredictionOutcome,
} from "../prediction.types";

export const estimateMarketSlippage = (
  side: PredictionOrderSide,
  quantity: number,
  orderBook: {
    asks: PredictionOrderBookLevel[];
    bids: PredictionOrderBookLevel[];
  },
) => {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  const levels = (side === "buy" ? orderBook.asks : orderBook.bids)
    .filter((level) => level.quantity > 0)
    .sort((a, b) => (side === "buy" ? a.price - b.price : b.price - a.price));
  const bestPrice = levels[0]?.price;
  if (!bestPrice) return null;

  let remaining = new Decimal(quantity);
  let notional = new Decimal(0);
  for (const level of levels) {
    const fill = remaining.lte(level.quantity)
      ? remaining
      : new Decimal(level.quantity);
    notional = notional.add(fill.mul(level.price));
    remaining = remaining.sub(fill);
    if (remaining.lte(0)) break;
  }

  const filled = new Decimal(quantity).sub(remaining);
  if (filled.lte(0)) return null;

  return notional.div(filled).sub(bestPrice).abs().div(bestPrice).toNumber();
};

const toLevels = (levels: BinaryBookLevel[]) =>
  levels.map(([price, quantity]) => ({ price, quantity }));

export type UsePredictionOrderBookArgs = {
  /** Round-specific binary symbol driving the WS subscription. */
  symbol: string | undefined;
  active: boolean;
};

/**
 * Live orderbook data for the selected round: BBO-derived outcome display
 * prices (stale-while-empty, reset per symbol) in both coordinates.
 */
export const usePredictionOrderBook = ({
  symbol,
  active,
}: UsePredictionOrderBookArgs) => {
  const { book, bbo, isLoading } = useBinaryOrderbook(symbol, active);

  const [lastPrices, setLastPrices] = useState<{
    symbol?: string;
    up: number;
    down: number;
  }>({
    symbol,
    up: 0.5,
    down: 0.5,
  });

  useEffect(() => {
    setLastPrices({ symbol, up: 0.5, down: 0.5 });
  }, [symbol]);

  useEffect(() => {
    if (bbo.mid == null) return;
    setLastPrices({
      symbol,
      up: bbo.mid,
      down: new Decimal(1).sub(bbo.mid).toNumber(),
    });
  }, [bbo.mid, symbol]);

  const outcomePrices =
    lastPrices.symbol === symbol
      ? { up: lastPrices.up, down: lastPrices.down }
      : { up: 0.5, down: 0.5 };

  return {
    book,
    bbo,
    /** Display prices per outcome (0–1 fraction), stale-while-empty. */
    outcomePrices,
    upChance: outcomePrices.up * 100,
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
      return estimateMarketSlippage(side, quantity, {
        asks: toLevels(levels.asks),
        bids: toLevels(levels.bids),
      });
    },
    [book, selectedOutcome],
  );

  const estimatedSlippage = useMemo(
    () => estimateOrderSlippage(orderSide, orderQuantity),
    [estimateOrderSlippage, orderQuantity, orderSide],
  );

  const isSlippageExceeded =
    orderType === "market" &&
    estimatedSlippage !== null &&
    estimatedSlippage > new Decimal(slippage || 0).div(100).toNumber();

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
