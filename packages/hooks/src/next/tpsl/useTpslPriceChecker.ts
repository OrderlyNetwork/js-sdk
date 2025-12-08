import { useMemo, useRef } from "react";
import { OrderSide } from "@veltodefi/types";
import { Decimal } from "@veltodefi/utils";
import { OrderValidationItem, OrderValidationResult } from "../useOrderEntry";
import { ERROR_MSG_CODES } from "./errorMsgCodes";

type TpslPriceParams = {
  /// default is 0.01
  warning_threshold?: number;
  slPrice?: string;
  liqPrice: number | null;
  side?: OrderSide;
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
  const { warning_threshold = 0.01, slPrice, liqPrice, side } = params;

  // use useRef to store the previous result
  const prevResultRef = useRef<OrderValidationResult | null>(null);

  // calculate current result
  const currentResult = useMemo(() => {
    if (
      slPrice === undefined ||
      liqPrice === undefined ||
      side === undefined ||
      liqPrice === null
    ) {
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

    // Calculate distance_ratio based on position side using Decimal
    // long: (sl price - liq price) / liq price
    // short: (liq price - sl price) / liq price
    const distance_ratio =
      side === OrderSide.BUY
        ? slPriceDecimal.minus(liqPriceDecimal).div(liqPriceDecimal)
        : liqPriceDecimal.minus(slPriceDecimal).div(liqPriceDecimal);

    // Case 1: distance_ratio > warning_threshold → no warning
    if (distance_ratio.gt(warning_threshold)) {
      return null;
    }

    // Case 2: 0 < distance_ratio <= warning_threshold → warning
    if (distance_ratio.gt(0) && distance_ratio.lte(warning_threshold)) {
      return {
        sl_trigger_price: {
          type: ERROR_MSG_CODES.SL_PRICE_WARNING,
          message:
            "Stop losses set near the liq. price may not trigger. Note: the liq. price can change with position notional.",
        },
      };
    }

    // Case 3: distance_ratio <= 0 → error (invalid, blocks execution)
    return {
      sl_trigger_price: {
        type: ERROR_MSG_CODES.SL_PRICE_ERROR,
        message: "Stop loss crosses the liq. price. Please adjust your SL.",
      },
    };
  }, [slPrice, liqPrice, side, warning_threshold]);

  // if the content is the same, return the previous reference; otherwise, update and return the new reference
  if (isEqual(prevResultRef.current, currentResult)) {
    return prevResultRef.current;
  }

  prevResultRef.current = currentResult;
  return currentResult;
};
