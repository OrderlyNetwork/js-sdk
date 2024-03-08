import { AlgoOrderType } from "@orderly.network/types";

export function offsetToPrice(
  markPrice: number,
  offset: number,
  type: AlgoOrderType
) {
  return type === AlgoOrderType.TAKE_PROFIT
    ? markPrice + offset
    : markPrice - offset;
}

export function priceToOffset(
  markPrice: number,
  targetPrice: number,
  side: AlgoOrderType
) {
  return side === AlgoOrderType.TAKE_PROFIT
    ? targetPrice - markPrice
    : markPrice - targetPrice;
}

export function offsetPercentageToPrice(
  markPrice: number,
  offset: number,
  type: AlgoOrderType
) {
  return type === AlgoOrderType.TAKE_PROFIT
    ? markPrice + markPrice * (offset / 100)
    : markPrice - markPrice * (offset / 100);
}

export function priceToOffsetPercentage(
  markPrice: number,
  targetPrice: number,
  type: AlgoOrderType
) {
  return type === AlgoOrderType.TAKE_PROFIT
    ? (targetPrice - markPrice) / markPrice
    : (markPrice - targetPrice) / markPrice;
}

export function pnlToPrice(price: number, pnl: number, type: AlgoOrderType) {
  return type === AlgoOrderType.TAKE_PROFIT ? price + pnl : price - pnl;
}

export function priceToPnl(
  markPrice: number,
  targetPrice: number,
  type: AlgoOrderType
) {
  return type === AlgoOrderType.TAKE_PROFIT
    ? targetPrice - markPrice
    : markPrice - targetPrice;
}
