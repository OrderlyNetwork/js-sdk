import { useMutation } from "../useMutation";
import { useCallback, useMemo } from "react";

import { API, OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { getPrecisionByNumber } from "@orderly.network/utils";

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

export interface OrderEntryReturn {
  onSubmit: (values: OrderEntity) => Promise<any>;
  // setValue: (field: OrderEntityKey, value: any) => void;
  maxQty: number;
  freeCollateral: number;
  // values: OrderEntity;
  markPrice: number;
  // errors: Partial<Record<keyof OrderEntity, string>>;

  symbolConfig: API.SymbolExt;

  //
  // onFocus?: (field: keyof OrderEntity) => void;
  // onBlur?: (field: keyof OrderEntity) => void;
  helper: {
    calculate: (values: any, field: string, value: any) => any;
    validator: (values: any) => any;
  };
}

export type UseOrderEntryOptions = {
  commify?: boolean;
  validate?: (
    data: OrderEntity
  ) => { [P in keyof OrderEntity]?: string } | null | undefined;
};

/**
 * 创建订单
 * @param symbol
 * @returns
 */
export const useOrderEntry = (
  symbol: string,
  side: OrderSide,
  reduceOnly: boolean = false,
  options?: UseOrderEntryOptions
): OrderEntryReturn => {
  // const { mutate } = useSWRConfig();
  const [doCreateOrder] = useMutation<OrderEntity, any>("/v1/order");

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

  //

  // 订阅maskPrice
  // const ws = useWebSocketClient();

  const { data: markPrice } = useMarkPrice(symbol);

  const maxQty = useMaxQty(
    symbol,
    side,
    // orderExtraValues.reduce_only
    reduceOnly
  );

  /**
   * 提交订单，校验数据
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
      throw new Error("order_type is error");
    }

    const orderCreator = OrderFactory.create(
      !!values!.order_type_ext ? values!.order_type_ext : values!.order_type
    );

    if (!orderCreator) {
      return Promise.reject(new Error("orderCreator is null"));
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
          throw new Error("orderCreator is null");
        }

        if (!symbol) {
          throw new Error("symbol is null");
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
    helper: {
      calculate,
      validator,
    },

    symbolConfig: symbolInfo[symbol](),
  };
};
