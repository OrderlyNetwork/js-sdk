import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { produce } from "immer";
import { useDebouncedCallback } from "use-debounce";
import {
  SDKError,
  API,
  OrderlyOrder,
  OrderType,
  OrderLevel,
  TrackerEventName,
  OrderSide,
} from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { useAccountInfo } from "../../orderly/appStore";
import {
  useCollateral,
  useMaxQty,
  useSymbolsInfo,
} from "../../orderly/orderlyHooks";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import { usePositions } from "../../orderly/usePositionStream/usePosition.store";
import { OrderValidationResult } from "../../services/orderCreator/interface";
import { useEventEmitter } from "../../useEventEmitter";
import { useMutation } from "../../useMutation";
import { useTrack } from "../../useTrack";
import {
  calcEstLeverage,
  calcEstLiqPrice,
  getCreateOrderUrl,
  getOrderCreator,
  tpslFields,
  hasTPSL,
  isBBOOrder,
  getScaledOrderSkew,
} from "./helper";
import type { FullOrderState } from "./orderEntry.store";
import { useOrderEntryNextInternal } from "./useOrderEntry.internal";

type OrderEntryParameters = Parameters<typeof useOrderEntryNextInternal>;
type Options = Omit<OrderEntryParameters["1"], "symbolInfo">;

type OrderEntryReturn = {
  submit: (options?: { resetOnSuccess?: boolean }) => Promise<{
    success: boolean;
    data: Record<string, any>;
    timestamp: number;
  }>;
  reset: () => void;
  resetErrors: () => void;
  resetMetaState: () => void;
  formattedOrder: Partial<FullOrderState>;
  maxQty: number;
  /**
   * The estimated liquidation price.
   */
  estLiqPrice: number | null;
  /**
   * The estimated leverage after order creation.
   */
  estLeverage: number | null;
  estSlippage: number | null;
  helper: {
    /**
     * @deprecated Use `validate` instead.
     */
    validator: () => Promise<OrderValidationResult | null>;
    /**
     * Function to validate the order.
     * @returns {Promise<OrderValidationResult | null>} The validation result.
     */
    validate: () => Promise<OrderValidationResult | null>;
  };
  freeCollateral: number;
  /**
   * set a single value to the order data;
   * @param key
   * @param value
   * @returns
   */
  setValue: (
    key: keyof FullOrderState,
    value: any,
    options?: {
      shouldUpdateLastChangedField?: boolean;
    },
  ) => void;
  setValues: (values: Partial<FullOrderState>) => void;
  symbolInfo: API.SymbolExt;
  /**
   * Meta state including validation and submission status.
   */
  metaState: {
    dirty: { [K in keyof OrderlyOrder]?: boolean };
    submitted: boolean;
    validated: boolean;
    errors: OrderValidationResult | null;
  };
  /**
   * Indicates if a mutation (order creation) is in progress.
   */
  isMutating: boolean;

  markPrice: number | undefined;
};

/**
 * Custom hook for managing order entry in the Orderly application.
 *
 * @param {string} symbol - The symbol for which the order is being created. This parameter is required.
 *
 * @param {Options} options - Additional options for configuring the order entry.
 *
 * @returns {OrderEntryReturn} An object containing various actions and state related to order entry.
 *
 * @throws {Error} Throws an error if the symbol is not provided or is not a string.
 *
 * @example
 * ```typescript
 * const {
 *   submit,
 *   formattedOrder, //
 *   setValue,
 *   setValues,
 *   symbolInfo,
 *   metaState,
 *   isMutating,
 *  // maxQty, freeCollateral ... same as v1
 * } = useOrderEntry('BTC_USDC_PERP', options);
 *
 * // update the order type
 * setValue('order_type', OrderType.LIMIT);
 * // update the order price
 * setValue('order_price', '70000');
 * // update the order quantity
 * setValue('order_quantity', 1);
 *
 * // how to set TP/SL
 * setValue('tp_trigger_price', '71000'); // directly set TP trigger price
 * // or set the tp pnl, the TP trigger price will be calculated based on the current order price
 * // setValue('tp_pnl', '300'); // you can also set tp_offset or tp_offset_percentage, same as the usage of useTPSL hook;
 * // SL is similar to TP setting
 * setValue('sl_price', '69000');
 *
 * // Submit the order data to the backend, and reset the hook state after the order is successfully created.
 * // Note: If the order data is invalid, an error will be thrown.
 * // If you want to retain the current order data after a successful order creation,
 * // you can pass {resetOnSuccess: false} to `submit` function to prevent the hook from automatically resetting the order status.
 * // Of course, you can also call `reset()` to manually reset the order status and use `resetMetaState()` to clear the error state.
 * await submit();
 * ```
 */
