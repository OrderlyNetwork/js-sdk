import { useCallback, useMemo, useRef, useState } from "react";
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
import { order } from "@orderly.network/perp";

export type UseOrderEntryOptions = {
  commify?: boolean;
  // Whether to observe the orderbook,  if it is a limit order, the orderbook will automatically calculate the est. liq. price when it is updated.
  // watchOrderbook?: boolean;
  validate?: (
    data: OrderEntity
  ) => { [P in keyof OrderEntity]?: string } | null | undefined;
};

export type UseOrderEntryReturn = {
  // Maximum open position
  maxQty: number;
  freeCollateral: number;
  markPrice: number;
  onSubmit: (order: OrderEntity) => Promise<any>;
  // order: data,
  submitting: boolean;
  helper: {
    calculate: (
      values: Partial<OrderEntity>,
      field: string,
      value: any
    ) => Partial<OrderEntity>;
    validator: (values: Partial<OrderEntity>) => any;
    // watch: (
    //   handler: (values: OrderEntity) => void,
    //   options: {
    //     // Whether to observe the orderbook,  if it is a limit order,it will automatically calculate the est. liq. price when orderbook is updated.
    //     watchOrderbook?: boolean;
    //   }
    // ) => void;
  };
  symbolConfig: API.SymbolExt;
};

/**
 * Create Order
 * @param symbol
 * @returns
 */
export function useOrderEntry(
  symbol: string,
  side: OrderSide,
  order: Partial<OrderEntity>
): UseOrderEntryReturn;
export function useOrderEntry(
  symbol: string,
  side: OrderSide,
  reduceOnly: boolean
): UseOrderEntryReturn;
export function useOrderEntry(
  symbol: string,
  side: OrderSide,
  reduceOnlyOrOrder: boolean | Partial<OrderEntity> = false,
  options?: UseOrderEntryOptions
): UseOrderEntryReturn {
  const [doCreateOrder, { data, error, reset, isMutating }] = useMutation<
    OrderEntity,
    any
  >("/v1/order");

  const { freeCollateral, positions } = useCollateral();

  const [liqPrice, setLiqPrice] = useState<number | null>(null);

  const symbolInfo = useSymbolsInfo();
  // const tokenInfo = useTokenInfo();

  const watcher = useRef<{
    handler: (values: OrderEntity) => void;
    options: { watchOrderbook?: boolean };
  } | null>(null);

  const baseDP = useMemo(
    () => getPrecisionByNumber(symbolInfo[symbol]("base_tick", 0)),
    [symbolInfo]
  );
  const quoteDP = useMemo(() => {
    return getPrecisionByNumber(symbolInfo[symbol]("quote_tick", 0));
  }, [symbolInfo]);

  const baseIMR = useMemo(() => symbolInfo[symbol]("base_imr"), [symbolInfo]);
  const baseMMR = useMemo(() => symbolInfo[symbol]("base_mmr"), [symbolInfo]);

  const { data: markPrice } = useMarkPrice(symbol);

  const isReduceOnly = useMemo<boolean>(() => {
    if (typeof reduceOnlyOrOrder === "boolean") {
      return reduceOnlyOrOrder;
    }

    if (typeof reduceOnlyOrOrder === "object") {
      return !!reduceOnlyOrOrder.reduce_only;
    }

    return false;
  }, [reduceOnlyOrOrder]);

  const maxQty = useMaxQty(
    symbol,
    side,
    // orderExtraValues.reduce_only
    isReduceOnly
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

    if (reduceOnlyOrOrder && !values.reduce_only) {
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

  // const calulateEstData = (values: OrderEntity) => {
  //   console.log(
  //     "calulateEstData::::",
  //     values,
  //     baseIMR,
  //     baseMMR,
  //     freeCollateral,
  //     markPrice,
  //     positions
  //   );

  //   console.log("calulateEstData::::", estLiqPrice);
  // };

  const calculate = useCallback(
    (
      values: Partial<OrderEntity>,
      field: string,
      value: any
    ): Partial<OrderEntity> => {
      const fieldHandler = getCalculateHandler(field);
      const newValues = compose(
        head,
        orderEntityFormatHandle(baseDP, quoteDP),
        fieldHandler,
        baseInputHandle
      )([values, field, value, markPrice, { baseDP, quoteDP }]);

      return newValues as Partial<OrderEntity>;
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

  // const watch = (handler, options) => {
  //   if (typeof handler === "function") {
  //     watcher.current = {
  //       handler,
  //       options,
  //     };
  //   }
  // };

  // validator
  // helper: validator,formater,calculate
  return {
    maxQty,
    freeCollateral,
    markPrice,
    onSubmit,
    // order: data,
    submitting: isMutating,
    helper: {
      calculate,
      validator,
      // watch,
    },
    symbolConfig: symbolInfo[symbol](),
  };
}
