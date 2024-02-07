import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  API,
  OrderEntity,
  OrderSide,
  OrderType,
  SDKError,
} from "@orderly.network/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { Decimal, getPrecisionByNumber } from "@orderly.network/utils";
import { useMutation } from "../useMutation";
import { compose, head, includes, omit } from "ramda";
import {
  baseInputHandle,
  getCalculateHandler,
  orderEntityFormatHandle,
} from "../utils/orderEntryHelper";
import { useCollateral } from "./useCollateral";
import { useMaxQty } from "./useMaxQty";
import { OrderFactory, availableOrderTypes } from "../utils/createOrder";
import { useMarkPrice } from "./useMarkPrice";
import { order } from "@orderly.network/perp";
import { useEventEmitter } from "../useEventEmitter";
import { useDebouncedCallback } from "use-debounce";

export type UseOrderEntryOptions = {
  commify?: boolean;
  // Whether to observe the orderbook,  if it is a limit order, the orderbook will automatically calculate the est. liq. price when it is updated.
  watchOrderbook?: boolean;
  validate?: (
    data: OrderEntity
  ) => { [P in keyof OrderEntity]?: string } | null | undefined;
};

export type UseOrderEntryMetaState = {
  errors:
    | { [P in keyof OrderEntity]?: { type: string; message: string } }
    | null
    | undefined;
  dirty: { [P in keyof OrderEntity]?: boolean } | null | undefined;
  submitted: boolean;
};

export type UseOrderEntryReturn = {
  // Maximum open position
  maxQty: number;
  freeCollateral: number;
  markPrice: number;
  estLiqPrice?: number | null;
  estLeverage?: number | null;
  //@Deprecated
  onSubmit: (order: OrderEntity) => Promise<any>;
  submit: () => Promise<OrderEntity>;
  // order: data,
  submitting: boolean;
  formattedOrder: Partial<OrderEntity>;
  helper: {
    calculate: (
      values: Partial<OrderEntity>,
      field: keyof OrderEntity,
      value: any
    ) => Partial<OrderEntity>;
    validator: (values: Partial<OrderEntity>) => any;
    // clearErrors: () => void;
    // setValues: (values: Partial<OrderEntity>) => void;
  };
  // formState: any;
  metaState: UseOrderEntryMetaState;
  symbolConfig: API.SymbolExt;
};

type OrderParams = Required<
  Pick<OrderEntity, "side" | "order_type" | "symbol">
> &
  Partial<Omit<OrderEntity, "side" | "symbol" | "order_type">>;

/**
 * Create Order
 * @example
 * ```tsx
 * const { formattedOrder, onSubmit, helper } = useOrderEntry({
 *  symbol: "PERP_ETH_USDC",
 *  side: OrderSide.BUY,
 *  order_type: OrderType.LIMIT,
 *  order_price: 10000,
 *  order_quantity: 1,
 * });
 * ```
 */
