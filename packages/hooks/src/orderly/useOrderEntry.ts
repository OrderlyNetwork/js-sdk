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
  estLeverage?: number;
  //@Deprecated
  onSubmit: (order: OrderEntity) => Promise<any>;
  submit: () => Promise<any>;
  // order: data,
  submitting: boolean;
  formattedOrder: Partial<OrderEntity>;
  helper: {
    calculate: (
      values: Partial<OrderEntity>,
      field: string,
      value: any
    ) => Partial<OrderEntity>;
    validator: (values: Partial<OrderEntity>) => any;
    clearErrors: () => void;
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
 * @param symbol
 * @returns
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
  const [doCreateOrder, { data, error, reset, isMutating }] = useMutation<
    OrderEntity,
    any
  >("/v1/order");

  // console.log("+++++++", symbolOrOrder);

  if (typeof symbolOrOrder === "object") {
    if (!symbolOrOrder.symbol) {
      throw new SDKError("symbol is required");
    }

    if (!symbolOrOrder.side) {
      throw new SDKError("side is required");
    }

    if (!symbolOrOrder.order_type) {
      throw new SDKError("order_type is required");
    }
  }

  const prevOrderData = useRef<Partial<OrderEntity> | null>(null);
  const [errors, setErrors] = useState<any>(null);

  const ee = useEventEmitter();

  const fieldDirty = useRef<{ [K in keyof OrderEntity]?: boolean }>({});
  const submitted = useRef<boolean>(false);
  const askAndBid = useRef<number[]>([]);

  const onOrderbookUpdate = useDebouncedCallback((data: number[]) => {
    console.log("onOrderbookUpdate", data);
    askAndBid.current = data;
  }, 200);

  const { freeCollateral, totalCollateral, positions } = useCollateral();

  // const [liqPrice, setLiqPrice] = useState<number | null>(null);
  // const [leverage, setLeverage] = useState<number | null>(null);

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
      if (prev[k] !== current[k]) {
        key = k;
        value = current[k];
        break;
      }
    }

    if (!key) return null;

    return { key, value };
  };

  const maxQty = useMaxQty(symbol, sideValue, isReduceOnly);

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
      (values.order_type !== OrderType.MARKET &&
        values.order_type !== OrderType.LIMIT)
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
        ?.validate(values, {
          symbol: symbolInfo[symbol](),
          // token: tokenInfo[symbol](),
          maxQty,
          markPrice: markPrice,
        })
        .then((errors) => {
          submitted.current = true;

          if (errors.order_price || errors.order_quantity) {
            setErrors(errors);
            reject(errors);
          } else {
            const data = orderCreator.create(values as OrderEntity);

            return doCreateOrder({
              ...data,
              symbol: symbolOrOrder,
            }).then((res) => {
              console.log("res::::", res);
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
    return createOrder(values);
  };

  const submit = useCallback(() => {
    if (typeof symbolOrOrder === "string") {
      return;
    }
    return createOrder(symbolOrOrder);
  }, [symbolOrOrder]);

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
    });
  };

  const formattedOrder = useMemo(() => {
    if (typeof symbolOrOrder === "string") {
      return {};
    }

    if (!prevOrderData.current) {
      prevOrderData.current = {
        ...symbolOrOrder,
        total: "",
      };

      return prevOrderData.current;
    }

    // diff order entry
    const item = diffOrderEntry(prevOrderData.current, symbolOrOrder);

    if (!item) return prevOrderData.current;

    // set field dirty
    if (typeof symbolOrOrder.order_price !== "undefined") {
      fieldDirty.current.order_price = true;
    }
    if (typeof symbolOrOrder.order_quantity !== "undefined") {
      fieldDirty.current.order_quantity = true;
    }

    const values = calculate(prevOrderData.current, item.key, item.value);

    // console.log("-----------", values);

    prevOrderData.current = values;

    return values;
  }, [symbolOrOrder, markPrice]);

  useEffect(() => {
    // validate order data;
    validator(formattedOrder)?.then((err) => {
      setErrors(err);
      // let priceError = null,
      //   quantityError = null;
      // if (err?.order_price && fieldDirty.current.order_price) {
      //   priceError = err?.order_price;
      // }

      // if (err?.order_quantity && fieldDirty.current.order_quantity) {
      //   quantityError = err?.order_quantity;
      // }

      // setErrors({
      //   order_price: priceError,
      //   order_quantity: quantityError,
      // });
    });
  }, [formattedOrder, markPrice]);

  useEffect(() => {
    if (!optionsValue?.watchOrderbook) return;
    ee.on("orderbook:update", onOrderbookUpdate);

    return () => {
      ee.off("orderbook_update", onOrderbookUpdate);
    };
  }, [optionsValue?.watchOrderbook]);

  const estLiqPrice = useMemo(() => {
    if (typeof symbolOrOrder === "string") return null;
    // return order.estLiqPrice({
    //   markPrice,
    //   baseIMR,
    //   baseMMR,
    //   totalCollateral,
    //   positions,
    //   newOrder: {
    //     qty:  symbolOrOrder.order_quantity,
    //     price: symbolOrOrder.order_price,
    //     symbol: formattedOrder.symbol!,
    //   },
    // });
    return null;
  }, [markPrice, baseIMR, baseMMR, totalCollateral, symbolOrOrder]);

  const estLeverage = useMemo(() => {
    return 0;
  }, [markPrice, baseIMR, baseMMR, freeCollateral]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // console.log("++++++++", symbol);

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
      clearErrors,
    },
    metaState: {
      dirty: fieldDirty.current,
      submitted: submitted.current,
      errors,
    },
    symbolConfig: symbolInfo[symbol](),
  };
}
