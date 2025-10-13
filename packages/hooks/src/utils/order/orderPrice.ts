import { order as orderUtils } from "@kodiak-finance/orderly-perp";
import {
  API,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@kodiak-finance/orderly-types";

/**
 * if order_type = market order,
 * order side = buy/long, then order_price_i = ask0
 * order side = sell/short, then order_price_i = bid0
 * if order_type = limit order
 * order side = buy/long
 * limit_price >= ask0, then order_price_i = ask0
 * limit_price < ask0, then order_price_i = limit_price
 * order side = sell/short
 * limit_price <= bid0, then order_price_i = bid0
 * limit_price > ask0, then order_price_i = ask0
 */
export function getOrderPrice(
  order: Partial<OrderlyOrder>,
  askAndBid: number[],
) {
  const orderPrice = Number(order.order_price);
  if (
    order.order_type === OrderType.MARKET ||
    order.order_type === OrderType.STOP_MARKET
  ) {
    if (order.side === OrderSide.BUY) {
      return askAndBid[0];
    } else {
      return askAndBid[1];
    }
  } else {
    // LIMIT order
    if (order.side === OrderSide.BUY) {
      if (orderPrice >= askAndBid[0]) {
        return askAndBid[0];
      } else {
        return orderPrice;
      }
    } else {
      if (orderPrice <= askAndBid[1]) {
        return askAndBid[1];
      } else {
        return orderPrice;
      }
    }
  }
}

export function getPriceRange(inputs: {
  side: OrderSide;
  basePrice: number;
  symbolInfo: API.SymbolExt;
}) {
  const { basePrice, side, symbolInfo } = inputs;
  const { price_range, price_scope, quote_min, quote_max } = symbolInfo;

  const maxPriceNumber = orderUtils.maxPrice(basePrice, price_range);
  const minPriceNumber = orderUtils.minPrice(basePrice, price_range);
  const scopePriceNumber = orderUtils.scopePrice(basePrice, price_scope, side);

  const priceRange =
    side === OrderSide.BUY
      ? {
          min: scopePriceNumber,
          max: maxPriceNumber,
        }
      : {
          min: minPriceNumber,
          max: scopePriceNumber,
        };

  const minPrice = Math.max(quote_min, priceRange?.min);
  const maxPrice = Math.min(quote_max, priceRange?.max);

  return {
    minPrice,
    maxPrice,
  };
}

export function getTPSLTriggerPriceScope(inputs: {
  side: OrderSide;
  basePrice: number;
  symbolInfo: API.SymbolExt;
}) {
  const { basePrice, side, symbolInfo } = inputs;
  const { price_scope, quote_min, quote_max } = symbolInfo;

  const scopePriceNumber = orderUtils.scopePrice(basePrice, price_scope, side);

  const priceRange =
    side === OrderSide.BUY
      ? {
          min: scopePriceNumber,
          max: quote_max,
        }
      : {
          min: quote_min,
          max: scopePriceNumber,
        };

  return {
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  };
}

/** @deprecated use getTPSLTriggerPriceScope instead */
export function getTPSLTriggerPriceRange(inputs: {
  side: OrderSide;
  basePrice: number;
  symbolInfo: API.SymbolExt;
}) {
  const { basePrice, side, symbolInfo } = inputs;
  const { price_scope, quote_min, quote_max } = symbolInfo;

  const scopePriceNumber = orderUtils.scopePrice(basePrice, price_scope, side);

  const priceRange =
    side === OrderSide.BUY
      ? {
          min: scopePriceNumber,
          max: quote_max,
        }
      : {
          min: quote_min,
          max: scopePriceNumber,
        };

  return {
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  };
}
