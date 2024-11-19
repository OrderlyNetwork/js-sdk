import { useCallback, useEffect, useState } from "react";
import { VerifyResult } from "../../services/orderCreator/interface";
import { getOrderCreator } from "./helper";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import { OrderSide, SDKError } from "@orderly.network/types";
import { useMaxQty } from "../../orderly/useMaxQty";
import { useSymbolsInfo } from "../../orderly/useSymbolsInfo";

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
  }, [finalMaxQty, order.symbol]);

  const symbolInfo = useSymbolsInfo();

  const validate = () => {
    return new Promise<VerifyResult | null>(async (resolve, reject) => {
      const creator = getOrderCreator(order);
      const symbol = symbolInfo[order.symbol]();

      const errors = await creator?.validate(order, {
        symbol,
        maxQty,
        markPrice,
      });
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        setErrors(errors);

        reject(errors);
      }
      // create order
      const orderEntity = creator.create(order, {
        ...prepareData(),
        symbol,
      });
      resolve(orderEntity);
    });
  };

  useEffect(() => {
    validate();
  }, [order]);

  return {
    validate,
    errors,
  };
};
