import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  estLiqPrice?: number;
  estLeverage?: number;
  onSubmit: (order: OrderEntity) => Promise<any>;
  // order: data,
  submitting: boolean;
  formattedOrder: Partial<OrderEntity>;
  errors: { [P in keyof OrderEntity]?: string } | null | undefined;
  helper: {
    calculate: (
      values: Partial<OrderEntity>,
      field: string,
      value: any
    ) => Partial<OrderEntity>;
    validator: (values: Partial<OrderEntity>) => any;
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

  console.log("+++++++", reduceOnlyOrOrder);

  const prevOrderData = useRef<Partial<OrderEntity>>({});

  // const { freeCollateral, positions } = useCollateral();

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

  // const { data: markPrice } = useMarkPrice(symbol);
  const markPrice = 1;

  const isReduceOnly = useMemo<boolean>(() => {
    if (typeof reduceOnlyOrOrder === "boolean") {
      return reduceOnlyOrOrder;
    }

    if (typeof reduceOnlyOrOrder === "object") {
      return !!reduceOnlyOrOrder.reduce_only;
    }

    return false;
  }, [reduceOnlyOrOrder]);

  const newOrder =
    typeof reduceOnlyOrOrder === "object" ? reduceOnlyOrOrder : null;

  const diffOrderEntry = (
    prev: Partial<OrderEntity>,
    current: Partial<OrderEntity>
  ): { key: keyof OrderEntity; value: any } | null => {
    let key, value;
    const keys = Object.keys(current) as (keyof OrderEntity)[];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      console.log("?????", k, prev[k], current[k]);
      if (prev[k] !== current[k]) {
        key = k;
        value = current[k];
        break;
      }
    }

    console.log("==============diffOrderEntry:::", key, value);

    if (!key) return null;

    return { key, value };
  };

  // const maxQty = useMaxQty(
  //   symbol,
  //   side,
  //   // orderExtraValues.reduce_only
  //   isReduceOnly
  // );

  const maxQty = 1;

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

  const formattedOrder = useMemo(() => {
    if (typeof reduceOnlyOrOrder === "boolean") {
      return {};
    }

    // diff order entry
    const item = diffOrderEntry(prevOrderData.current, reduceOnlyOrOrder);

    console.log("diffOrderEntry:::", item);

    if (!item) return reduceOnlyOrOrder;

    const values = calculate(reduceOnlyOrOrder, item.key, item.value);

    prevOrderData.current = values;

    return values;
  }, [reduceOnlyOrOrder]);

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
    freeCollateral: 0,
    markPrice,
    onSubmit,
    // order: data,
    submitting: isMutating,
    formattedOrder,
    errors: {},
    helper: {
      calculate,
      validator,
      // watch,
    },
    symbolConfig: symbolInfo[symbol](),
  };
}