export function useOrderEntry(
  order: OrderParams,
  options?: UseOrderEntryOptions
): UseOrderEntryReturn;
export function useOrderEntry(
  symbol: string,
  side: OrderSide,
  reduceOnly: boolean
): UseOrderEntryReturn;
export function useOrderEntry(
  symbolOrOrder: string | OrderParams,
  sideOrOptions?: OrderSide | UseOrderEntryOptions,
  reduceOnly?: boolean,
  options?: UseOrderEntryOptions
): UseOrderEntryReturn {
  // console.log("+++++++", symbolOrOrder);

  if (typeof symbolOrOrder === "object") {
    if (!symbolOrOrder.symbol) {
      throw new SDKError("symbol is required");
    }

    if (!symbolOrOrder.side) {
      throw new SDKError("Order side is required");
    }

    if (!symbolOrOrder.order_type) {
      throw new SDKError("order_type is required");
    }
  }

  const prevOrderData = useRef<Partial<OrderEntity> | null>(null);
  // Cache data from the last calculate
  const orderDataCache = useRef<Partial<OrderEntity> | null>(null);
  //
  const notSupportData = useRef<Partial<OrderEntity>>({});

  const [doCreateOrder, { data, error, reset, isMutating }] = useMutation<
    OrderEntity,
    any
  >(orderDataCache?.current?.isStopOrder ? "/v1/algo/order" : "/v1/order");

  const [errors, setErrors] = useState<any>(null);

  const ee = useEventEmitter();

  const fieldDirty = useRef<{ [K in keyof OrderEntity]?: boolean }>({});
  const submitted = useRef<boolean>(false);
  const askAndBid = useRef<number[]>([]); // 0: ask0, 1: bid0

  const onOrderbookUpdate = useDebouncedCallback((data: number[]) => {
    askAndBid.current = data;
  }, 200);

  const { freeCollateral, totalCollateral, positions, accountInfo } =
    useCollateral();

  const symbolInfo = useSymbolsInfo();
  // const tokenInfo = useTokenInfo();

  const symbol = useMemo(() => {
    if (typeof symbolOrOrder === "string") {
      return symbolOrOrder;
    }
    return symbolOrOrder.symbol!;
  }, [symbolOrOrder]);

  const optionsValue = useMemo(() => {
    if (typeof sideOrOptions === "object") {
      return sideOrOptions;
    }

    return options;
  }, [sideOrOptions]);

  const isReduceOnly = useMemo<boolean>(() => {
    if (typeof reduceOnly === "boolean") {
      return reduceOnly;
    }

    if (typeof symbolOrOrder === "object") {
      return !!symbolOrOrder.reduce_only;
    }

    return false;
  }, [symbolOrOrder, reduceOnly]);

  const sideValue = useMemo(() => {
    if (typeof symbolOrOrder === "object") {
      return symbolOrOrder.side;
    }

    // if (typeof sideOrOptions === "string") {
    return sideOrOptions as OrderSide;
    // }
  }, [symbolOrOrder, sideOrOptions]);

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
  // const markPrice = 1;

  const diffOrderEntry = (
    prev: Partial<OrderEntity>,
    current: Partial<OrderEntity>
  ): { key: keyof OrderEntity; value: any } | null => {
    if (!prev) return null;
    let key, value;
    const keys = Object.keys(current) as (keyof OrderEntity)[];

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      let preveValue = prev[k];
      let currentValue = current[k];

      if (
        typeof preveValue === "undefined" &&
        typeof currentValue === "undefined"
      )
        continue;

      // if (k === "order_quantity") {
      //   preveValue = Number(preveValue);
      //   currentValue = Number(currentValue);
      // }

      if (preveValue !== currentValue) {
        key = k;
        value = currentValue;
        break;
      }
    }

    if (!key) return null;

    return { key, value };
  };

  const maxQty = useMaxQty(symbol, sideValue, isReduceOnly);

  const parsedData = useMemo<OrderParams | null>(() => {
    if (typeof symbolOrOrder === "string") {
      return null;
    }
    // clean comma

    if (typeof symbolOrOrder.order_quantity === "string") {
      symbolOrOrder.order_quantity = symbolOrOrder.order_quantity.replace(
        /,/g,
        ""
      );
    }

    if (typeof symbolOrOrder.order_price === "string") {
      symbolOrOrder.order_price = symbolOrOrder.order_price.replace(/,/g, "");
    }

    if (typeof symbolOrOrder.total === "string") {
      symbolOrOrder.total = symbolOrOrder.total.replace(/,/g, "");
    }

    if (typeof symbolOrOrder.order_quantity === "number") {
      symbolOrOrder.order_quantity = new Decimal(symbolOrOrder.order_quantity)
        .toDecimalPlaces(baseDP)
        .toString();
    }

    return symbolOrOrder;
  }, [symbolOrOrder]);

  // const maxQty = 3;

  const createOrder = (values: Partial<OrderEntity>): Promise<OrderEntity> => {
    if (!values.symbol) {
      throw new SDKError("symbol is error");
    }

    if (!values.side) {
      throw new SDKError("side is error");
    }

    if (
      !values ||
      typeof values.order_type === "undefined" ||
      !includes(values.order_type, availableOrderTypes)
    ) {
      throw new SDKError("order_type is error");
    }

    const orderCreator = OrderFactory.create(
      values.order_type_ext ? values.order_type_ext : values.order_type
    );

    if (!orderCreator) {
      return Promise.reject(new SDKError("orderCreator is null"));
    }

    return new Promise((resolve, reject) => {
      return orderCreator
        .validate(values, {
          symbol: symbolInfo[symbol](),
          // token: tokenInfo[symbol](),
          maxQty,
          markPrice: markPrice,
        })
        .then((errors) => {
          submitted.current = true;

          if (
            errors.order_price ||
            errors.order_quantity ||
            errors.trigger_price
          ) {
            setErrors(errors);
            reject(
              errors.order_price?.message || errors.order_quantity?.message
            );
            // throw new SDKError(
            //   errors.order_price?.message ||
            //     errors.order_quantity?.message ||
            //     "order validation error"
            // );
          } else {
            const data = orderCreator.create(values as OrderEntity, {
              symbol: symbolInfo[symbol](),
              maxQty,
              markPrice: markPrice,
            });

            // console.log("------------------", values, data);

            return doCreateOrder(
              omit(["order_type_ext"], {
                // ...values,
                // ...omit(["order_price"], values),
                ...data,
              })
            ).then((res) => {
              // console.log("res::::", res);
              // resolve(res);
              if (res.success) {
                resolve(res.data);
              } else {
                reject(res);
              }
            }, reject);
          }
        });
    });
  };

  /**
   * submit form，validate values
   * @param values
   * @returns
   */
  const onSubmit = (values: OrderEntity) => {
    if (typeof reduceOnly === "boolean" && reduceOnly && !values.reduce_only) {
      return Promise.reject(
        new SDKError(
          "The reduceOny parameter of hook does not match your order data"
        )
      );
    }
    return createOrder({
      ...values,
      symbol,
    });
  };

  const submit = useCallback(() => {
    if (typeof symbolOrOrder === "string") {
      throw new SDKError("Function is not supported, please use onSubmit()");
    }
    return createOrder(symbolOrOrder);
  }, [symbolOrOrder]);

  const calculate = useCallback(
    (
      values: Partial<OrderEntity>,
      field: keyof OrderEntity,
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
    });
  };

  const formattedOrder = useMemo<Partial<OrderEntity>>(() => {
    if (!parsedData) {
      return notSupportData.current;
    }
    // prevOrderData.current = symbolOrOrder;

    if (!prevOrderData.current) {
      // prevOrderData.current = {
      //   ...symbolOrOrder,
      //   total: "",
      // };

      prevOrderData.current = parsedData;
      orderDataCache.current = {
        ...parsedData,
        total: "",
      };

      return orderDataCache.current as Partial<OrderEntity>;
    }

    // diff order entry
    const item = diffOrderEntry(prevOrderData.current, parsedData);

    // console.log(prevOrderData.current, symbolOrOrder, item);

    if (!item) {
      return orderDataCache.current as Partial<OrderEntity>;
    }

    // if(item.key === "reduce_only") {

    // }

    // if (
    //   item.key === "side" ||
    //   item.key === "symbol" ||
    //   item.key === "order_type"
    // ) {
    //   // side or symbol changed, reset errors and the data;
    //   prevOrderData.current = parsedData;
    //   orderDataCache.current = {
    //     ...parsedData,
    //     total: "",
    //   };

    //   return orderDataCache.current;
    // }

    // set field dirty
    if (typeof parsedData.order_price !== "undefined") {
      fieldDirty.current.order_price = true;
    }
    if (typeof parsedData.order_quantity !== "undefined") {
      fieldDirty.current.order_quantity = true;
    }

    const values = calculate(parsedData, item.key, item.value);

    values.isStopOrder = values.order_type?.startsWith("STOP") || false;

    // console.log("-----------", values);

    values.total = values.total || "";

    prevOrderData.current = parsedData;
    orderDataCache.current = values;

    return values;
  }, [
    parsedData?.order_price,
    parsedData?.side,
    parsedData?.order_quantity,
    parsedData?.visible_quantity,
    parsedData?.order_type,
    parsedData?.order_type_ext,
    parsedData?.symbol,
    parsedData?.total,
    parsedData?.reduce_only,
    parsedData?.trigger_price,

    markPrice,
  ]);

  /// validator order info
  useEffect(() => {
    if (!markPrice) return;
    // validate order data;
    validator(formattedOrder)?.then((err) => {
      setErrors(err);
    });
  }, [
    formattedOrder.broker_id,
    formattedOrder.order_quantity,
    formattedOrder.total,
    formattedOrder.trigger_price,
    markPrice,
  ]);

  //====== update orderbook ask0/bid0 ======
  useEffect(() => {
    if (!optionsValue?.watchOrderbook) return;
    ee.on("orderbook:update", onOrderbookUpdate);

    return () => {
      ee.off("orderbook_update", onOrderbookUpdate);
    };
  }, [optionsValue?.watchOrderbook]);

  useEffect(() => {
    askAndBid.current = [];
  }, [parsedData?.symbol]);

  //====== end ======

  const getPriceAndQty = (
    symbolOrOrder: OrderEntity
  ): { quantity: number; price: number } | null => {
    let quantity = Number(symbolOrOrder.order_quantity);
    const orderPrice = Number(symbolOrOrder.order_price);

    if (isNaN(quantity) || quantity <= 0 || askAndBid.current.length === 0)
      return null;
    if (
      (symbolOrOrder.order_type === OrderType.LIMIT ||
        symbolOrOrder.order_type === OrderType.STOP_LIMIT) &&
      isNaN(orderPrice)
    )
      return null;

    /**
     * price
     * if order_type = market order, 
        order side = long, then order_price_i = ask0
        order side = short, then order_price_i = bid0
      if order_type = limit order
        order side = long
          limit_price >= ask0, then order_price_i = ask0
          limit_price < ask0, then order_price_i = limit_price
        order side = short
          limit_price <= bid0, then order_price_i = bid0
          limit_price > ask0, then order_price_i = ask0
     */
    let price: number;

    if (
      symbolOrOrder.order_type === OrderType.MARKET ||
      symbolOrOrder.order_type === OrderType.STOP_MARKET
    ) {
      if (symbolOrOrder.side === OrderSide.BUY) {
        price = askAndBid.current[0];
      } else {
        price = askAndBid.current[1];
      }
    } else {
      // LIMIT order
      if (symbolOrOrder.side === OrderSide.BUY) {
        if (orderPrice >= askAndBid.current[0]) {
          price = askAndBid.current[0];
        } else {
          price = orderPrice;
        }
      } else {
        if (orderPrice <= askAndBid.current[1]) {
          price = askAndBid.current[1];
        } else {
          price = orderPrice;
        }
      }
    }

    if (symbolOrOrder.side === OrderSide.SELL) {
      quantity = -quantity;
    }

    return { price, quantity };
  };

  const estLiqPrice = useMemo(() => {
    if (!accountInfo || !parsedData || !markPrice) return null;

    const result = getPriceAndQty(formattedOrder as OrderEntity);
    if (result === null) return null;
    const { price, quantity } = result;
    if (!price || !quantity) return null;

    const liqPrice = order.estLiqPrice({
      markPrice,
      baseIMR,
      baseMMR,
      totalCollateral,
      positions,
      IMR_Factor: accountInfo["imr_factor"][symbol],
      newOrder: {
        qty: quantity,
        price,
        symbol: parsedData.symbol!,
      },
    });

    if (liqPrice <= 0) return null;

    return liqPrice;
  }, [
    markPrice,
    baseIMR,
    baseMMR,
    totalCollateral,
    formattedOrder?.order_price,
    formattedOrder?.order_quantity,
    formattedOrder?.total,
    formattedOrder?.trigger_price,
    accountInfo,
  ]);

  const estLeverage = useMemo(() => {
    if (!accountInfo || !parsedData) return null;
    const result = getPriceAndQty(formattedOrder as OrderEntity);
    if (result === null || !result.price || !result.quantity) return null;

    const leverage = order.estLeverage({
      totalCollateral,
      positions,
      newOrder: {
        symbol: parsedData.symbol,
        qty: result.quantity,
        price: result.price,
      },
    });

    return leverage;
  }, [
    baseIMR,
    baseMMR,
    totalCollateral,
    positions,
    formattedOrder?.order_price,
    formattedOrder?.order_quantity,
    formattedOrder?.total,
    formattedOrder?.trigger_price,
  ]);

  return {
    maxQty,
    freeCollateral,
    markPrice,
    onSubmit,
    submit,
    submitting: isMutating,
    formattedOrder,
    // errors,
    estLiqPrice,
    estLeverage,
    helper: {
      calculate,
      validator,
      // clearErrors,
    },
    metaState: {
      dirty: fieldDirty.current,
      submitted: submitted.current,
      errors,
    },
    symbolConfig: symbolInfo[symbol](),
  };
}
