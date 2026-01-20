import { useMemo, useRef } from "react";
import { OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { OrderValidationItem, OrderValidationResult } from "../useOrderEntry";
import { ERROR_MSG_CODES } from "./errorMsgCodes";

type TpslPriceParams = {
  /// default is 0.01
  warning_threshold?: number;
  slPrice?: string;
  liqPrice: number | null;
  side?: OrderSide;
  /** Current position qty (signed: positive=Long, negative=Short). If missing, treated as is_reducing=true, skip liq check. */
  currentPosition?: number;
  /** Order quantity (non-negative, sign derived from side). If missing or 0, treated as is_reducing=true, skip liq check. */
  orderQuantity?: number;
};

// deep compare function
const isEqual = (
  a: OrderValidationResult | null,
  b: OrderValidationResult | null,
): boolean => {
  if (a === b) return true;
  if (a === null || b === null) return false;
  const aItem = a.sl_trigger_price;
  const bItem = b.sl_trigger_price;
  if (aItem === bItem) return true;
  if (aItem === undefined || bItem === undefined) return false;
  return aItem.type === bItem.type && aItem.message === bItem.message;
};

export const useTpslPriceChecker = (
  params: TpslPriceParams,
): OrderValidationResult | null => {
  const {
    warning_threshold = 0.01,
    slPrice,
    liqPrice,
    side,
    currentPosition,
    orderQuantity,
  } = params;

  // use useRef to store the previous result
  const prevResultRef = useRef<OrderValidationResult | null>(null);

  // calculate current result
  const currentResult = useMemo(() => {
    // Treat empty string as undefined
    if (
      slPrice === undefined ||
      slPrice === "" ||
      liqPrice === undefined ||
      side === undefined ||
      liqPrice === null
    ) {
      return null;
    }

    // Cannot compute is_reducing: treat as is_reducing=true, skip liq check and warning
    const canComputeIsReducing =
      currentPosition !== undefined &&
      orderQuantity !== undefined &&
      orderQuantity > 0;
    if (!canComputeIsReducing) {
      return null;
    }

    // orderQty: signed (Buy=positive, Sell=negative)
    const orderQty =
      side === OrderSide.SELL
        ? -((orderQuantity as number) || 0)
        : (orderQuantity as number) || 0;
    const cur = (currentPosition as number) ?? 0;
    const net = new Decimal(cur).plus(orderQty).toNumber();
    const is_reducing = new Decimal(Math.abs(net)).lt(Math.abs(cur));

    // is_reducing: skip liq check and warning
    if (is_reducing) {
      return null;
    }

    // Convert prices to Decimal for precise calculation
    let slPriceDecimal: Decimal;
    let liqPriceDecimal: Decimal;

    try {
      slPriceDecimal = new Decimal(slPrice);
      liqPriceDecimal = new Decimal(liqPrice);
    } catch (e) {
      return null;
    }

    // Validate that both prices are valid and not zero
    const slPriceNum = slPriceDecimal.toNumber();
    const liqPriceNum = liqPriceDecimal.toNumber();

    if (
      Number.isNaN(slPriceNum) ||
      Number.isNaN(liqPriceNum) ||
      !Number.isFinite(slPriceNum) ||
      !Number.isFinite(liqPriceNum) ||
      liqPriceDecimal.isZero() ||
      slPriceDecimal.isZero()
    ) {
      return null;
    }

    // Liquidation check: only when !is_reducing
    // net > 0 (Long): sl <= liq → Error
    // net < 0 (Short): sl >= liq → Error
    if (net > 0 && slPriceDecimal.lte(liqPriceDecimal)) {
      return {
        sl_trigger_price: {
          type: ERROR_MSG_CODES.SL_PRICE_ERROR,
          message: "Stop loss crosses the liq. price. Please adjust your SL.",
        },
      };
    }
    if (net < 0 && slPriceDecimal.gte(liqPriceDecimal)) {
      return {
        sl_trigger_price: {
          type: ERROR_MSG_CODES.SL_PRICE_ERROR,
          message: "Stop loss crosses the liq. price. Please adjust your SL.",
        },
      };
    }

    // Warning: distance_ratio near liq (only when we did liq check and no error)
    // long: (sl price - liq price) / liq price
    // short: (liq price - sl price) / liq price
    const distance_ratio =
      side === OrderSide.BUY
        ? slPriceDecimal.minus(liqPriceDecimal).div(liqPriceDecimal)
        : liqPriceDecimal.minus(slPriceDecimal).div(liqPriceDecimal);

    // distance_ratio > warning_threshold → no warning
    if (distance_ratio.gt(warning_threshold)) {
      return null;
    }

    // 0 < distance_ratio <= warning_threshold → warning
    if (distance_ratio.gt(0) && distance_ratio.lte(warning_threshold)) {
      return {
        sl_trigger_price: {
          type: ERROR_MSG_CODES.SL_PRICE_WARNING,
          message:
            "Stop losses set near the liq. price may not trigger. Note: the liq. price can change with position notional.",
        },
      };
    }

    // distance_ratio <= 0 → error (sl crosses liq, should have been caught above; fallback)
    return {
      sl_trigger_price: {
        type: ERROR_MSG_CODES.SL_PRICE_ERROR,
        message: "Stop loss crosses the liq. price. Please adjust your SL.",
      },
    };
  }, [
    slPrice,
    liqPrice,
    side,
    warning_threshold,
    currentPosition,
    orderQuantity,
  ]);

  // if the content is the same, return the previous reference; otherwise, update and return the new reference
  if (isEqual(prevResultRef.current, currentResult)) {
    return prevResultRef.current;
  }

  prevResultRef.current = currentResult;
  return currentResult;
};