const useOrderEntry = (
  symbol: string,
  options: Options = {},
): OrderEntryReturn => {
  if (!symbol) {
    throw new SDKError("Symbol is required");
  }

  const ee = useEventEmitter();
  const { track } = useTrack();

  const [meta, setMeta] = useState<{
    dirty: { [K in keyof OrderlyOrder]?: boolean };
    submitted: boolean;
    validated: boolean;
    errors: OrderValidationResult | null;
  }>({
    dirty: {},
    submitted: false,
    validated: false,
    errors: null,
  });

  const askAndBid = useRef<number[][]>([[]]); // [[ask0, bid0],...,[ask4,bid4]]
  const lastChangedField = useRef<keyof FullOrderState | undefined>();
  const lastOrderTypeExt = useRef<OrderType>();
  const lastLevel = useRef<OrderLevel>();

  const calculateTPSL_baseOn = useRef<{ tp: string; sl: string }>({
    tp: "",
    sl: "",
  });

  const actions = useMarkPriceActions();
  const symbolConfig = useSymbolsInfo();
  const accountInfo = useAccountInfo();
  const positions = usePositions();

  const symbolInfo: API.SymbolExt = symbolConfig[symbol]();
  const markPrice = actions.getMarkPriceBySymbol(symbol);

  const {
    formattedOrder,
    setValue: setValueInternal,
    setValues: setValuesInternal,
    validate,
    generateOrder,
    reset,
    // submit,
    ...orderEntryActions
  } = useOrderEntryNextInternal(symbol, {
    ...options,
    symbolInfo,
  });

  const [estSlippage, setEstSlippage] = useState<number | null>(null);

  const [doCreateOrder, { isMutating }] = useMutation<OrderlyOrder, any>(
    getCreateOrderUrl(formattedOrder),
  );

  const maxQty = useMaxQty(
    symbol,
    formattedOrder.side,
    formattedOrder.reduce_only,
  );

  const updateOrderPrice = () => {
    const order_type = formattedOrder.order_type;
    const order_type_ext =
      formattedOrder.order_type_ext ?? lastOrderTypeExt.current;
    const level = formattedOrder.level ?? lastLevel.current;

    const isBBO = isBBOOrder({ order_type, order_type_ext });

    if (!isBBO || level === undefined) {
      return;
    }

    lastOrderTypeExt.current = order_type_ext;
    lastLevel.current = level;

    const index = order_type_ext === OrderType.ASK ? 0 : 1;
    const price = askAndBid.current?.[level!]?.[index];
    if (price) {
      setValue("order_price", price, {
        shouldUpdateLastChangedField: false,
      });
    }
  };

  // update the order price by order book
  const updateOrderPriceByOrderBook = () => {
    const { order_type, order_type_ext } = formattedOrder;

    const isBBO = isBBOOrder({ order_type, order_type_ext });

    // only update the order price when last changed field is not total and the order type is bbo
    if (lastChangedField.current !== "total" && isBBO) {
      updateOrderPrice();
    }
  };

  const updateEstSlippage = (orderBook: any) => {
    if (
      formattedOrder.order_type !== OrderType.MARKET ||
      !formattedOrder.order_quantity
    ) {
      setEstSlippage(null);
      return;
    }
    const { order_quantity, side } = formattedOrder;

    // const avgExecutionPrice = orderBook;
    let avgExecutionPrice: Decimal | undefined;
    let book: any;
    const filledBorders: number[][] = [];
    let orderQuantity = new Decimal(order_quantity);

    if (side === OrderSide.BUY) {
      book = orderBook.asks.reverse();
    } else {
      book = orderBook.bids;
    }

    for (let i = 0; i < book.length; i++) {
      // console.log(book[i]);
      // const price = book[i][0];
      // const quantity = book[i][2];
      // if (quantity >= order_quantity) {
      //   avgExecutionPrice = price;
      //   break;
      // }
      const price = book[i][0];
      const quantity = book[i][1];
      if (isNaN(price) || isNaN(quantity)) {
        continue;
      }
      if (orderQuantity.gt(quantity)) {
        orderQuantity = orderQuantity.minus(quantity);
        filledBorders.push([price, quantity]);
      } else {
        filledBorders.push([price, orderQuantity.toNumber()]);
        break;
      }
    }

    if (filledBorders.length > 0) {
      const sumPrice = filledBorders.reduce((acc, curr) => {
        return acc.plus(new Decimal(curr[0]).mul(curr[1]));
      }, zero);

      avgExecutionPrice = sumPrice.div(order_quantity);
    }

    if (avgExecutionPrice) {
      const bestPrice = book[0][0];
      const estSlippage = avgExecutionPrice
        .minus(bestPrice)
        .abs()
        .div(bestPrice)
        .toNumber();
      setEstSlippage(estSlippage);
    }
  };

  useEffect(() => {
    // when BBO type change, it will change order price
    updateOrderPrice();
  }, [formattedOrder.order_type_ext, formattedOrder.level]);

  const onOrderBookUpdate = useDebouncedCallback((data: any) => {
    const parsedData = [
      [data.asks?.[data.asks.length - 1]?.[0], data.bids?.[0]?.[0]],
      [data.asks?.[data.asks.length - 2]?.[0], data.bids?.[1]?.[0]],
      [data.asks?.[data.asks.length - 3]?.[0], data.bids?.[2]?.[0]],
      [data.asks?.[data.asks.length - 4]?.[0], data.bids?.[3]?.[0]],
      [data.asks?.[data.asks.length - 5]?.[0], data.bids?.[4]?.[0]],
    ];
    askAndBid.current = parsedData;
    updateOrderPriceByOrderBook();
    updateEstSlippage(data);
  }, 200);

  /**
   * TODO: remove this when orderBook calc is moved to the calculation service
   */
  useEffect(() => {
    ee.on("orderbook:update", onOrderBookUpdate);

    return () => {
      ee.off("orderbook:update", onOrderBookUpdate);
    };
  }, []);

  useEffect(() => {
    // console.log("markPrice", markPrice);

    if (
      (formattedOrder.order_type === OrderType.MARKET ||
        formattedOrder.order_type === OrderType.STOP_MARKET) &&
      markPrice
    ) {
      const baseOn = new Set<string>();
      if (lastChangedField.current) {
        baseOn.add(lastChangedField.current);
      }
      if (calculateTPSL_baseOn.current.tp) {
        baseOn.add(calculateTPSL_baseOn.current.tp);
      }
      if (calculateTPSL_baseOn.current.sl) {
        baseOn.add(calculateTPSL_baseOn.current.sl);
      }
      orderEntryActions.onMarkPriceChange(markPrice, Array.from(baseOn));
    }
  }, [markPrice, formattedOrder.order_type]);

  const prepareData = useCallback(() => {
    return {
      markPrice: actions.getMarkPriceBySymbol(symbol),
      maxQty,
      estSlippage,
      askAndBid: askAndBid.current?.[0] || [],
    };
  }, [maxQty, symbol, estSlippage]);

  const interactiveValidate = (order: Partial<OrderlyOrder>) => {
    validateFunc(order).then((errors) => {
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        setMeta(
          produce((draft) => {
            draft.errors = errors;
          }),
        );
      } else {
        setMeta(
          produce((draft) => {
            draft.errors = null;
          }),
        );
      }
    });
  };

  const canSetTPSLPrice = (
    key: keyof OrderlyOrder,
    value: any,
    orderType: OrderType,
  ) => {
    if (
      tpslFields.includes(key) &&
      value !== "" &&
      value !== undefined &&
      value !== null &&
      orderType !== OrderType.LIMIT &&
      orderType !== OrderType.MARKET
    ) {
      console.warn("Only limit order can be set tp/sl");
      return false;
    }

    return true;
  };

  const setValue = (
    key: keyof FullOrderState,
    value: any,
    options?: {
      shouldUpdateLastChangedField?: boolean;
      shouldUpdateDirty?: boolean;
    },
  ) => {
    const { shouldUpdateLastChangedField = true, shouldUpdateDirty = true } =
      options || {};
    if (!canSetTPSLPrice(key, value, formattedOrder.order_type)) {
      return;
    }
    // fieldDirty.current[key] = true;
    if (shouldUpdateDirty) {
      setMeta(
        produce((draft) => {
          draft.dirty[key] = true;
        }),
      );
    }

    const values = setValueInternal(key, value, prepareData());

    if (values) {
      interactiveValidate(values);
    }

    if (shouldUpdateLastChangedField) {
      if (key.startsWith("tp_")) {
        calculateTPSL_baseOn.current.tp = key;
      } else if (key.startsWith("sl_")) {
        calculateTPSL_baseOn.current.sl = key;
      }

      lastChangedField.current = key;
    }
  };

  const setValues = (values: Partial<FullOrderState>) => {
    if (
      !Object.keys(values).every((key) =>
        canSetTPSLPrice(
          key as keyof FullOrderState,
          values[key as keyof FullOrderState],
          formattedOrder.order_type,
        ),
      )
    ) {
      return;
    }

    const newValues = setValuesInternal(values, prepareData());
    if (newValues) {
      interactiveValidate(newValues);
    }
  };

  async function validateFunc(order: Partial<OrderlyOrder>) {
    const creator = getOrderCreator(order);

    return validate(order, creator, prepareData());
  }

  /**
   * Validate the order
   * TODO: confirm validate result return order
   */
  const validateOrder = (): Promise<OrderValidationResult | null> => {
    return new Promise<OrderValidationResult | null>(
      async (resolve, reject) => {
        const creator = getOrderCreator(formattedOrder);

        console.log("valudate order", creator);
        const errors = await validate(formattedOrder, creator, prepareData());
        console.log("validate order errors", errors);
        const keys = Object.keys(errors);
        if (keys.length > 0) {
          // setErrors(errors);
          setMeta(
            produce((draft) => {
              draft.errors = errors;
            }),
          );
          if (!meta.validated) {
            // setMeta((prev) => ({ ...prev, validated: true }));
            setMeta(
              produce((draft) => {
                draft.validated = true;
              }),
            );
          }
          reject(errors);
        }
        // create order
        const order = generateOrder(creator, prepareData());
        resolve(order);
      },
    );
  };

  const { freeCollateral, totalCollateral } = useCollateral();

  // TODO: move to the calculation service
  const estLiqPrice = useMemo(() => {
    const markPrice = actions.getMarkPriceBySymbol(symbol);
    if (!markPrice || !accountInfo || !symbolInfo) {
      return null;
    }

    const orderQuantity = Number(formattedOrder.order_quantity);

    if (orderQuantity === 0 || orderQuantity > maxQty) {
      return null;
    }

    const estLiqPrice = calcEstLiqPrice(formattedOrder, askAndBid.current[0], {
      markPrice,
      totalCollateral,
      futures_taker_fee_rate: accountInfo.futures_taker_fee_rate,
      imr_factor: accountInfo.imr_factor[symbol],
      symbol,
      positions,
      symbolInfo,
    });

    return estLiqPrice;
  }, [
    formattedOrder,
    accountInfo,
    positions,
    totalCollateral,
    symbol,
    maxQty,
    symbolInfo,
  ]);

  const estLeverage = useMemo(() => {
    if (!symbolInfo) {
      return null;
    }

    const orderQuantity = Number(formattedOrder.order_quantity);

    if (orderQuantity === 0 || orderQuantity > maxQty) {
      return null;
    }

    return calcEstLeverage(formattedOrder, askAndBid.current[0], {
      totalCollateral,
      positions,
      symbol,
      symbolInfo,
    });
  }, [
    formattedOrder,
    accountInfo,
    positions,
    totalCollateral,
    symbol,
    maxQty,
    symbolInfo,
  ]);

  const resetErrors = () => {
    setMeta(
      produce((draft) => {
        draft.errors = null;
      }),
    );
  };

  const resetMetaState = () => {
    setMeta(
      produce((draft) => {
        draft.errors = null;
        draft.submitted = false;
        draft.validated = false;
        draft.dirty = {};
      }),
    );
  };

  const submitOrder = async (options?: {
    /**
     * reset the order state after order create success
     * default is true
     */
    resetOnSuccess?: boolean;
  }) => {
    /**
     * validate order
     */
    const creator = getOrderCreator(formattedOrder);
    const errors = await validate(formattedOrder, creator, prepareData());
    const { resetOnSuccess = true } = options || {};
    // setMeta((prev) => ({ ...prev, submitted: true, validated: true }));
    setMeta(
      produce((draft) => {
        draft.submitted = true;
        draft.validated = true;
      }),
    );
    if (Object.keys(errors).length > 0) {
      setMeta(
        produce((draft) => {
          draft.errors = errors;
        }),
      );
      throw new SDKError("Order validation failed");
    }

    const order = generateOrder(creator, prepareData());
    console.log("xxx -- order", order);

    const isScaledOrder = order.order_type === OrderType.SCALED;

    const params = isScaledOrder ? { orders: order.orders } : order;

    const result = await doCreateOrder(params);

    if (result.success) {
      let trackParams: any = {
        side: order.side,
        order_type: order.order_type,
        tp_sl: hasTPSL(formattedOrder),
        symbol: order.symbol,
      };

      if (isScaledOrder) {
        const skew = getScaledOrderSkew({
          skew: order.skew,
          distribution_type: order.distribution_type,
          total_orders: order.total_orders,
        });
        trackParams = {
          ...trackParams,
          order_type: "scaled",
          distribution_type: order.distribution_type,
          skew: new Decimal(skew).todp(2).toNumber(),
          total_orders: order.total_orders,
        };
      }

      track(TrackerEventName.placeOrderSuccess, trackParams);
    }

    if (result.success && resetOnSuccess) {
      reset();
      resetMetaState();
    }
    return result;
  };

  // reset error state when order type change
  useEffect(() => {
    resetMetaState();
  }, [formattedOrder.order_type]);

  return {
    ...orderEntryActions,
    submit: submitOrder,
    reset,
    resetErrors,
    resetMetaState,
    formattedOrder,
    maxQty,
    estLiqPrice,
    estLeverage,
    estSlippage,
    helper: {
      /**
       * @deprecated use validate instead
       */
      validator: validateOrder,
      validate: validateOrder,
    },
    freeCollateral,
    setValue,
    setValues,
    symbolInfo: symbolInfo || {},
    metaState: meta,
    isMutating,
    markPrice,
  };
};

export { useOrderEntry };
