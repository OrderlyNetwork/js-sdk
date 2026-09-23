import { useCallback, useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import type {
  PredictionOrderBookLevel,
  PredictionOrderSide,
  PredictionOutcome,
} from "../prediction.types";
import { clamp } from "../prediction.types";

export const createBook = (midPrice: number) => {
  const asks: PredictionOrderBookLevel[] = [];
  const bids: PredictionOrderBookLevel[] = [];

  for (let index = 0; index < 7; index += 1) {
    const step = (index + 1) * 0.01;
    asks.push({
      price: clamp(midPrice + step, 0.0001, 0.9999),
      quantity: 180 + index * 73 + ((index * 37) % 90),
    });
    bids.push({
      price: clamp(midPrice - step, 0.0001, 0.9999),
      quantity: 210 + index * 61 + ((index * 29) % 110),
    });
  }

  return { asks: asks.reverse(), bids };
};

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

export type UsePredictionOrderBookArgs = {
  selectedMarketPrice: number;
  outcomePrices: Record<PredictionOutcome, number>;
  selectedOutcome: PredictionOutcome;
  orderSide: PredictionOrderSide;
  orderQuantity: number;
  orderType: "market" | "limit";
  slippage: string;
};

export const usePredictionOrderBook = ({
  selectedMarketPrice,
  outcomePrices,
  selectedOutcome,
  orderSide,
  orderQuantity,
  orderType,
  slippage,
}: UsePredictionOrderBookArgs) => {
  const orderBook = useMemo(
    () => createBook(selectedMarketPrice),
    [selectedMarketPrice],
  );

  const estimateOrderSlippage = useCallback(
    (
      side: PredictionOrderSide,
      quantity: number,
      outcome: PredictionOutcome = selectedOutcome,
    ) =>
      estimateMarketSlippage(
        side,
        quantity,
        createBook(outcomePrices[outcome]),
      ),
    [outcomePrices, selectedOutcome],
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
