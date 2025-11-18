import { useMemo, useRef } from "react";
import { OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { OrderValidationItem } from "../useOrderEntry";
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
  a: OrderValidationItem | undefined,
  b: OrderValidationItem | undefined,
): boolean => {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  return a.type === b.type && a.message === b.message;
};

export const useTpslPriceChecker = (
  params: TpslPriceParams,
): OrderValidationItem | undefined => {
  const { warning_threshold = 0.01, slPrice, liqPrice, side } = params;

  // use useRef to store the previous result
  const prevResultRef = useRef<OrderValidationItem | undefined>();

  // calculate current result
  const currentResult = useMemo(() => {
    if (
      slPrice === undefined ||
      liqPrice === undefined ||
      side === undefined ||
      liqPrice === null
    ) {
      return undefined;
    }

    // Convert prices to Decimal for precise calculation
    let slPriceDecimal: Decimal;
    let liqPriceDecimal: Decimal;

    try {
      slPriceDecimal = new Decimal(slPrice);
      liqPriceDecimal = new Decimal(liqPrice);
    } catch (e) {
      return undefined;
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
      return undefined;
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
      return undefined;
    }

    // Case 2: 0 < distance_ratio <= warning_threshold → warning
    if (distance_ratio.gt(0) && distance_ratio.lte(warning_threshold)) {
      return {
        type: ERROR_MSG_CODES.SL_PRICE_WARNING,
        message:
          "Stop losses set near the liq. price may not trigger. Note: the liq. price can change with position notional.",
      };
    }

    // Case 3: distance_ratio <= 0 → error (invalid, blocks execution)
    return {
      type: ERROR_MSG_CODES.SL_PRICE_ERROR,
      message: "Stop loss crosses the liq. price. Please adjust your SL.",
    };
  }, [slPrice, liqPrice, side, warning_threshold]);

  // if the content is the same, return the previous reference; otherwise, update and return the new reference
  if (isEqual(prevResultRef.current, currentResult)) {
    return prevResultRef.current;
  }

  prevResultRef.current = currentResult;
  return currentResult;
};
