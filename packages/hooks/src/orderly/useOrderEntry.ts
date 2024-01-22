import { useCallback, useMemo } from "react";
import {
  API,
  OrderEntity,
  OrderSide,
  OrderType,
  SDKError,
} from "@orderly.network/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { getPrecisionByNumber } from "@orderly.network/utils";
import { useMutation } from "../useMutation";
import { compose, head } from "ramda";
import {
  baseInputHandle,
  getCalculateHandler,
  orderEntityFormatHandle,
} from "../utils/orderEntryHelper";
import { useCollateral } from "./useCollateral";
import { useMaxQty } from "./useMaxQty";
import { OrderFactory } from "../utils/createOrder";
import { useMarkPrice } from "./useMarkPrice";

export type UseOrderEntryOptions = {
  commify?: boolean;
  validate?: (
    data: OrderEntity
  ) => { [P in keyof OrderEntity]?: string } | null | undefined;
};

/**
 * Create Order
 * @param symbol
 * @returns
 */
export const useOrderEntry = (
  symbol: string,
  side: OrderSide,
  reduceOnly: boolean = false,
  options?: UseOrderEntryOptions
) => {
  const [doCreateOrder, { data, error, reset, isMutating }] = useMutation<
    OrderEntity,
    any
  >("/v1/order");

  const { freeCollateral } = useCollateral();

  const symbolInfo = useSymbolsInfo();
  // const tokenInfo = useTokenInfo();

  const baseDP = useMemo(
    () => getPrecisionByNumber(symbolInfo[symbol]("base_tick", 0)),
    [symbolInfo]
  );
  const quoteDP = useMemo(() => {
    return getPrecisionByNumber(symbolInfo[symbol]("quote_tick", 0));
  }, [symbolInfo]);

  const { data: markPrice } = useMarkPrice(symbol);

  const maxQty = useMaxQty(
    symbol,
    side,
    // orderExtraValues.reduce_only
    reduceOnly
  );

  /**
   * submit form，validate values
   * @param values
   * @returns
   */
  const onSubmit = (values: OrderEntity) => {
    if (
      !values ||
      typeof values.order_type === "undefined" ||
      (values.order_type !== OrderType.MARKET &&
        values.order_type !== OrderType.LIMIT)
    ) {
      throw new SDKError("order_type is error");
    }

    const orderCreator = OrderFactory.create(
      !!values!.order_type_ext ? values!.order_type_ext : values!.order_type
    );

    if (!orderCreator) {
      return Promise.reject(new SDKError("orderCreator is null"));
    }

    if (reduceOnly && !values.reduce_only) {
      return Promise.reject(
        new SDKError(
          "The reduceOny parameter of hook does not match your order data"
        )
      );
    }

    return orderCreator
      ?.validate(values, {
        symbol: symbolInfo[symbol](),
        // token: tokenInfo[symbol](),
        maxQty,
        markPrice: markPrice,
      })
      .then(() => {
        if (!orderCreator) {
          throw new SDKError("orderCreator is null");
        }

        if (!symbol) {
          throw new SDKError("symbol is null");
        }

        const data = orderCreator.create(values!);

        return doCreateOrder({
          ...data,
          symbol,
        });
      });
  };

  const calculate = useCallback(
    (values: any, field: string, value: any) => {
      const fieldHandler = getCalculateHandler(field);
      const newValues = compose(
        head,
        orderEntityFormatHandle(baseDP, quoteDP),
        fieldHandler,
        baseInputHandle
      )([values, field, value, markPrice, { baseDP, quoteDP }]);

      return newValues;
    },
    [markPrice]
  );

  // const estLiqPrice = useMemo(() => {}, []);

  const validator = (values: any) => {
    const creator = OrderFactory.create(values.order_type);

    return creator?.validate(values, {
      symbol: symbolInfo[symbol](),
      // token: tokenInfo[symbol](),
      maxQty,
      markPrice: markPrice,
    }) as any;
  };

  // validator
  // helper: validator,formater,calculate
  return {
    maxQty,
    freeCollateral,
    markPrice,
    onSubmit,
    submitting: isMutating,
    helper: {
      calculate,
      validator,
    },
    symbolConfig: symbolInfo[symbol](),
  };
};
