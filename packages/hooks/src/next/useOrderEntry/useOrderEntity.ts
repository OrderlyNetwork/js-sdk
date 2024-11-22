import { useCallback, useEffect, useState } from "react";
import { VerifyResult } from "../../services/orderCreator/interface";
import { getOrderCreator } from "./helper";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import { OrderSide, SDKError } from "@orderly.network/types";
import { useMaxQty } from "../../orderly/useMaxQty";
import { useSymbolsInfo } from "../../orderly/useSymbolsInfo";
import { useThrottledCallback } from "use-debounce";

export const useOrderEntity = (
  order: {
    symbol: string;
    side: OrderSide;
    reduce_only?: boolean;
    [key: string]: any;
  },
  options?: {
    maxQty?: number;
  }
) => {
  if (!order.symbol) {
    throw new SDKError("symbol is required");
  }
  const [errors, setErrors] =
    useState<
      Partial<Record<keyof typeof order, { type: string; message: string }>>
    >();

  const maxQty = useMaxQty(order.symbol, order.side, order.reduce_only);
  const finalMaxQty = options?.maxQty ?? maxQty;

  const actions = useMarkPriceActions();
  const markPrice = actions.getMarkPriceBySymbol(order.symbol);
  const prepareData = useCallback(() => {
    return {
      markPrice: actions.getMarkPriceBySymbol(order.symbol),
      maxQty: finalMaxQty,
    };
  }, [finalMaxQty, order.symbol, order]);

  const symbolInfo = useSymbolsInfo();

  const validate = () => {
    return new Promise<VerifyResult | null>(async (resolve, reject) => {
      const creator = getOrderCreator(order);
      const _symbol = symbolInfo[order.symbol]();

      const errors = await creator?.validate(order, {
        symbol: _symbol,
        maxQty: finalMaxQty,
        markPrice,
      });
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        setErrors(errors);

        reject(errors);
      } else {
        setErrors({});
      }
      // create order
      const orderEntity = creator.create(order, {
        ...prepareData(),
        symbol: _symbol,
      });
      resolve(orderEntity);
    });
  };

  const autoCheck = useThrottledCallback(
    () => {
      validate().then(
        () => {},
        (reject) => {}
      );
    },
    50,
    {}
  );

  useEffect(() => {
    autoCheck();
  }, [order.order_price, order.order_quantity, order.trigger_price]);

  return {
    validate,
    errors,
    markPrice,
    symbolInfo,
  };
};
